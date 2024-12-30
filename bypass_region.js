// ==UserScript==
// @name         Bypass the GitLab Region Restriction
// @name:en      Bypass the GitLab Region Restriction
// @name:zh-CN   绕过 GitLab 地区限制
// @name:zh-TW   繞過 GitLab 地區限制
// @namespace    http://tampermonkey.net/
// @version      0.3.0
// @description:en  Bypass the GitLab Region Restriction by modifying the navigator.language field
// @description:zh-CN  通过修改 navigator.language 字段绕过 GitLab 地区限制
// @description:zh-TW  通過修改 navigator.language 字段繞過 GitLab 地區限制
// @author       Lucas
// @match        https://*.gitlab.com/*
// @grant        GM_registerMenuCommand
// @license      GPLv3
// @downloadURL https://update.greasyfork.org/scripts/522277/Bypass%20the%20GitLab%20Region%20Restriction.user.js
// @updateURL https://update.greasyfork.org/scripts/522277/Bypass%20the%20GitLab%20Region%20Restriction.meta.js
// ==/UserScript==

(function() {
  'use strict';

  // 定义支持的语言列表
  const languages = [
      { code: 'en-US', name: 'English (United States)' },
      { code: 'zh-CN', name: '简体中文' },
      { code: 'ja-JP', name: '日本語' },
      { code: 'es-ES', name: 'Español (España)' },
      { code: 'fr-FR', name: 'Français (France)' },
  ];

  // 创建下拉菜单
  let language_menu = null;

  function createDropdown() {
      if (language_menu) return; // 如果下拉菜单已经存在，则不再创建

      language_menu = document.createElement('language_menu');
      language_menu.style.position = 'fixed';
      language_menu.style.top = '50%';
      language_menu.style.left = '50%';
      language_menu.style.transform = 'translate(-50%, -50%)';
      language_menu.style.zIndex = '9999';
      language_menu.style.padding = '5px';
      language_menu.style.backgroundColor = '#fff';
      language_menu.style.border = '1px solid #ccc';
      language_menu.style.borderRadius = '4px';

      // 添加语言选项
      languages.forEach(lang => {
          const option = document.createElement('option');
          option.value = lang.code;
          option.textContent = lang.name;
          language_menu.appendChild(option);
      });

      // 将下拉菜单添加到页面
      document.body.appendChild(language_menu);

      // 覆盖 navigator.language 属性
      Object.defineProperty(navigator, 'language', {
          get: function() {
              return language_menu.value; // 返回当前选中的语言
          }
      });

      // 如果需要，也可以覆盖 navigator.languages 属性
      Object.defineProperty(navigator, 'languages', {
          get: function() {
              return [language_menu.value]; // 返回当前选中的语言
          }
      });
  }

  // 注册油猴菜单项
  GM_registerMenuCommand('选择语言并更改 navigator.language', function() {
      createDropdown(); // 点击菜单项时创建下拉菜单
  });
})();