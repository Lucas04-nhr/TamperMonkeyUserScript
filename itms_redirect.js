// ==UserScript==
// @name         App Store Link to itms-apps Redirect
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Redirect App Store web links to itms-apps and provide quick region switch shortcuts.
// @author       Lucas
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @license      GPLv3
// ==/UserScript==

(function () {
  "use strict";

  const STORAGE_KEY_REDIRECT_ENABLED = "isRedirectEnabled";
  let isRedirectEnabled = GM_getValue(STORAGE_KEY_REDIRECT_ENABLED, true);

  const COMMON_REGIONS = [
    { name: "China Mainland", cc: "CN", dsf: "143465" },
    { name: "Hong Kong", cc: "HK", dsf: "143463" },
    { name: "United States", cc: "US", dsf: "143441" },
    { name: "Turkey", cc: "TR", dsf: "143480" },
    { name: "Japan", cc: "JP", dsf: "143462" },
    { name: "Denmark", cc: "DK", dsf: "143458" },
  ];

  function isHttpProtocol(protocol) {
    return protocol === "http:" || protocol === "https:";
  }

  function isWebAppStoreUrl(url) {
    return (
      isHttpProtocol(url.protocol) &&
      url.hostname.toLowerCase() === "apps.apple.com"
    );
  }

  function toItmsAppsUrl(url) {
    return `itms-apps://${url.host}${url.pathname}${url.search}${url.hash}`;
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
    const query = new URLSearchParams({ dsf: region.dsf, cc: region.cc });
    return `itms-apps://itunes.apple.com/WebObjects/MZStore.woa/wa/resetAndRedirect?${query.toString()}`;
  }

  function switchRegion(region) {
    window.location.href = buildRegionSwitchUrl(region);
  }

  function registerMenus() {
    const stateText = isRedirectEnabled ? "enabled" : "disabled";
    const stateIcon = isRedirectEnabled ? "✅" : "❌";
    GM_registerMenuCommand(
      `${stateIcon} Toggle Redirect (current: ${stateText})`,
      toggleRedirect,
    );

    GM_registerMenuCommand(
      "----- App Store Region Shortcuts -----",
      function () {},
    );
    COMMON_REGIONS.forEach((region) => {
      GM_registerMenuCommand(
        `Switch Region: ${region.cc} - ${region.name}`,
        function () {
          switchRegion(region);
        },
      );
    });
  }

  function rewriteAnchor(anchor) {
    const parsed = maybeParseUrl(anchor.href);
    if (!parsed || !isWebAppStoreUrl(parsed)) {
      return;
    }

    const itmsHref = toItmsAppsUrl(parsed);
    if (anchor.href !== itmsHref) {
      anchor.href = itmsHref;
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

    event.preventDefault();
    event.stopPropagation();
    window.location.href = toItmsAppsUrl(parsed);
  }

  function maybeRedirectCurrentPage() {
    if (!isRedirectEnabled) {
      return;
    }

    const current = maybeParseUrl(window.location.href);
    if (!current || !isWebAppStoreUrl(current)) {
      return;
    }

    window.location.replace(toItmsAppsUrl(current));
  }

  registerMenus();
  maybeRedirectCurrentPage();

  if (!isRedirectEnabled) {
    return;
  }

  rewriteExistingAnchors(document);
  startDomRewriteObserver();
  document.addEventListener("click", handleAnchorClick, true);
})();
