// ==UserScript==
// @name         Bypass the GitLab Region Restriction
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Bypass the GitLab Region Restriction by modifying the navigator.language field
// @author       Lucas
// @match        https://*.gitlab.com/*
// @grant        none
// @license      GPLv3
// @downloadURL https://update.greasyfork.org/scripts/522277/Bypass%20the%20GitLab%20Region%20Restriction.user.js
// @updateURL https://update.greasyfork.org/scripts/522277/Bypass%20the%20GitLab%20Region%20Restriction.meta.js
// ==/UserScript==

(function() {
  'use strict';

  const newLanguage = 'en-US';

  Object.defineProperty(navigator, 'language', {
      get: function() {
          return newLanguage;
      }
  });

  Object.defineProperty(navigator, 'languages', {
      get: function() {
          return [newLanguage];
      }
  });
})();