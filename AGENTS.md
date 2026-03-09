# Money - guide for AI agents

## Quick context
- Local-first personal finance ledger app built with Expo + React Native.
- Data is stored on device (AsyncStorage). Backups are JSON files via export/import.
- Navigation: React Navigation v6 (stack + tabs).
- Mobile only (iOS/Android), no web target.
- Current stack (Mar 2026): Expo SDK 54, React Native 0.81.5, React 19.1.0.
- Platform baselines: iOS 15.1+ and Android edge-to-edge enabled.

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
- Theme tokens/layout: `src/theme/theme.js`, `src/theme/layout.js`
- UI primitives: `src/primitives/*`
- Premium/subscription: `src/services/PurchaseService.js`, `src/screens/Subscription/*`

## Data model (local)
- `settings`: includes `schemaVersion`, `theme`, `baseCurrency`, `pin`, `reminders`, `language`, `onboarded`,
  `maskAmount`, `statsRangeMonths`, `autoCategory`, `autoAccount`, `autoAmount`, `userProfile`, `marketingLead`
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

## Product direction (2026)
- Local-first always (privacy + offline usability).
- Notifications must remain scoped per feature.
- Keep schema and backups resilient across app updates.
