// ==UserScript==
// @name         OWA Search History Blocker
// @namespace    https://webmail.ku.dk/
// @version      0.2.0
// @description  Blocks every OWA request that writes SearchHistory, and clears the saved history on load and when the tab is hidden or closed
// @match        https://webmail.ku.dk/owa/*
// @run-at       document-start
// @grant        none
// @sandbox      raw
// ==/UserScript==

(function () {
  'use strict';

  const MARK = 'SearchHistory';
  const LOG = '[OWA-SHB]';
  const CONFIG_NAME = 'OWA.ViewStateConfiguration';
  const CONFIG_FOLDER = 'root';
  const EWS_URL = location.origin + '/EWS/Exchange.asmx';
  const T = 'http://schemas.microsoft.com/exchange/services/2006/types';

  // Keep the originals before hooking, so the clearing code below is never blocked by itself.
  const origFetch = window.fetch.bind(window);
  const origOpen = XMLHttpRequest.prototype.open;
  const origSetHeader = XMLHttpRequest.prototype.setRequestHeader;
  const origSend = XMLHttpRequest.prototype.send;
  const origBeacon = navigator.sendBeacon ? navigator.sendBeacon.bind(navigator) : null;

  const FAKE_OK = JSON.stringify({ Body: { ResponseClass: 'Success', ResponseCode: 'NoError' } });

  // ---------- Detection ----------

  const decode = (s) => { try { return decodeURIComponent(s || ''); } catch { return s || ''; } };

  function bodyText(b) {
    if (b == null) return '';
    if (typeof b === 'string') return b;
    if (b instanceof URLSearchParams) return b.toString();
    return ''; // Blob, FormData, ArrayBuffer: not inspected
  }

  function isOwaWrite(url, urlPostData, body) {
    if (!/\/owa\/service\.svc|\/EWS\//i.test(url)) return false;
    // Requests never need to mention SearchHistory to read it; only writes carry it.
    return (decode(urlPostData) + '\n' + bodyText(body)).includes(MARK);
  }

  function report(kind, url, urlPostData, body) {
    console.warn(LOG, 'blocked', kind, url,
      '\nX-OWA-UrlPostData:', decode(urlPostData).slice(0, 1000),
      '\nbody:', bodyText(body).slice(0, 1000));
  }

  // ---------- XHR hook (OWA uses XHR for service.svc) ----------

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.__shb = { url: String(url), post: '' };
    return origOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
    if (this.__shb && /^x-owa-urlpostdata$/i.test(name)) this.__shb.post = value;
    return origSetHeader.call(this, name, value);
  };

  XMLHttpRequest.prototype.send = function (body) {
    const s = this.__shb;
    if (s && isOwaWrite(s.url, s.post, body)) {
      report('XHR', s.url, s.post, body);
      fakeXhrSuccess(this);
      return;
    }
    return origSend.call(this, body);
  };

  // Makes a blocked XHR look like it succeeded, so OWA does not retry or show an error.
  function fakeXhrSuccess(xhr) {
    const def = (k, v) => Object.defineProperty(xhr, k, { configurable: true, get: () => v });
    setTimeout(() => {
      def('readyState', 4);
      def('status', 200);
      def('statusText', 'OK');
      def('responseText', FAKE_OK);
      def('response', xhr.responseType === 'json' ? JSON.parse(FAKE_OK) : FAKE_OK);
      def('responseURL', xhr.__shb.url);
      xhr.getResponseHeader = (n) => (/^content-type$/i.test(n) ? 'application/json; charset=utf-8' : null);
      xhr.getAllResponseHeaders = () => 'content-type: application/json; charset=utf-8\r\n';
      for (const t of ['readystatechange', 'load', 'loadend']) xhr.dispatchEvent(new Event(t));
    }, 0);
  }

  // ---------- fetch and sendBeacon hooks ----------

  function headerValue(h, name) {
    if (!h) return '';
    if (h instanceof Headers) return h.get(name) || '';
    const pairs = Array.isArray(h) ? h : Object.entries(h);
    const hit = pairs.find(([k]) => String(k).toLowerCase() === name);
    return hit ? hit[1] : '';
  }

  window.fetch = function (input, init) {
    try {
      const req = input instanceof Request ? input : null;
      const url = req ? req.url : String(input);
      const headers = (init && init.headers) || (req && req.headers);
      const post = headerValue(headers, 'x-owa-urlpostdata');
      if (isOwaWrite(url, post, init && init.body)) {
        report('fetch', url, post, init && init.body);
        return Promise.resolve(new Response(FAKE_OK, {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        }));
      }
    } catch (e) {
      console.warn(LOG, 'fetch hook error', e);
    }
    return origFetch(input, init);
  };

  if (origBeacon) {
    navigator.sendBeacon = function (url, data) {
      if (isOwaWrite(String(url), '', data)) {
        report('beacon', String(url), '', data);
        return true;
      }
      return origBeacon(url, data);
    };
  }

  // ---------- Clearing the stored history ----------

  // Only the top window clears, so OWA's iframes do not each send their own requests.
  if (window.top !== window) return;

  async function ews(body, keepalive) {
    const res = await origFetch(EWS_URL, {
      method: 'POST',
      credentials: 'include',
      keepalive,
      headers: { 'Content-Type': 'text/xml; charset=utf-8' },
      body: `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types"
  xmlns:m="http://schemas.microsoft.com/exchange/services/2006/messages">
<soap:Header><t:RequestServerVersion Version="Exchange2013"/></soap:Header>
<soap:Body>${body}</soap:Body></soap:Envelope>`,
    });
    const text = await res.text();
    if (!res.ok || !text.includes('ResponseClass="Success"')) {
      throw new Error(`EWS ${res.status}: ${text.slice(0, 300)}`);
    }
    return text;
  }

  let busy = false;
  let lastRun = 0;

  // Reads the config fresh, removes the SearchHistory entry, writes the rest back unchanged.
  // Reading right before writing avoids overwriting other view-state changes with a stale copy.
  async function clearHistory(keepalive) {
    if (busy || Date.now() - lastRun < 10000) return;
    busy = true;
    lastRun = Date.now();
    try {
      const xml = await ews(`<m:GetUserConfiguration>
    <m:UserConfigurationName Name="${CONFIG_NAME}">
      <t:DistinguishedFolderId Id="${CONFIG_FOLDER}"/>
    </m:UserConfigurationName>
    <m:UserConfigurationProperties>Dictionary</m:UserConfigurationProperties>
  </m:GetUserConfiguration>`, keepalive);

      const doc = new DOMParser().parseFromString(xml, 'text/xml');
      const dict = doc.getElementsByTagNameNS(T, 'Dictionary')[0];
      if (!dict) return;

      const entry = [...dict.getElementsByTagNameNS(T, 'DictionaryEntry')].find((e) => {
        const key = e.getElementsByTagNameNS(T, 'DictionaryKey')[0];
        const v = key && key.getElementsByTagNameNS(T, 'Value')[0];
        return v && v.textContent === MARK;
      });
      if (!entry) return; // already empty
      const values = entry.getElementsByTagNameNS(T, 'Value');
      // The key itself is one Value element; anything beyond it is a stored search.
      if (values.length <= 1) return;

      entry.remove();
      await ews(`<m:UpdateUserConfiguration>
    <m:UserConfiguration>
      <t:UserConfigurationName Name="${CONFIG_NAME}">
        <t:DistinguishedFolderId Id="${CONFIG_FOLDER}"/>
      </t:UserConfigurationName>
      ${new XMLSerializer().serializeToString(dict)}
    </m:UserConfiguration>
  </m:UpdateUserConfiguration>`, keepalive);
      console.info(LOG, 'stored search history cleared');
    } catch (e) {
      console.warn(LOG, 'clear failed', e);
    } finally {
      busy = false;
    }
  }

  // On load: clear anything left from earlier sessions or other devices.
  clearHistory(false);

  // Before the tab goes away. visibilitychange fires first and leaves the most time;
  // keepalive lets the requests outlive the page. Best effort: if the second request
  // does not make it out, the next load clears instead.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') clearHistory(true);
  });
  window.addEventListener('pagehide', () => clearHistory(true));
})();
