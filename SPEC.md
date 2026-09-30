# Môney — specification

**3.0.61 · build 37 · Expo SDK 55 · iOS 15.1+ and Android**

This document owns how Môney works today: the product decisions, the data and its storage, the ledger rules, rates,
insights and the recommender, every screen, the operations, and the design system that code must keep.
[README.md](README.md) introduces Môney, [AGENTS.md](AGENTS.md) holds the working rules, [ROADMAP.md](ROADMAP.md)
owns remaining work and [CHANGELOG.md](CHANGELOG.md) records what each version shipped.

## Contents

- [Current state](#current-state)
- [1. Product decisions](#1-product-decisions)
- [2. Architecture](#2-architecture)
- [3. Data and storage](#3-data-and-storage)
- [4. Ledger rules](#4-ledger-rules)
- [5. Rates and conversion](#5-rates-and-conversion)
- [6. Insights and the recommender](#6-insights-and-the-recommender)
- [7. Screens](#7-screens)
- [8. Operations](#8-operations)
- [9. Design system and interactions](#9-design-system-and-interactions)
- [10. Code map](#10-code-map)

## Current state

- **3.0.61.** One Expo app (React Native 0.83, React 19, new architecture) for iOS and Android, built by the creator
  with EAS profiles `development` and `production`, locally or on EAS cloud, and installed by hand. There is no
  pipeline and no store process documented here.
- **What it does.** Accounts in any of 30 currencies, expenses, incomes and swaps between accounts, scheduled
  transactions with reminders, an Overview that reads the month against the reader's usual, Analytics with a balance
  chart, a cash-flow chart and categories, JSON backups and CSV export, a PIN with optional biometric unlock, five
  languages, light and dark themes, four text sizes.
- **Where the data is.** On the phone, in AsyncStorage, in chunks. The only network call fetches public exchange
  rates. Nothing else leaves the device.
- **Compatibility.** Schema 4. A backup from any earlier schema imports through `migrateState`; a rates cache written
  before schema 4 is dropped on boot (it priced metals per gram) and the bundled seed takes its place until the next
  download.
- **Where to start.** [Ledger rules](#4-ledger-rules) for anything that counts money, [rates](#5-rates-and-conversion)
  for a figure in the base currency, [insights](#6-insights-and-the-recommender) for the month block and the
  transaction form, [screens](#7-screens) for what each view shows, [operations](#8-operations) for commands and
  builds, and the [design system](#9-design-system-and-interactions) for any UI change.

## 1. Product decisions

Môney keeps one person's money on one person's phone and reads it back to them without a budget, a cloud or a tracker.

- **Local-first.** The ledger, the settings and the rates cache live in AsyncStorage. The app makes one kind of
  request: the public rates feed, which carries nothing about the user. There is no account, no sync, no analytics,
  no crash reporting, no identifier, no lead capture and no subscription; the last two were removed and their settings
  fields survive only for backup compatibility ([3](#3-data-and-storage)).
- **One base currency.** The reader chooses the currency they think in; every figure converts to it at the day's rate
  and a closed month at its closing day. The base can change at any time and the cached series converts in place
  without a request.
- **Money moved is not money earned.** A swap between two own accounts and a transaction the reader marks as hidden
  from Analytics stay in every balance and leave every month figure: the Overview month, the cash-flow chart,
  expenses and incomes in Analytics.
- **Read against the usual.** The month is compared with the reader's own median over six months, to the same day,
  never with a budget. Where the ledger is too young to have a usual, the app shows the figure and no verdict.
- **Backups are the reader's files.** Plain JSON with the whole ledger, and CSV for the transactions. Import validates
  before it touches anything; an invalid file never overwrites the ledger.
- **A PIN, optionally a finger.** Four digits asked on every open; the phone's biometric reader can stand in for them,
  with the PIN kept in the keychain. Neither is recoverable, and neither travels in a backup.
- **Mobile only.** iOS 15.1+ and Android, phones and the Fold in one layout. No web target.
- **Five languages,** EN, ES, PT, FR, DE, chosen from the device or in Settings. The product says Overview, Accounts,
  Analytics and Settings; copy is sentence case; ordinals and marks follow each language.
- **Quiet and exact.** Hairlines separate, nothing is elevated but a dropdown, there are three radii, figures are set
  in mono, and the accent marks what moves.

### Exclusions and limits

- No multi-user, no shared ledgers, no bank connections, no receipts or attachments.
- No budgets, goals or split transactions yet (ROADMAP proposes them).
- No web or desktop target; `design/` has no desktop page until the creator decides one.
- The rates feed is daily: intraday prices are not represented, and a closed month is one number per currency.

## 2. Architecture

```
App.js → src/App.jsx: fonts, GestureHandlerRootView, SafeAreaProvider, ErrorBoundary
  └─ StoreProvider (src/contexts/store.jsx): boot, migrations, rates sync, scheduled sync, reducers
       └─ Navigator (src/App.Navigator.jsx): onboarding | session | main tabs + sheets
            Overview · Accounts · (+) · Analytics · Settings        transactions · scheduled (panels)
            transaction · clone · scheduledForm · account · category (form sheets)
  Notification and Confirm mount beside the navigator and listen to the event emitter.
```

| Layer | Owns |
| --- | --- |
| `src/contexts` | The store: boot hydration, `migrateState`, `consolidate` (balances, per-account figures, insights), the reducers, rates sync and the scheduled sync. `useStore()` hands state and actions; `useApp()` hands colours, theme, text scale, language. |
| `src/services` | Storage (chunked AsyncStorage), rates (`RatesService`), backups, notifications, biometric unlock. The only code that talks to the device or the network. |
| `src/modules` | Pure logic: exchange, insights, recurrence, the title memory and word rules, formatting, dates, constants, i18n access. No React. |
| `src/screens` | One directory per screen with its `modules/` or `helpers/` for the queries it needs. |
| `src/components` and `src/primitives` | The design system in code ([9](#9-design-system-and-interactions)). |
| `src/i18n` | The five dictionaries and language detection. |
| `src/theme` | Tokens (`theme.js`) and the layout constants derived from them (`layout.js`). |

**Boot.** `StoreProvider` reads `accounts`, `scheduledTxs`, `settings`, `rates` and `txs`, runs `migrateState`, drops a
rates cache older than the rates schema, replaces an empty or pre-build cache with the bundled seed, rebuilds the word
catalogs when they are empty, runs the scheduled sync, then renders. A rates sync runs at boot, every six hours and on
every return to the foreground when the last download is older than six hours.

**State.** `consolidate` is a `useMemo` over accounts, transactions, rates, the base currency and today: it computes
every account's balance in its own currency and in the base, the recent-activity count, the monthly chart series and
the insights. Screens query it; nothing recomputes per row.

**Events.** `eventEmitter` carries two events: `NOTIFICATION` (a banner: `{ title, text?, error? }`) and `CONFIRM`
(a dialog: `{ title, caption, actionLabel, onAction }`).

## 3. Data and storage

### Records

| Store | Shape |
| --- | --- |
| `settings` | `schemaVersion`, `baseCurrency`, `ratesBaseCurrency`, `lastRatesUpdate`, `theme` (`light`, `dark`, `system`), `textSize`, `language`, `onboarded`, `pin`, `biometricUnlockEnabled`, `fingerprint`, `maskAmount`, `reminders`, `backupAt`, `statsRangeMonths`, `autoCategory`, `autoAccount`, `autoAmount`, and the legacy `userProfile` and `marketingLead` |
| `accounts` | `{ hash, title, currency, balance, timestamp }` — `balance` is the opening balance; the current one is computed |
| `txs` | `{ hash, account, category, type, value, timestamp, title, meta? }` — `value` is positive; `type` is 0 expense, 1 income, 2 transfer; `meta` may carry `{ kind: 'scheduled', scheduledId, occurrenceAt }` and `moved: true` |
| `scheduledTxs` | `{ id, account, category, type, value, title, startAt, pattern: { kind: 'weekly', byWeekday[] } \| { kind: 'monthly', byMonthDay }, updatedAt }` |
| `rates` | `{ 'YYYY-MM': { CODE: rate } }` — one table per month, rates relative to the base currency (1 base = `rate` units) |

`DEFAULTS` in `src/contexts/store.constants.js` is the shape every settings object is merged over. `SCHEMA_VERSION` is
4; `RATES_SCHEMA` is 4 and gates the rates cache separately.

### Storage

`StorageService` writes each store through a chunked AsyncStorage adapter: arrays are split into chunks of 500 rows
under an index `{ __chunks, __length }`; writes go through a queue so two saves never interleave; a read whose row count
is under the index throws (the store refuses to open half a ledger) and one whose count is over repairs the index. The
storage key is `com.satoshi-ltd.money`.

### Migrations

`migrateState` runs on every boot and every import. It merges settings over `DEFAULTS`, clamps the text size to a known
step, keeps only active scheduled items and drops their legacy `status`, `endedAt` and `pausedAt`, parses accounts, and
drops the rates cache when the stored schema is below `RATES_SCHEMA`. The stored `schemaVersion` is read before the
merge, because the merged object always looks current.

### Backups

An export is `{ schemaVersion, accounts, scheduledTxs, settings, txs }` as `money-<ISO date>.json`, shared through the
system sheet. `settings` leaves out `pin`, `biometricUnlockEnabled`, `backupAt` and the three catalogs. CSV export
writes `date, type, amount, currency, category, title, account`, one transaction per row.

Import picks a file, validates it (`backupValidation`: top-level keys, arrays, finite numbers, no foreign keys), asks
for confirmation with the file's counts, then replaces the ledger through `importBackup`: the current rates cache is
kept when the imported base currency matches the cached one, otherwise the seed is used and `lastRatesUpdate` is
cleared, since the backup carries the exporting device's date but never its rates. `backupAt` is written on every
successful export and drives the weekly backup nudge in Settings.

## 4. Ledger rules

- **Types.** Expense (0), income (1), transfer (2). A transfer is created as two entries, an expense on the source and
  an income on the destination, both in category 99 (swap), with the destination amount typed or computed from the
  cached rate.
- **Categories** are integers namespaced by type: expense ids (1 Food & Drinks, 7 Shopping, 8 Home, 13 Transit, 9
  Healthcare, 15 Insurance, 6 Leisure, 3 Travel, 4 Debt, 5 Investment, 10 Personal, 11 Services, 12 Transfer, 14
  Education) and income ids (with 2 Investment, 4 Transfer, 3 Salary, Passive, …) are read through
  `L10N.CATEGORIES[type]`. Expense 5 and income 2 are investments; 99 is a swap in either type.
- **Movements.** `isInternalTransfer(tx)` is category 99; `isMovement(tx)` is that or `meta.moved === true`. Every
  month figure skips movements: the Overview month block and its baselines, the cash-flow bars, expenses and incomes in
  Analytics. Balances count everything.
- **Balances.** An account's current balance is its opening balance plus incomes minus expenses in its own currency;
  its base figure converts that balance with the current month's table. Net worth is the sum over accounts of the base
  figures that could be converted; an account whose currency has no rate is left out rather than counted as 0.
- **Scheduled transactions.** `runScheduledSync` runs at boot and on every return to the foreground: for each template
  it generates the occurrences between 90 days ago and now, skipping any whose `${scheduledId}:${occurrenceAt}` already
  exists in a transaction's `meta`, and creates at most 100 per run. Weekly patterns carry the weekdays; monthly
  patterns carry the day, clamped to the month's length. The next occurrence is what Scheduled shows and what the
  monthly impact sums.
- **Notifications.** Two kinds, each with its own `kind` metadata: `scheduled-tx` (the day before an occurrence at
  08:00 local, at most 8 per template and 48 in total over the next 90 days, reconciled against what is already
  scheduled) and `backup-reminder` (weekly, Sunday 08:00 local, when the reminder is on). Turning a feature off cancels
  only its own kind. Notifications are unavailable in Expo Go on Android and quietly skipped there.
- **Recommender learning.** Creating or editing a transaction feeds the three word catalogs (`learnAutoCategory`,
  `learnAutoAccount`, `learnAutoAmount`); the title memory is not stored, it is built from `txs` when the form mounts.

## 5. Rates and conversion

**Feed.** `@fawazahmed0/currency-api`, read from jsdelivr first and the `currency-api.pages.dev` mirror second, per
day (`…/currency-api@YYYY-MM-DD/v1/currencies/<base>.json`) with a 10 s timeout per request. Only the currencies the
app knows are kept. Metals come per troy ounce.

**Month tables.** The cache is one table per month since 2024-03. A closed month is read at its closing day (day 0 of
the next month) and never again, except the month a download was last made in, which is provisional and re-read at its
close. The current month is read from the file dated today, falling back to yesterday and the day before, and only
then from the `latest` alias, because the CDN in front of the feed has held that alias a week behind with a clean 200.
The current month is requested first and alone: without it the download did not happen — `get()` throws, the caller
keeps its cache, `lastRatesUpdate` stays put and Settings says so instead of "updated". The remaining missing months
are read in parallel afterwards.

**Seed.** `src/modules/ratesSeed.json` bundles every month at its close plus the build month, generated by
`yarn rates:seed` (`SEED.date` stamps it). A cache that is empty, or downloaded before the seed was built, is replaced
by the seed at boot; a seeded cache never dates itself as a download.

**Base changes.** Cross rates are exact, so changing the base currency converts every cached table in place
(`rebaseRates`) with no request; `ratesBaseCurrency` tags the cache and a mismatch drops it instead of merging.

**Conversion.** `exchange(value, currency, base, rates, timestamp?)` divides by the rate of the month the timestamp
falls in (local calendar), or of the latest month with that currency when no timestamp is given, or of the nearest
earlier month when that one is missing. It returns `undefined` when there is nothing to convert with; callers skip the
figure and never substitute 0. Lookups are memoised per rates object.

**Sync.** At boot, every six hours and on foreground when `lastRatesUpdate` is older than six hours; the manual
"Update rates" in Settings always downloads. Settings shows the last successful download beside the row.

## 6. Insights and the recommender

### The month block

`buildInsights` reads the current month against a baseline: the median, over the last six months, of what had been
spent by the same day of each month (movements excluded). Six, not three, because two months that each carried an
early one-off outvoted the ordinary one. It emits:

- **trend** — `spent`, `baseline`, `day`, and a `direction` (`over`, `under`, `flat` within 5%); a percentage when the
  baseline is at least 10% of a full-month median, a word when it would only overclaim. Below two comparable months
  there is no verdict.
- **closed** — last month's total, once the month has closed, with the same reading against its own baseline.
- **swing** — the category that moved most against its median to date, when the move is at least 5% of the baseline.
- **incomes** — the month's incomes and their reading.
- **scheduled** — what is still scheduled this month and its net effect.

The Overview month block draws the lead line (spent so far, its pace), a bar of spent against usual with a tick at the
usual, "Usual by the 9th · figure" in the language's own ordinal, then one line per insight. The scheduled line is a
button, "See all N" with a chevron, that opens Scheduled.

### The transaction form

- **Title memory.** `buildTitleMemory(txs)` groups every non-swap entry by type and exact title (case-insensitive) and
  sorts each group by time. `recallTitles(memory, { prefix, type })` offers up to two titles for a prefix of two or more
  characters: titles that start with the prefix first, then titles containing a word that starts with it; within each
  tier, the most repeated in the last six months, then all-time count, then the latest. Each proposal carries the
  majority category and account of the title's last ten entries (ties to the most recent) and its latest amount.
  `recallTitle(memory, { title, type })` answers the same for an exact title from a single sighting on.
- **Filling.** On every keystroke the form takes back what the previous keystroke filled in and reads the whole title
  afresh: the title memory first, the word rules (`suggestCategory`, `suggestAccount`) only for a title never seen;
  the amount comes from the stable word rule (`suggestAmount`, minimum three sightings at 90%). A category the screen
  defaulted counts as free; one the reader chose is never overruled. The type flips to the other one only when the
  exact title exists there and not here. A dismissible chip names what was filled.
- **Proposals.** Two rows under the concept field; a tap writes title, amount, account and category and withdraws the
  rows until the title changes.
- **Completeness.** `isTransactionComplete`: a title, a positive amount and, where the form shows one, a category. The
  Transaction and Clone screens derive Save from it at render; nothing stores a validity flag.
- **Defaults.** A new transaction opens on the account's most frequent category for its type; choosing another account
  starts the category over from that account's habit.

## 7. Screens

- **Onboarding** — four steps with a folio (01 / 04): cover (four claims), base currency (grouped picker, the seed
  converts offline), first account (currency, opening balance written as the first entry, name), then a four-digit PIN
  typed twice. Finishing marks `onboarded`, saves the PIN and creates the account.
- **Session** — the lock screen: wordmark, four dots, a numeric keypad with letters, a biometric key when the reader is
  on (auto-prompted on arrival), the version at the foot. A wrong PIN shakes.
- **Overview** (Dashboard) — masthead with the date and search; the net-worth hero (tap masks amounts) with the month's
  delta; the month block ([6](#6-insights-and-the-recommender)); the three accounts with most activity in the last 30
  days with their balance and month delta; the latest transactions grouped by day, loading 32 at a time; search filters
  the list. Empty ledger: an empty state that leads to the first account.
- **Accounts** — net worth, the distribution bar by currency with its legend, a currency filter, every account with its
  balance and base figure, and the total of the filter. A row opens Transactions for that account.
- **Transactions** — a panel for one account: balance hero with the month delta, the month's incomes and expenses as
  bars, the list by day, a floating add button, Edit in the masthead. Swipe a row to delete; tap to open Clone. Opened
  from a category it lists that category's entries of the month across accounts, titled after both, without the
  account hero or Edit.
- **Transaction** (sheet) — expense, income or swap toggle; the form of [6](#6-insights-and-the-recommender) with
  concept, proposals, amount with the account's symbol, account, category, "Hide from Analytics", date; Save. A swap
  shows from, send, destination, receive.
- **Clone** (sheet) — the same form seeded from an entry, with Delete, Duplicate (only when unchanged) and Save.
- **Scheduled** — a panel with the monthly impact, then the templates in three groups (next 7 days, this month, later)
  with the next date, the rule in words and the amount. Reached from Settings and from the Overview month block.
- **Scheduled form** (sheet) — type, concept, amount, account, category, weekly (weekday chips) or monthly (date) rule,
  a preview of the next occurrence, Delete and Save.
- **Analytics** (Stats) — range toggle (6M, 1Y, All) in the masthead; the balance chart with its trailing average over a
  quarter of the range and a legend; the cash-flow chart with incomes above and expenses below the baseline, median
  reference lines, bars clipped at three times the median with a break, and a pointer that selects a month; month KPIs
  (in, out, net); expenses and incomes by category with an "Others" fold. A category opens its sheet. Under two
  months of history there is no line to draw: the screen shows an empty state that leads to the first entry.
- **Category** (sheet) — the category's month total and share of spend, the delta against its average, "Where it went"
  by merchant with bars and counts, and the latest entries; "See all N" opens Transactions filtered to that category
  and month.
- **Account** (sheet) — currency, opening balance with its base equivalent, name; Delete, Cancel, Save. The first account
  hides Cancel and Delete.
- **Settings** — a backup nudge when the last export is over a week old; Data (Update rates with its last run, Export,
  Import, Export CSV); Appearance (theme, text size); Preferences (language, currency, Scheduled with its count, backup
  reminder switch); Unlock (the biometric switch named after the reader); About (terms, privacy, security); Account &
  data (log out, reset); the colophon.

## 8. Operations

### Commands

| Command | Does |
| --- | --- |
| `yarn start` | Metro for the development client (`expo start --dev-client --scheme money`); `a` opens Android |
| `yarn test` · `yarn lint` · `yarn lint:fix` | Jest; ESLint over `src`; autofix |
| `yarn validate` | `check:release`, `lint`, `test` — the one command before claiming done |
| `yarn check:release` | `package.json` and `app.json` agree on version and build, and `CHANGELOG.md` has the entry |
| `yarn bump [minor\|major]` | Moves `version`, `ios.buildNumber` and `android.versionCode` together and opens the changelog entry |
| `yarn design` | Regenerates `design/` from the tokens, the copy and the roadmap |
| `yarn rates:seed` | Rebuilds `src/modules/ratesSeed.json` from the feed |
| `yarn build:local:dev` · `yarn build:local:prod` | `eas build --local`: the dev client installed on the device; the signed APK in `release-assets/` |
| `yarn build:dev` · `yarn build:prod` | The same profiles on EAS cloud, downloaded (and installed for dev) |

### Builds

Every build runs `check:release` first. The dev client is a native shell; JavaScript comes from Metro, so it is
rebuilt only for native changes (a dependency with Android code, a plugin in `app.json`, the SDK).
`yarn build:local:dev --install-only` reinstalls the APK already in `release-assets/`. Dev builds install on the
first USB device, else a running emulator, else they boot `Pixel_9_Pro_Fold` (`ANDROID_AVD`, `ANDROID_SERIAL`).
Installation is `adb install -r`: app data is kept and a signature mismatch stops the install; the EAS keystore is
never replaced. The toolchain is the machine's (`ANDROID_HOME`, Android Studio's JBR); `postinstall` patches the
Gradle plugin so RN 0.83 compiles under Gradle 9.

### Release

A version is `x.y.z` in `package.json` and `app.json`, with one build number in `ios.buildNumber` and
`android.versionCode`. Every commit that changes what ships bumps the patch and writes its changelog entry; the changelog
heading is `## x.y.z — YYYY-MM-DD`.

### Development environment

Metro, the emulator (`Pixel_9_Pro_Fold`) and the phones are the creator's and carry the real ledger. Two `adb` binaries
of different versions on the same machine (Homebrew and the SDK) fight over the server and leave the emulator offline;
Expo uses the SDK's, so use that one. Fonts are Euclid Circular A (regular, medium, semibold) and Geist Mono (regular,
medium) from `assets/fonts`.

### Tests

Jest with `jest-expo`, tests beside the code in `__tests__`. Store tests mount `StoreProvider` with a mocked
`services` module and unmount in `afterEach` (the provider keeps intervals alive). Screen and component tests use
`react-test-renderer` with `contexts`, `components` and `modules` mocked as each test needs. Scripts have their own
tests under `scripts/__tests__`, run against temporary copies.

## 9. Design system and interactions

`src/theme/theme.js` is the token file; `src/theme/layout.js` derives every size from it. `design/` renders both.

### Foundations

- **Colour.** Paper and ink: light `background #F6F4EE`, `surface #EEEBE0`, `surfaceSoft #E6E2D5`, `text #15140F`,
  `textSecondary #3D3A31`, `textMuted #6E6857`, `border #DCD7C7`, `rule #15140F`; the accent `#FFBC2D` with
  `onAccent #2A2008` and `accentSoft #F6E7C0`; `positive #87620E`, `danger #A8442A`, `dangerSoft #F0E0DA`,
  `warning #A87515`, `inverse #15140F` / `onInverse #F6F4EE`, `overlay rgba(21,20,15,0.36)`. Dark keeps the roles on
  `#14130E` / `#1E1C16` / `#2A2720` with ink `#F2EEE2` and accent `#FFC94D`. Colours are read from `useApp().colors`;
  the app icon is the one place the mark inverts on fixed colours.
- **Type.** Euclid Circular A for copy, in two ramps: `micro 10`, `tiny 11`, `caption 12`, `body 14`, `subtitle 15`,
  `heading 22`, `title 28` (line heights 14 to 32). Geist Mono for figures, tabular, tracking −0.3: `xs 10`, `sm 12`,
  `md 14`, `lg 19`, `xl 26`, `hero 36`. Eyebrows are `tiny`, bold, uppercase, tracked 1.4. Titles track −0.56. Four
  text sizes multiply both ramps; `scaledType` applies the scale to every composed style.
- **Icons.** Lucide glyphs drawn inline (`src/primitives/Icon`), stroke 1.5, sized from the icon ramp (11 to 24) and
  inked from the tone.
- **Space.** `xxs 4 · xs 8 · sm 12 · md 16 · lg 20 · xl 32 · xxl 48`. The screen gutter is `lg`.
- **Radius.** Three: 0 for flat blocks, 4 for anything touchable, full for dots. Every named radius is 4.
- **Rules.** Separation is a 1 px hairline in `border`; a heading closes with a hairline in `rule`. Nothing is elevated
  except the dropdown, which floats over live content with no scrim.
- **Motion.** `quick 250 ms`, `standard 350 ms`, cubic ease; the floating add button springs in after the push; the
  dropdown fades and scales from 0.95; the lock screen shakes on a wrong PIN.

### Shared geometry

`viewOffset 20`, `rowHeight 44`, `fieldHeight 42`, `buttonHeight 46`, `iconButtonSize 34`, `sealSize 40`,
`wellSize 32`, `categorySize 80`, `dropdownWidth 260`, cards `216 × 152`, options `83`.

### Primitives

`Text` (size, figure, tone, weight, mono), `View` (row, gap, offset, flex), `Pressable` (opacity 0.92 when pressed),
`Button` (primary, secondary, outlined, ghost, danger, dangerSoft; s/m/l; icon-only; loading), `Input` (grows, placeholder
`...` when blurred), `Icon`, `ScrollView` (snap intervals).

### Components

Masthead (wordmark or back + name, an eyebrow section, a search field, actions; a rule under it on tabs), Footer (four
tabs and the seal), Eyebrow, Heading (title, eyebrow, actions, rule), PriceFriendly (figure ramp, sign, symbol only for a
foreign currency, mask), Delta (a chip beside a hero, plain in a row; accent when the move is wanted), Chip (muted,
accent, soft, outline, inverse; pill or circle), Checkbox, SegmentedToggle (flex, scrollable or compact; the selected
segment inverts), FieldRow (twelve-character muted label, value column, chevron), Setting and SettingSelect (row,
subtitle, right value, switch, dropdown), Dropdown (floating list with symbol wells and a check), Field, InputField,
InputAmount (base equivalent as suffix), InputCurrency (symbol well), Card, Chart (line, trend, pointer, axis, legend),
FlowChart (bars, medians, break marks, month labels), MonthSummary, TransactionsList and TransactionItem (time,
title, category, amount and base figure; swipe to delete), EmptyState, Notification (a band from the top: accent,
inverse or danger), Confirm (dialog with a danger well), Modal (bottom sheet with a drag to close), Panel (screen
with masthead, floating element, sheet mode), Screen (scroll with keyboard insets), IconButton, FloatingAdd, Logo,
Mark, Colophon.

### Sheets and navigation

Tabs sit in a Footer with the seal in the middle; forms open as native form sheets whose detents come from the tokens
(rows, headings, toggles, keyboard), never measured, so Android reads them once at mount. Panels push with a masthead
that carries the back key and the screen name in the wordmark's slot. The sheet surface is `surface`; tabs and panels
sit on `background`.

### Accessibility

Every control that is only a glyph carries a label and a role from the dictionaries: the masthead's search, back and
close, the notification's close, the seal and the floating add (the same "Add transaction" the empty state uses), every
key of the PIN keypad (the digit itself, "Delete the last digit", the reader's own name: Face ID, Touch ID, fingerprint,
face), the dismissible chip (its text, with a "Dismiss" hint) and the adds in Accounts and Scheduled. Every Button has
the button trait. Controls that carry text are read by that text, never by a label that would drop part of it: tabs
are tabs with a selected state; segments and dropdown options are buttons with a selected state; a Settings row is a
button with its disabled state. On iOS an accessible row is a leaf for VoiceOver, so a row that holds a control is
the control: a toggle row is one switch with its checked state and the native switch hidden from the reader, and the
"Hide from Analytics" row is one checkbox with its glyph hidden. A notification band that dismisses on tap is one
button with a "Dismiss" hint; otherwise the band is not accessible and its close is. A keypad slot with nothing behind
it is not accessible at all.

### Copy rules

Product words: Overview, Accounts, Analytics, Settings, Scheduled, Swap. Sentence case everywhere but eyebrows.
A caption that runs on from a figure ("this month", "4 accounts") is its own dictionary key in each language's own
case, and a count is a function of its number ("1 account", "4 accounts"); a label that puts words in a language's
own order ("Save expense", "Ausgabe speichern") is its own key too. Code never lowercases or templates translated
copy, because German capitalises its nouns and puts the verb last. Figures never wrap: columns size
from their text. A verdict is a word when a percentage would overclaim.

### Boundaries

Every screen uses the components above; a screen never restyles a component in place. A new visual pattern lands in
`src/components`, in this section and in `design/` in the same change.

## 10. Code map

```
App.js, src/App.jsx, src/App.Navigator.jsx      entry, providers, navigation
src/contexts/store.jsx                          boot, sync loops, actions
src/contexts/store.constants.js                 DEFAULTS, SCHEMA_VERSION, RATES_SCHEMA
src/contexts/modules/                           migrateState, consolidate, calcAccount, runScheduledSync, ratesSync
src/contexts/reducers/                          createTx, updateTx, deleteTx, accounts, scheduled, importBackup, updateRates, updateSettings, resetAppData
src/services/                                   StorageService, RatesService, BackupService, NotificationsService, BiometricAuthService
src/services/modules/                           asyncStorage (chunks, queue), backupValidation, scheduledNotifications
src/modules/                                    exchange, insights, recurrence, titleMemory, autoCategory/Account/Amount, autoTokens,
                                                isMovement, isInternalTransfer, median, monthFlow, dailyNet, monthlyImpact,
                                                ledgerDate, verboseDate, figureText, currency*, constants, l10n, icon, ratesSeed.json
src/i18n/                                       dictionaries (EN, ES, PT, FR, DE), detection, formatting
src/theme/                                      theme.js (tokens), layout.js (geometry)
src/primitives/, src/components/                the design system
src/screens/<Screen>/                           the screen, its style, modules/ or helpers/, components/
scripts/                                        check-release, bump, design, android-build, rates-seed, prepare-native
design/                                         the generated kit (index, mobile, proposals)
```
