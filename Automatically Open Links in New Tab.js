// ==UserScript==
// @name         Automatically Open Links in New Tab
// @namespace    https://github.com/lucas04-nhr
// @version      0.3
// @description  This JavaScript can help you force the link to open in a new tab on Google Scholar.
// @author       Lucas04
// @match        https://scholar.google.com/*
// @match        https://scholar.google.com.sg/*
// @match        https://scholar.google.com.jp/*
// @match        https://scholar.google.com.fr/*
// @match        https://scholar.google.com.hk/*
// @match        https://old.igem.org/*

// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Get all the links
    const links = document.querySelectorAll('#gs_res_ccl_mid a');

    // Iterating through each link
    links.forEach(link => {
        link.setAttribute('target', '_blank'); // Open Links in new tab
    });
})();
