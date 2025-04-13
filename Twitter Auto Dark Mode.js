// ==UserScript==
// @namespace    http://tampermonkey.net/
// @author       Lucas
// @license      GPLv3
// @icon         https://abs.twimg.com/favicons/twitter.ico
// @name     Twitter auto darkmode
// @name-en  Twitter auto darkmode
// @name-zh-CN  Twitter自动深色模式
// @version  1.3.2
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

  function toggleAutoDarkMode() {
    isEnabled = !isEnabled;
    GM_setValue('isEnabled', isEnabled);
    alert(`Auto dark mode is now ${isEnabled ? 'enabled' : 'disabled'}`);
    location.reload();
  }

  GM_registerMenuCommand(`Toggle Auto Dark Mode (${isEnabled ? '✅ Enabled' : '❌ Disabled'})`, toggleAutoDarkMode);

  let darkModePreference = GM_getValue('darkModePreference', 2);
  const darkModeOptions = {
    '1': 'Lights out mode',
    '2': 'Dim mode',
    '0': 'Light mode',
  };

  function setDarkModePreference() {
    const newPreference = prompt(
      `Enter dark mode preference:\n1: Lights out mode\n2: Dim mode\n0: Light mode`,
      darkModePreference
    );
    if (newPreference in darkModeOptions) {
      GM_setValue('darkModePreference', newPreference);
      alert(`Dark mode preference set to ${darkModeOptions[newPreference]}`);
      location.reload();
    } else {
      alert('Invalid input. Please enter 1, 2, or 0.');
    }
  }

  GM_registerMenuCommand(
    `Set Dark Mode Preference (Current: ${darkModeOptions[darkModePreference]})`,
    setDarkModePreference
  );

  // Function to set the dark mode automatically
  
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    let userPreference = GM_getValue('darkModePreference', 2); // Default to lights out mode
    const isDarkMode = e.matches ? userPreference : 0;
    document.cookie = `night_mode=${isDarkMode};path=/;domain=.twitter.com;secure`;
    document.cookie = `night_mode=${isDarkMode};path=/;domain=.x.com;secure`;
  });
  
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
    const isLightMode = e.matches ? 0 : 1;
    document.cookie = `night_mode=${isLightMode};path=/;domain=.twitter.com;secure`;
    document.cookie = `night_mode=${isLightMode};path=/;domain=.x.com;secure`;
  });
  
    
})();