// ==UserScript==
// @name         修复缩放异常
// @name-en      Douyin Scale Fix
// @namespace    http://tampermonkey.net/
// @version      1.8.0
// @description  修复抖音右下角 positionBox 元素缩放异常
// @description-en  Fix the scale issue of the positionBox element in Douyin
// @author       Lucas
// @match        *://*.douyin.com/*
// @match        *://*.iesdouyin.com/*
// @license      GPLv3
// @grant        none
// @downloadURL https://update.greasyfork.org/scripts/533338/%E4%BF%AE%E5%A4%8D%E7%BC%A9%E6%94%BE%E5%BC%82%E5%B8%B8.user.js
// @updateURL https://update.greasyfork.org/scripts/533338/%E4%BF%AE%E5%A4%8D%E7%BC%A9%E6%94%BE%E5%BC%82%E5%B8%B8.meta.js
// ==/UserScript==

(function() {
    'use strict';

    const targetElementSelector = '[class*="positionBox"]';
    const maxWaitTime = 300000;
    let startTime = Date.now();
    let documentObserver = null;

    function setupObservers() {
        let targetElements = document.querySelectorAll(targetElementSelector);

        if (targetElements.length > 0) {
            console.log('找到匹配元素，正在设置监控...');
            const elementObserver = new MutationObserver(handleMutations);

            targetElements.forEach(element => {
                elementObserver.observe(element, { attributes: true, attributeFilter: ['style'] });
                console.log('正在监控元素:', element);
            });

            if (documentObserver) {
                documentObserver.disconnect();
                documentObserver = null;
            }
        } else if (Date.now() - startTime < maxWaitTime) {
            setTimeout(setupObservers, 500);
        } else {
            console.error('等待超时，未找到匹配元素。请检查页面或类名。');
            if (documentObserver) {
                documentObserver.disconnect(); 
            }
        }
    }

    function startDocumentObservation() {
        documentObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    setupObservers(); 
                }
            });
        });

        documentObserver.observe(document.body, { childList: true, subtree: true });
        console.log('正在监控文档变化，等待目标元素出现...');
    }

    function handleMutations(mutationsList) {
        mutationsList.forEach(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const element = mutation.target;
                const currentTransform = element.style.transform;
                console.log('检测到 style 属性变化，当前 transform:', currentTransform);

                const scaleValue = parseScaleFromTransform(currentTransform);
                if (scaleValue !== null && scaleValue !== 1) {  // 如果 scale 不为 1
                    console.log('检测到 scale 不为 1，强制修正...');
                    fixScale(element);
                }
            }
        });
    }

    function parseScaleFromTransform(transformString) {
        if (!transformString) return null;
        const scaleRegex = /scale\(([^)]+)\)/;
        const match = transformString.match(scaleRegex);
        if (match && match[1]) {
            const scaleValues = match[1].split(',').map(val => parseFloat(val.trim()));
            if (scaleValues.length > 0) {
                return scaleValues[0]; 
            }
        }
        return null;
    }

    function fixScale(element) {
        element.style.transform = 'scale(1)';
        element.style.transformOrigin = 'center center';
        console.log('已为元素强制应用 scale(1):', element);
    }

    console.log('脚本加载成功，正在尝试查找并监控元素...');
    setupObservers();
    if (document.querySelectorAll(targetElementSelector).length === 0) {
        startDocumentObservation();
    }
})();
