// ==UserScript==
// @namespace    http://tampermonkey.net/
// @author       Lucas
// @license      GPLv3
// @icon         https://abs.twimg.com/favicons/twitter.ico
// @name     Twitter auto darkmode
// @name-en  Twitter auto darkmode
// @name-zh-CN  Twitter自动深色模式
// @version  1.3.1
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

// Add menu commands to Tampermonkey dropdown
(function() {
  'use strict';

  let isEnabled = GM_getValue('isEnabled', true);
  const icon = isEnabled ? '✅' : '❌';

  function toggleAutoDarkMode() {
    isEnabled = !isEnabled;
    GM_setValue('isEnabled', isEnabled);
    alert(`Auto dark mode is now ${isEnabled ? 'enabled' : 'disabled'}`);
    location.reload();
  }

  GM_registerMenuCommand('Toggle Auto Dark Mode', toggleAutoDarkMode);

  let darkModePreference = GM_getValue('darkModePreference', 2);
  const darkModeOptions = {
    '1': 'Lights out mode',
    '2': 'Dim mode',
    '0': 'Light mode',
  };
  const darkModeIcon = darkModeOptions[darkModePreference] ? '✅' : '❌';
  function setDarkModePreference() {
    const newPreference = prompt('Enter dark mode preference (1: Lights out mode, 2: Dim mode, 0: Light mode):', darkModePreference);
    if (newPreference in darkModeOptions) {
      GM_setValue('darkModePreference', newPreference);
      alert(`Dark mode preference set to ${darkModeOptions[newPreference]}`);
      location.reload();
    } else {
      alert('Invalid input. Please enter 1, 2, or 0.');
    }
  }
  GM_registerMenuCommand('Set Dark Mode Preference', setDarkModePreference, darkModeIcon);

  // Function to set the dark mode cookie
  function setDarkModeCookie() {
    if (isEnabled) {
      const darkModeValue = darkModePreference;
      document.cookie = `night_mode=${darkModeValue};path=/;domain=.twitter.com;secure`;
      document.cookie = `night_mode=${darkModeValue};path=/;domain=.x.com;secure`;
    }
  }
  // Set the dark mode cookie on page load
  setDarkModeCookie();

  // Listen for changes in the system color scheme
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    const isDarkMode = e.matches ? darkModePreference : 0;
    document.cookie = `night_mode=${isDarkMode};path=/;domain=.twitter.com;secure`;
    document.cookie = `night_mode=${isDarkMode};path=/;domain=.x.com;secure`;
  });
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
    const isLightMode = e.matches ? 0 : 1;
    document.cookie = `night_mode=${isLightMode};path=/;domain=.twitter.com;secure`;
    document.cookie = `night_mode=${isLightMode};path=/;domain=.x.com;secure`;
  });
  
})();