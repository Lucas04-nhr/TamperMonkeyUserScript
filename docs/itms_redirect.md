# App Store Native Deeplink Redirect

This Tampermonkey script redirects `https://` App Store web links to the native App Store deeplink for the current Apple device, so clicking App Store links can open the App Store app directly, to bypass the regional restriction of accessing web App Store in China Mainland. It also provides quick shortcuts to switch App Store regions.

## Features

- Follows Apple's web App Store behavior on macOS by converting to `macappstore://apps.apple.com/...` and setting `mt=12`; uses `itms-apps://apps.apple.com/...` on iOS/iPadOS.
- Leaves App Store web links unchanged on Windows, Android, and unrecognized platforms.
- Supports three redirect scenarios:
  1.  Intercepting user clicks on matching links.
  2.  Rewriting matching links in the current page on iOS/iPadOS (including dynamically added links). On macOS, links remain as HTTPS and are handled when clicked.
  3.  Auto-redirecting direct visits to `https://apps.apple.com/...` in the address bar.
- Provides a menu toggle to enable or disable redirect behavior.
- Provides 6 common App Store region switch shortcuts in a floating control at the bottom-right of the page.
- Region shortcuts open in an accessible, single-column web modal and are sorted by `cc`.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Visit the script's [Greasy Fork page](https://greasyfork.org/en/scripts/581888-app-store-link-redirect) and click "Install this script".

## Usage

After enabling the script:

1. Visit any page containing App Store web links.
2. Click a matching link, and the script will use the deeplink for the current Apple device.
3. Use the bottom-right **App Store Region** button to switch regions.

## Menu Commands

- **Toggle Redirect**: Enable or disable link redirect features.

## Region Switcher

- The switcher is shown only in the top-level page on macOS, iOS, and iPadOS.
- Selecting a region opens Apple's internal switch URL with `macappstore://` and `mt=12` on macOS, or `itms-apps://` on iOS/iPadOS.
- Apple's legacy `resetAndRedirect` endpoint is undocumented. On macOS, App Store may show “Cannot Connect” even when the storefront changed successfully.

## Common Regions (6)

- **CN**: China Mainland (`dsf=143465`)
- **DK**: Denmark (`dsf=143458`)
- **HK**: Hong Kong (`dsf=143463`)
- **JP**: Japan (`dsf=143462`)
- **TR**: Turkey (`dsf=143480`)
- **US**: United States (`dsf=143441`)

> Region mapping values (`cc`, `dsf`) may change if Apple updates storefront definitions in the future.
