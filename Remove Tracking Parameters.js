// ==UserScript==
// @name         Remove Tracking Parameters
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Remove common tracking parameters from URLs when copying
// @author       Lucas04
// @match        *://*/*
// @grant        GM_setClipboard
// @updateURL    https://raw.githubusercontent.com/Lucas04-nhr/TamperMonkeyUserScript/main/Remove%20Tracking%20Parameters.js
// @downloadURL  https://raw.githubusercontent.com/Lucas04-nhr/TamperMonkeyUserScript/main/Remove%20Tracking%20Parameters.js
// ==/UserScript==

(function() {
    'use strict';

    // Function to remove tracking parameters from the URL
    function removeTrackingParameters(url) {
        const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'msclkid', 'mc_eid', 'mc_cid', 'yclid', 'dclid', 'gclsrc', 'vd_source', 'vd_campaign', 'vd_term', 'vd_content', 'vd_medium', 'vd_gclid', 'vd_fbclid', 'vd_msclkid', 'vd_mc_eid', 'vd_mc_cid', 'vd_yclid', 'vd_dclid', 'vd_gclsrc', 'vd_utm_source', 'vd_utm_medium', 'vd_utm_campaign', 'vd_utm_term', 'vd_utm_content', 'vd_utm_id', 'vd_utm_name'];

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

        // Check if the copied text is a URL
        try {
            new URL(copiedText);
            // If it's a URL, remove tracking parameters
            copiedText = removeTrackingParameters(copiedText);
            // Update the clipboard data
            GM_setClipboard(copiedText, 'text');
            event.preventDefault();
        } catch (error) {
            // Not a URL, do nothing
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
})();
