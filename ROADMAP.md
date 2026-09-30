# Môney roadmap

Updated 2026-09-30 · 3.0.61, build 37.

This is the task pool. [SPEC.md](SPEC.md) owns current state, contracts, operations and the design system;
[CHANGELOG.md](CHANGELOG.md) records what each version shipped; [AGENTS.md](AGENTS.md) defines the autonomous workflow
that consumes this file.

## How this file works

Every task is one entry that a single commit can finish, with fixed fields (decisions only need their question):

- **ID** — stable, never reused. Keep an existing ID when SPEC or the changelog cites it.
- **type** — `bug`, `feature`, `chore`, `verify` (evidence from a real device), `deploy` (a build or an install outside
  the repository) or `decision`.
- **owner** — `agent` (finished in the repository and proved with tests) or `creator` (@soyjavi: an EAS build, an
  install, a device check, credentials or a product choice).
- **priority** — `high`, `normal` or `low`. The Queue runs top to bottom in the creator's order; in the other lanes,
  order is priority, then position.
- **depends** — IDs that must finish first.
- **accept** — what proves it done. Agent tasks need evidence a test or command can show.

Lanes:

- **Queue** — approved agent tasks, in the order they will be done. Only the creator moves a task here, with one
  exception that enters at the top: a bug the creator reports.
- **In progress** — at most one agent task.
- **Needs creator** — `verify`, `deploy` and `decision` tasks, and agent work waiting on one of them.
- **Proposed** — ideas not yet approved, from the creator or from the agent. Never worked on until approved.

When a task ships, delete it and record it in the changelog and in the SPEC section it changes. When a feature needs
device evidence, split it: the implementation is an agent task; the device check is a creator `verify` task that
depends on it. Every agent task also meets these, on top of its `accept`: a regression test that fails before the fix;
`yarn validate` green; no new runtime dependency or persisted field unless the task names it.

## Queue

### Design review · 2026-09-30

Approved 2026-09-30: the sixteen findings of the UX/UI review of every screen against SPEC 9, in this order, each with its board in `design/proposals.html`.

- **UX-LOCK-COPY** — "Log out" locks the app
  `chore · agent · low`
  accept: the row (`handleLogout` resets to the lock screen) and its dialog say lock, not log out, in the five
  dictionaries; a test on the dialog copy.
- **UX-ADD-CONTROLS** — Three shapes for "add"
  `chore · agent · low`
  accept: the Accounts masthead (IconButton), the Scheduled masthead (outlined Button with icon) and the seal
  (Footer, FloatingAdd) become two: an IconButton in every masthead that adds, the seal only for a transaction;
  a test per masthead.
- **UX-MASK-AFFORDANCE** — Masking amounts is a hidden tap on the hero
  `feature · agent · low`
  accept: a "Mask amounts" switch under Preferences stores `maskAmount`; the hero tap stays; a test.
- **UX-CHIP-TARGET** — The suggestion chip is 24 pt tall and tappable
  `chore · agent · low`
  accept: a pressable Chip renders at size `s` (32) with a hit slop that reaches 44; a test.
- **UX-ACCOUNTS-TOTAL** — Under "All" the total repeats the hero
  `chore · agent · low`
  accept: the Total row shows only with a currency filter (under All it equals net worth to the cent); a test.
- **UX-MODAL-TOKENS** — The date sheet ignores the overlay and radius tokens
  `chore · agent · low`
  accept: `Modal.styles.js` uses `colors.overlay` (today `rgba(0, 0, 0, 0.35)`) and `borderRadius.full` for the
  handle (today `2`); a test greps `src/` for literal colours and radii outside `src/theme`.
- **UX-SEPARATORS** — A hyphen where every other caption uses a middle dot
  `chore · agent · low`
  accept: "Weekly - Sun 08:00" (`Settings.jsx:311`) reads "Weekly · Sun 08:00"; a test.

## In progress

_None._

## Needs creator

### Builds and device checks

- **BUILD-PHONE** — Production build of the current version on the phone
  `deploy · creator · high`
  accept: the phone runs the version at the tip of `v3`: the current month's rates from the dated file, Save following
  the fields, the category "See all", every control named for the reader.
- **VERIFY-RATES** — The day's rate on the phone
  `verify · creator · high · depends: BUILD-PHONE`
  accept: Settings → Update rates lands the file dated today (or yesterday before it is published); a BTC account reads
  at that day's price, not at a close from the week before; a failed download says so and leaves the last-update date
  alone.
- **VERIFY-SAVE** — Save follows the fields
  `verify · creator · normal · depends: BUILD-PHONE`
  accept: with title and amount filled, changing the account or the type keeps Save available once the default category
  is back; in Clone, changing only the account leaves Save available and Duplicate off.
