# App Store Link to `itms-apps://` Redirect

This Tampermonkey script redirects `https://` App Store web links to the `itms-apps://` protocol, so clicking App Store links can open the App Store app directly, to bypass the regional restriction of accessing web App Store in China Mainland. It also provides quick shortcuts to switch App Store regions.

## Features

- Redirects App Store web links such as `https://apps.apple.com/app/<app_id>` to `itms-apps://apps.apple.com/app/<app_id>`.
- Supports three redirect scenarios:
  1.  Intercepting user clicks on matching links.
  2.  Rewriting matching links in the current page (including dynamically added links).
  3.  Auto-redirecting direct visits to `https://apps.apple.com/...` in the address bar.
- Provides a menu toggle to enable or disable redirect behavior.
- Provides 5 common App Store region switch shortcuts.
- Region shortcuts are grouped under a collapsible menu and sorted by `cc`.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Visit the script's [Greasy Fork page](https://greasyfork.org/en/scripts/581888-app-store-link-redirect) and click "Install this script".

## Usage

After enabling the script:

1. Visit any page containing App Store web links.
2. Click a matching link, and the script will redirect to `itms-apps://...`.
3. Open the Tampermonkey menu to toggle redirect or switch regions.

## Menu Commands

- **Toggle Redirect**: Enable or disable all redirect features.
- **Region Shortcuts**: Expand or collapse the region list.
- **Switch Region**: Open App Store internal switch URL:
  - `itms-apps://itunes.apple.com/WebObjects/MZStore.woa/wa/resetAndRedirect?dsf={dsf}&cc={cc}`

## Common Regions (5)

- **CN**: China Mainland (`dsf=143465`)
- **DK**: Denmark (`dsf=143458`)
- **HK**: Hong Kong (`dsf=143463`)
- **JP**: Japan (`dsf=143462`)
- **TR**: Turkey (`dsf=143480`)
- **US**: United States (`dsf=143441`)

> Region mapping values (`cc`, `dsf`) may change if Apple updates storefront definitions in the future.
