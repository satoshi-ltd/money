# Money - guide for AI agents

## Quick context
- Local-first personal finance ledger app built with Expo + React Native.
- Data is stored on device (AsyncStorage). Backups are JSON files via export/import.
- Navigation: React Navigation v6 (stack + tabs).
- Mobile only (iOS/Android), no web target.
- Current stack (Aug 2026): Expo SDK 55, React Native 0.83.10, React 19.2.0.
- Platform baselines: iOS 15.1+ and Android. SDK 55 always builds with the new architecture and
  edge-to-edge, so `newArchEnabled` and `edgeToEdgeEnabled` no longer exist in `app.json`.

## Context cheatsheet
- App entry: `App.js` -> `src/App.jsx`
- Navigation: `src/App.Navigator.jsx`
- Global state: `src/contexts/store.jsx` (+ reducers in `src/contexts/reducers/`)
- Storage defaults/version: `src/contexts/store.constants.js`
- Migrations/normalization: `src/contexts/modules/migrateState.js`
- Persistence: `src/services/StorageService.js`
- Backups: `src/services/BackupService.js`
- Notifications: `src/services/NotificationsService.js`
- Recurrence logic: `src/modules/recurrence.js`
- Insights engine: `src/modules/insights.js`
- Shared hooks: `src/hooks/*` (`useToday` drives day/month rollover)
- Theme tokens/layout: `src/theme/theme.js`, `src/theme/layout.js`
- UI primitives: `src/primitives/*`
- Premium/subscription: `src/services/PurchaseService.js`, `src/screens/Subscription/*`

## Data model (local)
- `settings`: includes `schemaVersion`, `theme`, `baseCurrency`, `ratesBaseCurrency`, `pin`, `reminders`, `language`,
  `onboarded`, `maskAmount`, `statsRangeMonths`, `autoCategory`, `autoAccount`, `autoAmount`, `userProfile`,
  `marketingLead`
- `accounts`: account list (`hash`, `balance`, `currency`, `timestamp`, `title`)
- `txs`: transactions (`hash`, `account`, `category`, `type`, `value`, `timestamp`, `title`)
- `scheduledTxs`: templates (`id`, `account`, `category`, `type`, `value`, `title`, `startAt`, `pattern`)
  - Generated occurrences are normal `txs` with `tx.meta.kind = "scheduled"` and `{ scheduledId, occurrenceAt }`
- `subscription`: local purchase state
- `rates`: cached FX rates

## Key flows and guardrails
- App boot hydrates storage, migrates state, resolves language, rebuilds auto catalogs, then runs scheduled sync.
- Scheduled auto-create (`runScheduledSync` in store):
  - Window: from `now - 90 days` to `now`
  - Dedup key: `${scheduledId}:${occurrenceAt}` against existing tx `meta`
  - Safety cap: max `100` auto-created txs per sync run
- Scheduled notifications (`NotificationsService.syncScheduled`):
  - Horizon: next `90 days`
  - Caps: max `8` notifications per scheduled template, max `48` total
  - Trigger: day before occurrence at `08:00` local time
  - Dedup/cancel by scoped metadata (`kind`, `scheduledId`, `occurrenceAt`)
- Backup reminder notifications: weekly, Sunday at 08:00 local (current behavior).
- FX rates: `exchange()` returns `undefined` when it cannot convert; never treat that as 0.
  `settings.ratesBaseCurrency` tags the cache, and a mismatch drops it instead of merging.

## Schema, backup, and migration safety rules
- Any `settings` shape change requires:
  - Update defaults in `src/contexts/store.constants.js`
  - Update migration path in `src/contexts/modules/migrateState.js`
  - Preserve backward compatibility for existing local data and backups
- Any backup contract change requires:
  - Keep top-level keys compatible: `schemaVersion`, `accounts`, `scheduledTxs`, `settings`, `txs`
  - Defensive parsing/validation before importing into state
- Never remove/rename persisted fields without a migration step.
- Keep import failures non-destructive (invalid payload must not overwrite current state).