- **VERIFY-A11Y** — VoiceOver and TalkBack read the app
  `verify · creator · normal · depends: BUILD-PHONE`
  accept: with the screen reader on, every masthead button, the seal, the PIN keys, the suggestion chip, the tabs,
  the segments, the Settings rows and the "Hide from Analytics" checkbox are announced by name (and state where they
  have one); nothing is read as a bare "button".
- **VERIFY-FOLD** — One column on the open Fold
  `verify · creator · normal · depends: BUILD-PHONE`
  accept: on the open Pixel Fold, Overview, Analytics, the panels, the sheets and the PIN keypad sit in one centred
  column of at most 480 points with the charts drawn to its width; on a phone nothing moved.
- **SCHED-DEVICE** — Scheduled transactions end to end on a device
  `verify · creator · normal`
  accept: create, edit and delete of weekly and monthly schedules; the monthly day clamp; no duplicate occurrence after
  a timezone or date change and after days of downtime (the 90-day window and the 100-occurrence cap hold).

### Decisions

- **DEC-DESKTOP** — Does Môney get a desktop or web target?
  `decision · creator · low`
  accept: a yes or no. Until yes, `design/` carries no desktop page and SPEC keeps "mobile only".
- **DEC-AMOUNT-FILL** — Drop the word-rule amount fill
  `decision · creator · normal`
  accept: on the creator's ledger the stable amount rule answered 5.5% of repeated titles and was right 25.6% of the
  time; when it disagreed with the title's own latest amount it was right 3.2%. Decide whether `suggestAmount` and the
  persisted `autoAmount` catalog go (REC-AMOUNT-DROP).
- **DEC-CATALOGS** — Derive the word catalogs at boot
  `decision · creator · normal`
  accept: the `autoCategory`, `autoAccount` and `autoAmount` catalogs are persisted in settings, rebuilt only when
  empty and learned incrementally, so a tokenizer change never reaches an installed catalog; backups already omit
  them. Decide whether they become memory built from `txs` at boot (REC-CATALOGS-DERIVED).
- **DEC-HIDE-COPY** — What "Hide from Analytics" promises
  `decision · creator · low`
  accept: the checkbox also keeps a transaction out of the Overview month block; decide between a wider label and
  documenting the current one.
- **DEC-CATEGORY-HIDDEN** — Do hidden entries belong to a category's sheet?
  `decision · creator · normal`
  accept: an entry marked "Hide from Analytics" leaves the Analytics category bar (`queryMonth` skips `isMovement`)
  but still counts in the Category sheet's total, share and average and in its "See all" (`isCategoryEntry` skips
  swaps only), so the sheet can disagree with the bar it opened from and a share can pass 100%. Decide whether the
  sheet, its count and the filtered panel follow the bar (`!isMovement`) or keep listing hidden entries, marked; the
  agent task follows the decision.
- **DEC-INCOME-FORECAST** — Should scheduled incomes shape any forecast signal?
  `decision · creator · low`
  accept: a yes with the signal named, or a no; no new card either way.

## Proposed

### Ledger and rates

- **ACC-NEGATIVE** — Liabilities and credit cards
  `feature · agent · normal`
  accept: an account can hold a negative balance end to end (storage, `consolidate`, the account row, insights);
  tests for a negative opening balance and a card paid off.
- **FX-ONE-RULE** — One rule for historical conversion
  `chore · agent · normal`
  accept: charts, month summaries and insights convert past entries with the same month table, stated in SPEC 5 and
  proved by one shared test.
- **RATES-MONTH-KEY** — Month keys agree between the service and the reader
  `bug · agent · low`
  accept: `RatesService` keys months in UTC while `exchange()` reads the entry's local month, so in UTC+7 the first
  hours of a month read the previous table; one calendar for both, with a test at the boundary.
- **RATES-CONCURRENCY** — Bounded downloads
  `chore · agent · low`
  accept: a first run no longer fires every month's request at once; at most a handful in flight, today first, with a
  test on the order.
- **BACKUP-CHECKSUM** — A checksum in the backup
  `feature · agent · low`
  accept: exports carry a checksum of their payload and imports refuse a file that does not match it, with a test for a
  truncated file; older backups without one still import.

### Recommender

- **REC-CATALOGS-DERIVED** — Word catalogs as memory
  `feature · agent · normal · depends: DEC-CATALOGS`
  accept: the three catalogs are built from `txs` at boot (the title memory takes 4 ms for 7,000 entries) and no
  longer persisted; `store.constants.js`, `migrateState.js` and the reducers stop carrying them; a backup with them
  still imports.
- **REC-AMOUNT-DROP** — Retire the amount fill
  `chore · agent · normal · depends: DEC-AMOUNT-FILL`
  accept: `suggestAmount` and `autoAmount` are gone; the proposal rows keep the title's latest amount as the hint.
