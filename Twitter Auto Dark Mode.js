// ==UserScript==
// @namespace    http://tampermonkey.net/
// @author       Lucas
// @license      GPLv3
// @icon         https://abs.twimg.com/favicons/twitter.ico
// @name     Twitter auto darkmode
// @name-en  Twitter auto darkmode
// @name-zh-CN  Twitter自动深色模式
// @version  1.2.2
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @description Automatically set Twitter dark mode based on system preference.
// @description-en  Automatically set Twitter dark mode based on system preference.
// @description-zh-CN  根据系统偏好自动设置Twitter深色模式。
// @grant    none
// @match    *://twitter.com/*
// @match    *://x.com/*
// @downloadURL https://update.greasyfork.org/scripts/532689/Twitter%20auto%20darkmode.user.js
// @updateURL https://update.greasyfork.org/scripts/532689/Twitter%20auto%20darkmode.meta.js
// ==/UserScript==

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  const isDarkMode = e.matches ? 1 : 0;
  document.cookie = `night_mode=${isDarkMode};path=/;domain=.twitter.com;secure`;
  document.cookie = `night_mode=${isDarkMode};path=/;domain=.x.com;secure`;
});

window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
  const isLightMode = e.matches ? 0 : 1;
  document.cookie = `night_mode=${isLightMode};path=/;domain=.twitter.com;secure`;
  document.cookie = `night_mode=${isLightMode};path=/;domain=.x.com;secure`;
});

(function() {
  'use strict';

  let isEnabled = GM_getValue('isEnabled', false);

  function toggleBypass() {
      isEnabled = !isEnabled;
      GM_setValue('isEnabled', isEnabled);
      alert(`Bypass is now ${isEnabled ? 'enabled' : 'disabled'}`);
      location.reload();
  }

  const icon = isEnabled ? '✅' : '❌';
  GM_registerMenuCommand('Toggle Auto Change Theme (current: ' + (isEnabled ? 'enabled' : 'disabled') + ')', toggleBypass, icon);

  const originalLanguage = 'zh-CN';
  const newLanguage = 'en-US';

  Object.defineProperty(navigator, 'language', {
      get: function() {
          return isEnabled ? newLanguage : originalLanguage;
      }
  });

  Object.defineProperty(navigator, 'languages', {
      get: function() {
          return isEnabled ? [newLanguage] : [originalLanguage];
      }
  });
})();