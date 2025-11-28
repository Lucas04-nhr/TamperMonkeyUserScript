// ==UserScript==
// @name         npmmirror CORS Bypass for Lobe Chat self-hosted
// @author       Lucas
// @namespace    https://lobe.lucas04.top/
// @version      0.1
// @description  拦截并代理 https://registry.npmmirror.com/* 所有fetch和XHR请求，绕过CORS
// @match        https://lobe.lucas04.top/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

// 代理fetch
(function() {
  const npmmirrorHost = 'https://registry.npmmirror.com';

  // 代理fetch
  const originalFetch = window.fetch;
  window.fetch = function(input, init = {}) {
    let url = typeof input === 'string' ? input : input.url;

    if (url.startsWith(npmmirrorHost)) {
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: (init && init.method) || "GET",
          url: url,
          headers: init && init.headers,
          data: init && init.body,
          responseType: 'arraybuffer', // 可以支持二进制等
          onload: function(response) {
            // 模拟Fetch Response对象
            let headers = new Headers();
            if (response.responseHeaders) {
              response.responseHeaders.split("\r\n").forEach(line => {
                let i = line.indexOf(':');
                if (i > 0)
                  headers.append(line.substring(0, i).trim(), line.substring(i + 1).trim());
              });
            }
            const body = response.response;
            resolve(new Response(body, {
              status: response.status,
              statusText: response.statusText,
              headers: headers
            }));
          },
          onerror: reject,
          ontimeout: reject
        });
      });
    } else {
      return originalFetch(input, init);
    }
  };

  // 代理XMLHttpRequest（简单方式，fetch已能覆盖绝大部分现代代码，若要深入可继续完善）
  // 这里不做全面劫持，如有多处 xhr 问题可再拓展

  console.log('[Tampermonkey CORS] npmmirror代理已注入');
})();
