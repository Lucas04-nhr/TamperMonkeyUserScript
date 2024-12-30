// ==UserScript==
// @name         Bypass the GitLab Region Restriction
// @name:en      Bypass the GitLab Region Restriction
// @name:zh-CN   绕过 GitLab 地区限制
// @name:zh-TW   繞過 GitLab 地區限制
// @namespace    http://tampermonkey.net/
// @version      0.4.0
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

  // 获取当前选择的语言
  let selectedLanguage = GM_getValue('selectedLanguage', 'en-US');

  // 覆盖 navigator.language 属性
  Object.defineProperty(navigator, 'language', {
      get: function() {
          return selectedLanguage;
      }
  });

  // 覆盖 navigator.languages 属性
  Object.defineProperty(navigator, 'languages', {
      get: function() {
          return [selectedLanguage];
      }
  });

  // 注册油猴菜单项
  GM_registerMenuCommand('选择语言', function() {
      // 创建语言选择对话框
      const languageList = languages.map(lang => `${lang.code}: ${lang.name}`).join('\n');
      const userInput = prompt(`请选择语言（输入代码）：\n\n${languageList}`, selectedLanguage);

      // 验证用户输入
      if (userInput && languages.some(lang => lang.code === userInput)) {
          selectedLanguage = userInput;
          GM_setValue('selectedLanguage', selectedLanguage);
          alert(`语言已更改为：${selectedLanguage}`);
      } else if (userInput) {
          alert('无效的语言代码，请重试！');
      }
  });
})();