// ==UserScript==
// @name         Remove Tracking Parameters
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  Remove common tracking parameters from URLs when copying
// @author       Lucas04
// @match        *://*.bilibili.com/*
// @grant        GM_setClipboard
// @updateURL    https://raw.githubusercontent.com/Lucas04-nhr/TamperMonkeyUserScript/main/Remove%20Tracking%20Parameters.js
// @downloadURL  https://raw.githubusercontent.com/Lucas04-nhr/TamperMonkeyUserScript/main/Remove%20Tracking%20Parameters.js
// ==/UserScript==

(function() {
    'use strict';

    // Function to remove tracking parameters from the URL
    function removeTrackingParameters(url) {
        const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'msclkid', 'mc_eid', 'mc_cid', 'yclid', 'dclid', 'gclsrc', 'vd_source', 'vd_campaign', 'vd_term', 'vd_content', 'vd_medium', 'vd_gclid', 'vd_fbclid', 'vd_msclkid', 'vd_mc_eid', 'vd_mc_cid', 'vd_yclid', 'vd_dclid', 'vd_gclsrc', 'vd_utm_source', 'vd_utm_medium', 'vd_utm_campaign', 'vd_utm_term', 'vd_utm_content', 'vd_utm_id', 'vd_utm_name', 'share_source', 'share_medium', 'share_campaign', 'share_term', 'share_content', 'share_id', 'share_name', 'share_gclid', 'share_fbclid', 'share_msclkid', 'share_mc_eid', 'share_mc_cid', 'share_yclid', 'share_dclid', 'share_gclsrc', 'share_utm_source', 'share_utm_medium', 'share_utm_campaign', 'share_utm_term', 'share_utm_content', 'share_utm_id', 'share_utm_name', 'share_utm_source', 'share_utm_medium', 'share_utm_campaign', 'share_utm_term', 'share_utm_content'];

        // Parse the URL
        const urlObj = new URL(url);

        // Remove tracking parameters
        trackingParams.forEach(param => urlObj.searchParams.delete(param));

        return urlObj.href;
    }

    // Function to handle copy event
    function handleCopy(event) {
        // Get the current clipboard data
        const clipboardData = event.clipboardData || window.clipboardData;
        let copiedText = clipboardData.getData('text/plain');

        // Check if the copied text contains a URL using regex
        const urlRegex = /(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
        const matches = copiedText.match(urlRegex);

        if (matches) {
            // If it's a URL, remove tracking parameters
            const url = matches[0];
            copiedText = removeTrackingParameters(url);
            // Update the clipboard data
            GM_setClipboard(copiedText, 'text');
            event.preventDefault();
        }
    }

    // Function to periodically check the clipboard for URLs
    function checkClipboard() {
        const currentClipboard = GM_getClipboard('text');

        // Check if the clipboard content contains a URL using regex
        const urlRegex = /(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
        const matches = currentClipboard.match(urlRegex);

        if (matches) {
            // If it's a URL, remove tracking parameters
            const url = matches[0];
            const newClipboardContent = removeTrackingParameters(url);
            // Update the clipboard data
            GM_setClipboard(newClipboardContent, 'text');
        }
    }

    // Remove tracking parameters when the page loads
    window.addEventListener('load', function() {
        const currentURL = window.location.href;
        const newURL = removeTrackingParameters(currentURL);

        // Redirect to the new URL without tracking parameters
        if (newURL !== currentURL) {
            window.location.replace(newURL);
        }

        // Add event listener for copy event
        document.addEventListener('copy', handleCopy);
    });

    // Periodically check the clipboard for URLs
    setInterval(checkClipboard, 1000); // Adjust the interval as needed
})();
