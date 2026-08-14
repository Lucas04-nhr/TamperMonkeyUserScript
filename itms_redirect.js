// ==UserScript==
// @name         App Store Link Redirect
// @namespace    http://tampermonkey.net/
// @version      1.3.2
// @description  Redirect App Store web links with the native deeplink for the current Apple device.
// @author       Lucas
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @license      AGPLv3
// @icon        https://www.apple.com/favicon.ico
// ==/UserScript==

(function () {
  "use strict";

  const STORAGE_KEY_REDIRECT_ENABLED = "isRedirectEnabled";
  let isRedirectEnabled = GM_getValue(STORAGE_KEY_REDIRECT_ENABLED, true);

  const COMMON_REGIONS = [
    { name: "China Mainland", cc: "CN", dsf: "143465" },
    { name: "Denmark", cc: "DK", dsf: "143458" },
    { name: "Hong Kong", cc: "HK", dsf: "143463" },
    { name: "Japan", cc: "JP", dsf: "143462" },
    { name: "Turkey", cc: "TR", dsf: "143480" },
    { name: "United States", cc: "US", dsf: "143441" },
  ];

  function getSortedRegions() {
    return [...COMMON_REGIONS].sort((left, right) =>
      left.cc.localeCompare(right.cc),
    );
  }

  function isHttpProtocol(protocol) {
    return protocol === "http:" || protocol === "https:";
  }

  function isWebAppStoreUrl(url) {
    return (
      isHttpProtocol(url.protocol) &&
      url.hostname.toLowerCase() === "apps.apple.com"
    );
  }

  function getAppleDeeplinkScheme() {
    const userAgent = navigator.userAgent || "";
    const platform =
      navigator.userAgentData?.platform || navigator.platform || "";
    const isIPadOS =
      platform === "MacIntel" && Number(navigator.maxTouchPoints) > 1;

    if (/iPad|iPhone|iPod/i.test(userAgent) || isIPadOS) {
      return "itms-apps";
    }

    if (/Macintosh|Mac OS X/i.test(userAgent) || /^Mac/i.test(platform)) {
      return "macappstore";
    }

    return null;
  }

  function toAppStoreDeeplink(url) {
    const scheme = getAppleDeeplinkScheme();
    if (!scheme) {
      return null;
    }

    const deeplink = new URL(url.href);
    if (scheme === "macappstore") {
      deeplink.searchParams.set("mt", "12");
    }
    return `${scheme}://${deeplink.host}${deeplink.pathname}${deeplink.search}${deeplink.hash}`;
  }

  function isSafariBrowser() {
    const userAgent = navigator.userAgent || "";
    return (
      /Safari/i.test(userAgent) &&
      !/Chrome|Chromium|CriOS|Edg|OPR|FxiOS/i.test(userAgent)
    );
  }

  function launchAppStoreDeeplink(deeplink) {
    if (getAppleDeeplinkScheme() !== "macappstore" || !isSafariBrowser()) {
      window.location.href = deeplink;
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.id = "itms-launch-client-opener";
    iframe.hidden = true;
    (document.body || document.documentElement).append(iframe);
    iframe.contentWindow.location.href = deeplink;
    window.setTimeout(() => iframe.remove(), 50);
  }

  function maybeParseUrl(input) {
    try {
      return new URL(input, window.location.href);
    } catch (_) {
      return null;
    }
  }

  function toggleRedirect() {
    isRedirectEnabled = !isRedirectEnabled;
    GM_setValue(STORAGE_KEY_REDIRECT_ENABLED, isRedirectEnabled);
    alert(
      `App Store redirect is now ${isRedirectEnabled ? "enabled" : "disabled"}.`,
    );
    window.location.reload();
  }

  function buildRegionSwitchUrl(region) {
    const scheme = getAppleDeeplinkScheme();
    if (!scheme) {
      return null;
    }

    const query = new URLSearchParams({ dsf: region.dsf, cc: region.cc });
    if (scheme === "macappstore") {
      query.set("mt", "12");
    }
    return `${scheme}://itunes.apple.com/WebObjects/MZStore.woa/wa/resetAndRedirect?${query.toString()}`;
  }

  function switchRegion(region) {
    const deeplink = buildRegionSwitchUrl(region);
    if (deeplink) {
      window.location.href = deeplink;
    }
  }

  function registerMenus() {
    const stateText = isRedirectEnabled ? "enabled" : "disabled";
    const stateIcon = isRedirectEnabled ? "✅" : "❌";
    GM_registerMenuCommand(
      `${stateIcon} Toggle Redirect (current: ${stateText})`,
      toggleRedirect,
    );
  }

  function mountRegionSwitcher() {
    if (window.top !== window.self || !getAppleDeeplinkScheme()) {
      return;
    }

    const host = document.createElement("div");
    host.id = "itms-region-switcher";
    const shadow = host.attachShadow({ mode: "closed" });

    const style = document.createElement("style");
    style.textContent = `
      :host {
        color-scheme: light dark;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      *, *::before, *::after { box-sizing: border-box; }
      button { font: inherit; }
      [hidden] { display: none !important; }
      .launcher {
        position: fixed;
        right: max(18px, env(safe-area-inset-right));
        bottom: max(18px, env(safe-area-inset-bottom));
        z-index: 2147483646;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 42px;
        padding: 9px 14px;
        border: 1px solid rgba(128, 128, 128, 0.32);
        border-radius: 999px;
        color: CanvasText;
        background: Canvas;
        background: color-mix(in srgb, Canvas 92%, transparent);
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
        -webkit-backdrop-filter: blur(16px);
        backdrop-filter: blur(16px);
        cursor: pointer;
      }
      .launcher:hover { background: color-mix(in srgb, Canvas 82%, GrayText); }
      .launcher:focus-visible, .close:focus-visible, .region:focus-visible {
        outline: 3px solid Highlight;
        outline-offset: 2px;
      }
      .backdrop {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: grid;
        place-items: center;
        padding: 20px;
        background: rgba(0, 0, 0, 0.48);
      }
      .modal {
        width: min(420px, 100%);
        max-height: min(680px, calc(100vh - 40px));
        overflow: auto;
        padding: 20px;
        border: 1px solid rgba(128, 128, 128, 0.3);
        border-radius: 18px;
        color: CanvasText;
        background: Canvas;
        box-shadow: 0 18px 64px rgba(0, 0, 0, 0.32);
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 14px;
      }
      .title { margin: 0; font-size: 20px; line-height: 1.3; }
      .close {
        width: 34px;
        height: 34px;
        border: 0;
        border-radius: 50%;
        color: CanvasText;
        background: Canvas;
        background: color-mix(in srgb, Canvas 82%, GrayText);
        cursor: pointer;
      }
      .regions { display: grid; gap: 10px; }
      .region {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 12px 14px;
        border: 1px solid rgba(128, 128, 128, 0.28);
        border-radius: 12px;
        color: CanvasText;
        background: Canvas;
        background: color-mix(in srgb, Canvas 96%, GrayText);
        text-align: left;
        cursor: pointer;
      }
      .region:hover { background: color-mix(in srgb, Canvas 86%, GrayText); }
      .code {
        display: grid;
        place-items: center;
        width: 36px;
        height: 28px;
        border-radius: 7px;
        color: HighlightText;
        background: Highlight;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.04em;
      }
      .name { flex: 1; font-weight: 600; }
      .note {
        margin: 14px 2px 0;
        color: GrayText;
        font-size: 12px;
        line-height: 1.45;
      }
    `;

    const launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "launcher";
    launcher.setAttribute("aria-haspopup", "dialog");
    launcher.setAttribute("aria-expanded", "false");
    launcher.textContent = " App Store Region";

    const backdrop = document.createElement("div");
    backdrop.className = "backdrop";
    backdrop.hidden = true;

    const modal = document.createElement("section");
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "itms-region-title");

    const header = document.createElement("div");
    header.className = "header";
    const title = document.createElement("h2");
    title.id = "itms-region-title";
    title.className = "title";
    title.textContent = "Switch App Store Region";
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "close";
    closeButton.setAttribute("aria-label", "Close");
    closeButton.textContent = "×";
    header.append(title, closeButton);

    const regions = document.createElement("div");
    regions.className = "regions";
    getSortedRegions().forEach((region) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "region";
      const code = document.createElement("span");
      code.className = "code";
      code.textContent = region.cc;
      const name = document.createElement("span");
      name.className = "name";
      name.textContent = region.name;
      const arrow = document.createElement("span");
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "›";
      button.append(code, name, arrow);
      button.addEventListener("click", () => {
        closeModal();
        switchRegion(region);
      });
      regions.append(button);
    });

    const note = document.createElement("p");
    note.className = "note";
    note.textContent =
      "On macOS, App Store may show “Cannot Connect” after the storefront changes.";

    function closeModal() {
      backdrop.hidden = true;
      launcher.setAttribute("aria-expanded", "false");
      launcher.focus();
    }

    launcher.addEventListener("click", () => {
      backdrop.hidden = false;
      launcher.setAttribute("aria-expanded", "true");
      closeButton.focus();
    });
    closeButton.addEventListener("click", closeModal);
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) {
        closeModal();
      }
    });
    shadow.addEventListener("keydown", (event) => {
      if (backdrop.hidden) {
        return;
      }
      if (event.key === "Escape") {
        closeModal();
        return;
      }
      if (event.key === "Tab") {
        const focusable = [closeButton, ...regions.querySelectorAll("button")];
        const currentIndex = focusable.indexOf(shadow.activeElement);
        const direction = event.shiftKey ? -1 : 1;
        const nextIndex =
          (currentIndex + direction + focusable.length) % focusable.length;
        event.preventDefault();
        focusable[nextIndex].focus();
      }
    });

    modal.append(header, regions, note);
    backdrop.append(modal);
    shadow.append(style, launcher, backdrop);
    document.documentElement.append(host);
  }

  function rewriteAnchor(anchor) {
    const parsed = maybeParseUrl(anchor.href);
    if (!parsed || !isWebAppStoreUrl(parsed)) {
      return;
    }

    const deeplink = toAppStoreDeeplink(parsed);
    if (deeplink?.startsWith("macappstore:")) {
      return;
    }
    if (deeplink && anchor.href !== deeplink) {
      anchor.href = deeplink;
      anchor.dataset.itmsRedirectRewritten = "1";
    }
  }

  function rewriteExistingAnchors(root) {
    const anchors = root.querySelectorAll("a[href]");
    anchors.forEach(rewriteAnchor);
  }

  function startDomRewriteObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) {
            return;
          }

          if (node.matches("a[href]")) {
            rewriteAnchor(node);
          }
          rewriteExistingAnchors(node);
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  function handleAnchorClick(event) {
    if (!isRedirectEnabled) {
      return;
    }
    if (event.defaultPrevented || event.button !== 0) {
      return;
    }
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const anchor = target.closest("a[href]");
    if (!anchor) {
      return;
    }

    const parsed = maybeParseUrl(anchor.href);
    if (!parsed || !isWebAppStoreUrl(parsed)) {
      return;
    }

    const deeplink = toAppStoreDeeplink(parsed);
    if (!deeplink) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    launchAppStoreDeeplink(deeplink);
  }

  function maybeRedirectCurrentPage() {
    if (!isRedirectEnabled) {
      return;
    }

    const current = maybeParseUrl(window.location.href);
    if (!current || !isWebAppStoreUrl(current)) {
      return;
    }

    const deeplink = toAppStoreDeeplink(current);
    if (deeplink) {
      launchAppStoreDeeplink(deeplink);
    }
  }

  registerMenus();
  mountRegionSwitcher();
  maybeRedirectCurrentPage();

  if (!isRedirectEnabled) {
    return;
  }

  rewriteExistingAnchors(document);
  startDomRewriteObserver();
  document.addEventListener("click", handleAnchorClick, true);
})();