## Premium and privacy constraints
- Local-first is the default. Do not add network dependency for core ledger flows.
- Existing network-backed flows are limited to:
  - FX rates sync (`src/services/RatesService.js`)
  - Purchases/RevenueCat (`src/services/PurchaseService.js`)
  - Optional onboarding lead capture (`src/services/LeadService.js`)
- Premium unlock has a local path (`unlockedBy: "btc"`); do not break this when syncing with RevenueCat.

## Coding standards
- Use `src/primitives` instead of raw `react-native` components when possible.
- Avoid hardcoded colors; prefer theme tokens via `useApp().colors`.
- Prefer StyleSheet-based styles; avoid inline styles unless unavoidable.
- Keep components and modules small; avoid overengineering.
- No TypeScript in this project.

## Notifications rules
- Do not use `cancelAllScheduledNotificationsAsync` for new features.
- Cancel only notifications owned by the relevant feature using stable metadata.

## Quality gates (mandatory)
- If a change touches business logic/state/insights/migrations/services:
  - Run `yarn test`
- If a change touches UI/components/hooks/imports/styles:
  - Run `yarn lint`
- If a change touches both areas:
  - Run both `yarn test` and `yarn lint`
- Use `yarn lint:fix` only intentionally (expect diff noise).

## Scripts
- `yarn start`: Expo dev server
- `yarn android`: start on Android
- `yarn ios`: start on iOS
- `yarn lint`: ESLint
- `yarn lint:fix`: ESLint autofix
- `yarn test`: Jest
- `yarn check:release`: `package.json` and `app.json` agree on version and build number
- `yarn build:local:prod`: signed Android APK compiled on this machine, written to `release-assets/`
- `yarn build:local:dev`: development client compiled on this machine and installed on the device
- `yarn build:prod`: the same signed APK built on EAS cloud and downloaded; consumes build quota
- `yarn build:dev`: the same development client built on EAS cloud, downloaded and installed

## Android builds
- The `build:local:*` commands run `eas build --local`: compilation happens on this Mac, the signing keystore comes
  from EAS, no cloud worker or quota is used. `build:dev` and `build:prod` run the same profiles on EAS cloud and
  download the APK. Expo login and network are required; Metro is not.
- `yarn build:local:prod` and `yarn build:prod` write `release-assets/money-<version>-android.apk` (gitignored);
  rerunning replaces it.
- `yarn build:local:dev` and `yarn build:dev` install on the first USB device, otherwise on a running emulator,
  otherwise they boot `Pixel_9_Pro_Fold` (override with `ANDROID_AVD`; pin a device with `ANDROID_SERIAL`), then run
  `adb install -r`, reverse port 8081 and launch the app. Start Metro yourself with `yarn start`.
  `yarn build:local:dev --install-only` reinstalls the APK already in `release-assets/` without rebuilding: the dev
  client is a native shell and JavaScript comes from Metro, so rebuild only for native changes (Android dependencies,
  `app.json` plugins, SDK) and reinstall when the device lost the app.
- Installation preserves app data and stops on a signature mismatch. Never uninstall or clear data to get past it,
  and never replace the EAS keystore when updating an installed app.
- The toolchain comes from the machine: `ANDROID_HOME` (default `~/Library/Android/sdk`) and `JAVA_HOME`
  (default Android Studio's JBR). The Node/yarn pins in `eas.json` only apply to cloud builds.
- `postinstall` moves `@react-native/gradle-plugin` from Foojay 0.5 to 1.0 so RN 0.83 compiles under Gradle 9.
  The local EAS worker reinstalls dependencies in a copy of the repo, so the patch applies there too.
- Every build runs `yarn check:release` first: bump `version`, `ios.buildNumber` and `android.versionCode`
  together, and write the release into `changelog.md` under `## <version> — <date>`, or the build stops.

## Product direction (2026)
- Local-first always (privacy + offline usability).
- Notifications must remain scoped per feature.
- Keep schema and backups resilient across app updates.
