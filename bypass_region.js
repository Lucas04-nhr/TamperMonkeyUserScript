// ==UserScript==
// @name         Bypass the GitLab Region Restriction
// @name:en      Bypass the GitLab Region Restriction
// @name:zh-CN   绕过 GitLab 地区限制
// @name:zh-TW   繞過 GitLab 地區限制
// @namespace    http://tampermonkey.net/
// @version      0.4.8
// @description:en  Bypass the GitLab Region Restriction by modifying the navigator.language field
// @description:zh-CN  通过修改 navigator.language 字段绕过 GitLab 地区限制
// @description:zh-TW  通過修改 navigator.language 字段繞過 GitLab 地區限制
// @author       Lucas
// @match        https://*.gitlab.com/*
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @license      GPLv3
// @downloadURL https://update.greasyfork.org/scripts/522277/Bypass%20the%20GitLab%20Region%20Restriction.user.js
// @updateURL https://update.greasyfork.org/scripts/522277/Bypass%20the%20GitLab%20Region%20Restriction.meta.js
// ==/UserScript==

(function() {
  'use strict';

  let isEnabled = GM_getValue('isEnabled', false);

  function toggleBypass() {
      isEnabled = !isEnabled;
      GM_setValue('isEnabled', isEnabled);
      alert(`Bypass is now ${isEnabled ? 'enabled' : 'disabled'}`);
      location.reload();
  }

  GM_registerMenuCommand('Toggle Bypass (current: ' + (isEnabled ? 'enabled' : 'disabled') + ')', toggleBypass);

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