- **REC-WORD-BOUNDARY** — One definition of a word
  `chore · agent · low`
  accept: the tokenizer and the title memory split words on the same boundaries (`Coffee:beans` behaves the same in
  both); a shared helper with a test.
- **REC-CROSS-TYPE** — Proposals from the other type
  `feature · agent · low`
  accept: typing a title known only under the other type offers it, marked, when the current type has nothing.

### Insights and notifications

- **INS-PACE-SCHEDULED** — Pace with scheduled transactions
  `feature · agent · normal`
  accept: the month lead accounts for what is still scheduled this month, with tests for a low-activity month, a
  fixed-cost month and mixed currencies.
- **INS-EDGE-TESTS** — Scheduled-aware edge cases
  `chore · agent · low`
  accept: tests for a month with no spend, day 1, and conversion dates across a month boundary.
- **INS-V2** — Patterns
  `feature · agent · low`
  accept: day-of-week patterns, the largest entries of the month and subscription detection, each as one line in the
  month block, each behind a test.
- **NOTIF-TIME** — A reminder time of the reader's own
  `feature · agent · normal`
  accept: Settings offers the hour of the scheduled and backup reminders (today fixed at 08:00 the day before); the
  stored preference survives a backup round trip.
- **NOTIF-DIGEST** — A weekly or monthly digest
  `feature · agent · low`
  accept: an optional notification summarising the period, scoped by its own `kind`, never cancelling the others.

### Product

- **BUDGETS** — Soft category budgets
  `feature · agent · low`
  accept: phase 1: a soft budget per category with monthly rollover and a line in the month block; alerts are a
  later task.
- **GOALS** — Savings goals
  `feature · agent · low`
  accept: a goal with a target and monthly progress, in the base currency.
- **SPLIT-TX** — One entry, several categories
  `feature · agent · low`
  accept: a transaction split across categories keeps one balance effect and reports per category in Analytics.

### Engineering

- **UX-MONTH-TICKS** — Month ticks from the dictionaries
  `bug · agent · low`
  accept: Chart and FlowChart build their ticks with `L10N.MONTHS[i].slice(0, 3).toLowerCase()`, so German ships
  "mär" and French draws "jui" twice (juin, juillet). A `MONTHS_SHORT` key per language ("juin", "juil.") feeds both
  charts; whether ticks stay lower case is stated in SPEC 9; a French test with distinct ticks.
- **A11Y-ANNOUNCE** — Notifications announce themselves to a screen reader
  `feature · agent · low`
  accept: a notification band arriving is announced (`accessibilityLiveRegion="polite"` on Android,
  `AccessibilityInfo.announceForAccessibility` on iOS) before it auto-dismisses; a test on the announcement call.
- **PERF-INDEX** — Index the ledger once
  `chore · agent · normal`
  accept: transactions indexed by account and by month once per change and reused by Overview, Transactions and
  Analytics; a benchmark test on 10,000 entries shows no repeated sorts.
- **STATS-REVEAL** — No re-animation on range switch
  `chore · agent · low`
  accept: switching 6M / 1Y / All keeps the drawn chart and moves the pointer; the reveal plays only on arrival.
- **LINT-HOOKS** — Remaining hooks warnings
  `chore · agent · low`
  accept: `yarn lint` prints no `react-hooks` warning (Modal animations, `useMotion`, `FormTransfer` deps).
- **SETTINGS-LEGACY** — Retire the lead-capture fields
  `chore · agent · low`
  accept: `userProfile` and `marketingLead` leave `DEFAULTS` through a migration that drops them from stored settings;
  a backup carrying them still imports.
- **JEST-SHIMS** — Drop the Jest module shims
  `chore · agent · low`
  accept: the `moduleNameMapper` entries in `package.json` go when the Expo preset no longer needs them, with the
  suite green.

## Discarded — don't relitigate

| Decision | Reason |
| --- | --- |
| Premium, subscriptions, lead capture | Removed from the product: nothing is measured and nothing is sold inside the app. |
| Cloud sync or an account | Local-first is the product; backups are the user's own files. |
| A trend line at today's prices, or a straight regression | Measured on the creator's ledger: the regression said −13.8% for a range that rose with r² 0.05, and the constant-price line was one number wearing a curve. The trailing average over a quarter of the range stays. |
| Amount-based disambiguation of the recommender | Measured as a wash against the title memory. |
| Hiding Transfer or Investment categories from cash flow | Only swaps between own accounts and entries marked as moved leave the chart; a category is not a reason. |
| A hard six-month window for proposals | Ranking by the last six months keeps the gain; a cut lost 1.5% of repeats, the yearly ones, exactly when they came round. |
