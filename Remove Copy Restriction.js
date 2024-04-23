// ==UserScript==
// @name         Remove Copy Restriction
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Remove copy restriction on web pages
// @author       Lucas04
// @match        *://*/*
// @exclude      *://*.lucas04.xyz/*
// @updateURL    https://raw.githubusercontent.com/Lucas04-nhr/TamperMonkeyUserScript/main/Remove%20Copy%20Restriction.js
// @downloadURL  https://raw.githubusercontent.com/Lucas04-nhr/TamperMonkeyUserScript/main/Remove%20Copy%20Restriction.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    document.body.style.userSelect = 'auto';
    document.body.style.webkitUserSelect = 'auto';
    document.body.style.mozUserSelect = 'auto';
    document.body.style.msUserSelect = 'auto';
    document.oncontextmenu = null;
    document.ondragstart = null;
    document.onselectstart = null;
})();
