// ==UserScript==
// @namespace    http://tampermonkey.net/
// @author       Lucas
// @license      GPLv3
// @icon         https://abs.twimg.com/favicons/twitter.ico
// @name     Twitter auto darkmode
// @name-en  Twitter auto darkmode
// @name-zh-CN  Twitter自动深色模式
// @version  1.3.0
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

// Add menu commands to Tampermonkey dropdown
GM_registerMenuCommand("Set Dark Mode: Lights Out", () => {
  GM_setValue('darkModePreference', 2);
  alert("Dark mode preference set to Lights Out.");
});

GM_registerMenuCommand("Set Dark Mode: Dim", () => {
  GM_setValue('darkModePreference', 1);
  alert("Dark mode preference set to Dim.");
});

GM_registerMenuCommand("Set Dark Mode: Off", () => {
  GM_setValue('darkModePreference', 0);
  alert("Dark mode preference set to Off.");
});