# Money — guide for AI agents

## Quick context
- Local‑first personal finance ledger app built with Expo + React Native.
- All data is stored on device (AsyncStorage). Export/Import via JSON backup.
- Navigation: React Navigation v6 with stack + tabs.

## Context cheatsheet
- App entry: `App.js` -> `src/App.jsx`
- Navigation: `src/App.Navigator.jsx`
- Global state: `src/contexts/store.jsx` (+ reducers in `src/contexts/reducers/`)
- Persistence: `src/services/StorageService.js`
- Backups: `src/services/BackupService.js`
- Notifications: `src/services/NotificationsService.js`
- Themes: `src/config/theme.js`, `src/theme/*`
- UI primitives: `src/design-system/*` (prefer these over native)

## Project structure
- `src/screens/`: feature screens and navigation destinations
- `src/components/`: higher‑level UI pieces
- `src/design-system/`: low‑level primitives (View/Text/Button/Icon/Pressable)
- `src/contexts/`: global store, reducers, and helpers
- `src/services/`: persistence, backups, notifications, rates
- `src/modules/`: shared business logic utilities
- `src/theme/`: themes and tokens
- `assets/`: fonts and static assets

## Data model (local)
- `settings`: includes `schemaVersion`, `theme`, `baseCurrency`, `pin`, `reminders`, `language`, `autoCategory`
- `accounts`: list of account objects (`hash`, `balance`, `currency`, `timestamp`, `title`)
- `txs`: list of transactions (`hash`, `account`, `category`, `type`, `value`, `timestamp`, `title`)
- `subscription`: purchases state
- `rates`: cached exchange rates

## Schema & migrations
- Storage defaults + schema version live in `src/contexts/store.constants.js`.
- Migrations/normalization live in `src/contexts/modules/migrateState.js`.
- Backups include `schemaVersion` and the top‑level data model.

## Key flows
- App boot: `StoreProvider` hydrates AsyncStorage -> consolidates state.
- New transaction: `createTx` -> `parseTx` -> store -> state update.
- Auto‑categorization learns on each save; initial catalog builds once if empty.
- Backup: `BackupService.export` / `BackupService.import`.
- CSV export: `BackupService.exportCsv`.
- Notifications: weekly backup reminder via `NotificationsService.reminders`.
- i18n: `settings.language` drives `L10N` proxy, with EN/ES/PT/FR/DE dictionaries.

## Coding standards
- Use `src/design-system` primitives instead of raw `react-native` when possible.
- Styles live in `*.styles.js` with EStyleSheet tokens.
- Avoid hardcoded colors; use theme variables or `resolveColor`.
- Prefer named/index imports where established.
- Keep components small; share logic in `src/modules` or `src/contexts/modules`.

## Safety & privacy
- Keep data local by default.
- Any remote/AI feature must be opt‑in, explicit, and clearly labeled.
- Avoid sending raw transaction data off device without user confirmation.

## Notifications rules
- Do not use `cancelAllScheduledNotificationsAsync` for new features.
- Use stable identifiers or scoped metadata to cancel only related notifications.

## UX rules
- Use tokens for spacing/typography from theme.
- Maintain existing layout patterns (headers, modals, list cards).

## Tests & scripts
- `yarn start`: run Expo dev server
- `yarn lint`: ESLint
- `yarn test`: Jest

## Product direction (2026)
- Local‑first always (privacy and offline usability).
- Notifications should be scoped per feature (avoid global cancel).
- Maintain schema/migrations in backups and storage.
