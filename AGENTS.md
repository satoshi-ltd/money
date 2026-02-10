# Money — guide for AI agents

## Quick context
- Local-first personal finance ledger app built with Expo + React Native.
- All data is stored on device (AsyncStorage). Export/Import via JSON backup.
- Navigation: React Navigation v6 with stack + tabs.
- Mobile only (iOS/Android); no web targets.
- Current stack (Feb 2026): Expo SDK 53, React Native 0.79, React 19.

## Context cheatsheet
- App entry: `App.js` -> `src/App.jsx`
- Navigation: `src/App.Navigator.jsx`
- Global state: `src/contexts/store.jsx` (+ reducers in `src/contexts/reducers/`)
- Persistence: `src/services/StorageService.js`
- Backups: `src/services/BackupService.js`
- Notifications: `src/services/NotificationsService.js`
- Scheduled transactions: `src/screens/Scheduled/*`, `src/screens/ScheduledForm/*`, recurrence in `src/modules/recurrence.js`
- Insights: computed in `src/modules/insights.js` and rendered on Dashboard cards
- Theme tokens: `src/theme/theme.js` (colors/spacing/typography)
- Derived layout constants: `src/theme/layout.js` (card sizes, snap intervals, input metrics)
- UI primitives: `src/primitives/*` (prefer these over native)
- Premium/subscription: `src/services/PurchaseService.js`, `src/screens/Subscription/*`
- Onboarding + (optional) lead capture: `src/screens/Onboarding/*`, `src/services/LeadService.js`

## Project structure
- `src/screens/`: feature screens and navigation destinations
- `src/components/`: higher-level UI pieces
- `src/primitives/`: low-level primitives (View/Text/Button/Icon/Pressable)
- `src/contexts/`: global store, reducers, and helpers
- `src/services/`: persistence, backups, notifications, rates
- `src/modules/`: shared business logic utilities
- `src/theme/`: theme tokens + derived layout constants
- `assets/`: fonts and static assets

## Data model (local)
- `settings`: includes (non-exhaustive) `schemaVersion`, `theme`, `baseCurrency`, `pin`, `reminders`, `language`,
  `onboarded`, `maskAmount`, `statsRangeMonths`, `autoCategory`, `userProfile`, `marketingLead`
- `accounts`: list of account objects (`hash`, `balance`, `currency`, `timestamp`, `title`)
- `txs`: list of transactions (`hash`, `account`, `category`, `type`, `value`, `timestamp`, `title`)
- `scheduledTxs`: list of scheduled templates (`id`, `account`, `category`, `type`, `value`, `title`, `startAt`, `pattern`)
  - Created occurrences are stored as normal `txs` with `tx.meta.kind="scheduled"` and `{ scheduledId, occurrenceAt }`.
- `subscription`: purchases state
- `rates`: cached exchange rates

## Schema & migrations
- Storage defaults + schema version live in `src/contexts/store.constants.js`.
- Migrations/normalization live in `src/contexts/modules/migrateState.js`.
- Backups include `schemaVersion` and the top-level data model (`accounts`, `scheduledTxs`, `settings`, `txs`).

## Key flows
- App boot: `StoreProvider` hydrates AsyncStorage -> consolidates state.
- New transaction: `createTx` -> `parseTx` -> store -> state update.
- Scheduled auto-create (boot + app resume): `StoreProvider` runs `runScheduledSync` to create missed occurrences (bounded),
  and keeps scheduled notifications in sync.
- Auto-categorization learns on each save; initial catalog builds once if empty.
- Insights are computed locally from transactions via `buildInsights`.
- Backup: `BackupService.export` / `BackupService.import` (note: export/CSV is premium-gated in Settings).
- CSV export: `BackupService.exportCsv` (premium-gated).
- Notifications: weekly backup reminder via `NotificationsService.reminders`; scheduled-tx reminders via `syncScheduled`.
- i18n: `settings.language` drives `L10N` proxy, with EN/ES/PT/FR/DE dictionaries.
- Onboarding: local survey stored in `settings.userProfile`; optional email can be sent via `LeadService` (remote).

## Coding standards
- Use `src/primitives` primitives instead of raw `react-native` when possible.
- Styles are standard `react-native` `StyleSheet` with numeric values.
- For theme-dependent colors, prefer `getStyles(colors)` factories + `useApp().colors`.
- Avoid hardcoded colors; use `useApp().colors` + `src/theme/theme.js` tokens.
- Prefer named/index imports where established.
- Keep components small; share logic in `src/modules` or `src/contexts/modules`.

## Safety & privacy
- Keep data local by default.
- Any remote/AI feature must be opt-in, explicit, and clearly labeled.
- Avoid sending raw transaction data off device without user confirmation.
- This codebase does have some network-backed features:
  - Rates sync (`src/services/RatesService.js`)
  - Purchases/RevenueCat (`src/services/PurchaseService.js`)
  - Optional onboarding lead capture (`src/services/LeadService.js`)

## Notifications rules
- Do not use `cancelAllScheduledNotificationsAsync` for new features.
- Use stable identifiers or scoped metadata to cancel only related notifications.

## UX rules
- Use tokens for spacing/typography from theme.
- Maintain existing layout patterns (headers, modals, list cards).

## Theme naming rules
- Surfaces: `colors.background`, `colors.surface`, `colors.accent`, `colors.inverse`
- Content on surfaces: `colors.text`/`colors.textSecondary`, plus `colors.onAccent` and `colors.onInverse`
- `tone` in primitives (`Text`, `Icon`, `Button`) represents content only. Use:
  - `tone="onAccent"` on `colors.accent` backgrounds
  - `tone="onInverse"` on `colors.inverse` backgrounds

## Tests & scripts
- `yarn start`: run Expo dev server
- `yarn lint`: ESLint
- `yarn test`: Jest

## Product direction (2026)
- Local-first always (privacy and offline usability).
- Notifications should be scoped per feature (avoid global cancel).
- Maintain schema/migrations in backups and storage.

