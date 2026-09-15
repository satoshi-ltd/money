# Môney

Private, local-first finance ledger for people who want their data to stay on device.

## Why Môney
- Your data stays on your phone by default.
- Fast, simple tracking across multiple currencies.
- Portable JSON backups you control.

## Core features
- Multi-currency accounts and transactions
- Scheduled transactions (weekly/monthly patterns)
- Spending and income analytics
- Local insights (trends, unusual spend alerts, monthly pace)
- JSON backup import/export
- CSV export (Pro)
- Optional weekly backup reminders
- Automatic category/account/amount suggestions while typing
- Multi-language UI (EN/ES/PT/FR/DE)

## Platforms
- iOS and Android only (no web support)
- iOS baseline: 15.1+

## Privacy first
Môney is designed to work offline and keep data local. Some optional features use the network:
- Exchange rates sync
- Purchases/subscription validation
- Optional onboarding lead email

These network paths should remain opt-in and transparent.

## Local Android builds
Compilation runs on your Mac through `eas build --local`: the signing keystore comes from EAS and no cloud build
quota is used. You need an Expo login, Android Studio (SDK and its JBR) and network. Metro is not needed to build.

```
yarn build:local:prod                # signed APK in release-assets/money-<version>-android.apk
yarn build:local:dev                 # dev client APK, then boots the emulator and installs it
yarn build:local:dev --install-only  # reinstall the dev APK already in release-assets/, no compile
```

The dev client is a native shell; the JavaScript comes from Metro (`yarn start`). Rebuild it only when something
native changes: a dependency with Android code, a plugin in `app.json`, the Expo SDK. For everything else keep the
installed client and let Metro reload. `--install-only` covers the emulator losing the app (wiped data, a new AVD,
an uninstall) without paying the five-minute compile; it stops with the expected path if there is no APK to install.

The emulator is `Pixel_9_Pro_Fold`; set `MONEY_ANDROID_AVD` to use another. Installation is `adb install -r`: it
keeps app data and stops on a signature mismatch, never uninstall to get past it. Both commands run
`yarn check:release` first, so `version`, `ios.buildNumber` and `android.versionCode` must move together.

## Roadmap
- Current backlog: [`backlog.md`](./backlog.md)
- Next cycle plan: [`next-features.md`](./next-features.md)
