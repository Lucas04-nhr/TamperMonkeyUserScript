// ==UserScript==
// @namespace    http://tampermonkey.net/
// @author       Lucas
// @license      GPLv3
// @icon         https://abs.twimg.com/favicons/twitter.ico
// @name     Twitter auto darkmode
// @name-en  Twitter auto darkmode
// @name-zh-CN  Twitter自动深色模式
// @version  1.0
// @description Automatically set Twitter dark mode based on system preference.
// @description-en  Automatically set Twitter dark mode based on system preference.
// @description-zh-CN  根据系统偏好自动设置Twitter深色模式。
// @grant    none
// @match    *://twitter.com/*
// @match    *://x.com/*
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