// ==UserScript==
// @namespace    http://tampermonkey.net/
// @author       Lucas
// @license      GPLv3
// @icon         https://abs.twimg.com/favicons/twitter.ico
// @name     Twitter Auto Dark Mode
// @name-en  Twitter Auto Dark Mode
// @name-zh-CN  Twitter自动深色模式
// @version  1.3.5
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @description Automatically set Twitter dark mode based on system preference.
// @description-en  Automatically set Twitter dark mode based on system preference.
// @description-zh-CN  根据系统偏好自动设置Twitter深色模式。
// @match    *://twitter.com/*
// @match    *://x.com/*
// @downloadURL https://update.greasyfork.org/scripts/532689/Twitter%20auto%20darkmode.user.js
// @updateURL https://update.greasyfork.org/scripts/532689/Twitter%20auto%20darkmode.meta.js
// ==/UserScript==

(function() {
  const isEnabled = GM_getValue('isEnabled', true);
  const darkModeVariant = GM_getValue('darkModeVariant', '2');

  function toggleAutoChange() {
      const newValue = !isEnabled;
      GM_setValue('isEnabled', newValue);
      alert(`Auto change is now ${newValue ? 'enabled' : 'disabled'}`);
      location.reload();
  }

  const enableIcon = isEnabled ? '✅' : '❌';
  GM_registerMenuCommand('Toggle Auto Change (current: ' + (isEnabled ? 'enabled' : 'disabled') + ')', toggleAutoChange, enableIcon);

 // Set dark mode settings
  const darkModeSettings = {
      '0': { name: 'Light', value: '0' },
      '1': { name: 'Dim', value: '1' },
      '2': { name: 'Lights out', value: '2' }
  };
  const currentSetting = darkModeSettings[darkModeVariant];
  console.log(`Current dark mode setting: ${currentSetting.name}`);
  console.log(`Current dark mode variant: ${darkModeVariant}`);
  const darkModeIcon = darkModeVariant === '2' ? '🌙' : darkModeVariant === '1' ? '🌗' : '🌞';
  GM_registerMenuCommand('Set Dark Mode Variant (current: ' + darkModeVariant + ')', () => {
      const newVariant = prompt('Enter dark mode variant (0: Light, 1: Dim, 2: Lights out)', darkModeVariant);
      if (newVariant !== null) {
          GM_setValue('darkModeVariant', newVariant);
          alert(`Dark mode variant set to ${newVariant}`);
          location.reload();
      }
  }, darkModeIcon);

  // Set dark mode based on system preference
  if (isEnabled) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener('change', e => {
      const isDarkMode = e.matches ? darkModeVariant : '0';
      document.cookie = `night_mode=${isDarkMode};path=/;domain=.twitter.com;secure`;
      document.cookie = `night_mode=${isDarkMode};path=/;domain=.x.com;secure`;
    });

    window.matchMedia("(prefers-color-scheme: light)").addEventListener('change', e => {
      const isLightMode = e.matches ? '0' : '1';
      document.cookie = `night_mode=${isLightMode};path=/;domain=.twitter.com;secure`;
      document.cookie = `night_mode=${isLightMode};path=/;domain=.x.com;secure`;
    });
  }

})();