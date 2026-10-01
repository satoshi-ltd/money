# Môney roadmap

Updated 2026-10-01 · 3.0.97, build 73.

This is the task pool. [SPEC.md](SPEC.md) owns current state, contracts, operations and the design system;
[CHANGELOG.md](CHANGELOG.md) records what each version shipped; [AGENTS.md](AGENTS.md) defines the autonomous workflow
that consumes this file.

## How this file works

Every task is one entry that a single commit can finish, with fixed fields (decisions only need their question):

- **ID** — stable, never reused. Keep an existing ID when SPEC or the changelog cites it.
- **type** — `bug`, `feature`, `chore`, `ui` (a visible change approved from its board in `design/proposals.html`),
  `verify` (evidence from a real device), `deploy` (a build or an install outside the repository) or `decision`.
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
- **Proposed** — ideas not yet approved, from the creator or from the agent. Never worked on until approved. A purely
  visual idea is not filed here: it is a board in `design/proposals.html` and nothing else until the creator approves
  it, when it enters the Queue as one `ui` line with the board's ID and "the board" as its accept. A task that mixes
  logic and a screen splits: the screen is the board `UI-<TASKID>` and its `ui` line; the logic keeps its own ID and
  its accept carries the line "the interface follows board `UI-<TASKID>`". A board ID never equals a non-`ui` task ID;
  the rest of the contract is in [design/AGENTS.md](design/AGENTS.md).

When a task ships, delete it and record it in the changelog and in the SPEC section it changes. When a feature needs
device evidence, split it: the implementation is an agent task; the device check is a creator `verify` task that
depends on it. Every agent task also meets these, on top of its `accept`: a regression test that fails before the fix;
`yarn validate` green; no new runtime dependency or persisted field unless the task names it.

## Queue

_None._

## In progress

_None._

## Needs creator

### Builds and device checks

- **VERIFY-SAVE** — Save follows the fields
  `verify · creator · normal`
  accept: with title and amount filled, changing the account or the type keeps Save available once the default category
  is back; in Clone, changing only the account leaves Save available and Duplicate off.
- **VERIFY-A11Y** — VoiceOver and TalkBack read the app
  `verify · creator · normal`
  accept: with the screen reader on, every masthead button, the seal, the PIN keys, the suggestion chip, the tabs,
  the segments, the Settings rows and the "Hide from Analytics" checkbox are announced by name (and state where they
  have one); nothing is read as a bare "button"; a notification band is read when it arrives (TalkBack: the first one
  after idle, an error and a swap; VoiceOver: once, after a sheet closes).
- **VERIFY-DATE** — The date picker on a device
  `verify · creator · high`
  accept: on iOS and on Android the date row of a new transaction, of a clone and of a scheduled form opens the month
  in the sheet, a tap on a day then Accept sets the date, Cancel leaves it, days past the limit do not answer, the arrows
  stop at the limits, a screen reader names every day, a 6-week month fits the sheet at the largest
  text size, the 48 pt days are easy to hit, and the sheet's drag to close works on Android.
- **VERIFY-FOLD** — The side rail on the unfolded Fold
  `verify · creator · normal`
  accept: with the Fold open the four tabs are in a 128-point rail on the left, the bar and the seal are gone, New opens a new expense, the screens fill the width beside the rail from the same gutter as the bar, charts and lists use it, and Android back and the tab state behave as before; folding the device back brings the bar and the 480 column; try a rotation; the labels in German and French at the largest text size fit the rail; say how the sheets (Transaction, Clone, Scheduled, Account) and pushed panels look on the open Fold.
- **SCHED-DEVICE** — Scheduled transactions end to end on a device
  `verify · creator · normal`
  accept: create, edit and delete of weekly and monthly schedules; the monthly day clamp; no duplicate occurrence after
  a timezone or date change and after days of downtime (the 90-day window and the 100-occurrence cap hold).

### Decisions

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
- **DEC-CATEGORY-HIDDEN** — Do hidden entries belong to a category's sheet?
  `decision · creator · normal`
  accept: an entry marked "Hide from Analytics" leaves the Analytics category bar (`queryMonth` skips `isMovement`)
  but still counts in the Category sheet's total, share and average and in its "See all" (`isCategoryEntry` skips
  swaps only), so the sheet can disagree with the bar it opened from and a share can pass 100%. Decide whether the
  sheet, its count and the filtered panel follow the bar (`!isMovement`) or keep listing hidden entries, marked; the
  agent task follows the decision.

## Proposed

### Interface

- **KIT-STATES** — The states the kit does not draw
  `chore · agent · low`
  accept: `design/mobile.html` draws the empty Accounts and Scheduled screens, a paused schedule and the Later section, the Settings backup row that was never run, and the new-account sheet, each from the app's real copy, so no screen state of the code is missing from the views.

### Ledger and rates

- **FX-CLOSED-MONTH** — The closed month on Overview at its own rates
  `feature · agent · low`
  accept: the closed-month line of the Overview month block shows the figure Analytics shows for that month; its
  comparison with the usual stays in constant currency; a test that both read the same number.

### Recommender

- **REC-CATALOGS-DERIVED** — Word catalogs as memory
  `feature · agent · normal · depends: DEC-CATALOGS`
  accept: the three catalogs are built from `txs` at boot (the title memory takes 4 ms for 7,000 entries) and no
  longer persisted; `store.constants.js`, `migrateState.js` and the reducers stop carrying them; a backup with them
  still imports.
- **REC-AMOUNT-DROP** — Retire the amount fill
  `chore · agent · normal · depends: DEC-AMOUNT-FILL`
  accept: `suggestAmount` and `autoAmount` are gone; the proposal rows keep the title's latest amount as the hint.

### Insights and notifications

- **INS-PACE-SCHEDULED** — Where the month ends, with what is still scheduled
  `feature · agent · normal · depends: UI-INS-PACE-SCHEDULED`
  accept: the interface follows board UI-INS-PACE-SCHEDULED; `buildInsights` emits the projection (spent so far plus
  the expenses still scheduled this month, converted at the latest table, against the median full month of the last six)
  only while an expense is pending and at least two earlier months with spend give a usual month; tests for a low-activity month, a fixed-cost
  month, mixed currencies, a month with no spend, day 1 and occurrences across a month boundary.

### Engineering

- **SETTINGS-LEGACY** — Retire the lead-capture fields
  `chore · agent · low`
  accept: `userProfile` and `marketingLead` leave `DEFAULTS` through a migration that drops them from stored settings;
  a backup carrying them still imports.

## Discarded — don't relitigate

| Decision | Reason |
| --- | --- |
| Premium, subscriptions, lead capture | Removed from the product: nothing is measured and nothing is sold inside the app. |
| Cloud sync or an account | Local-first is the product; backups are the user's own files. |
| A trend line at today's prices, or a straight regression | Measured on the creator's ledger: the regression said −13.8% for a range that rose with r² 0.05, and the constant-price line was one number wearing a curve. The trailing average over a quarter of the range stays. |
| Amount-based disambiguation of the recommender | Measured as a wash against the title memory. |
| Hiding Transfer or Investment categories from cash flow | Only swaps between own accounts and entries marked as moved leave the chart; a category is not a reason. |
| A hard six-month window for proposals | Ranking by the last six months keeps the gain; a cut lost 1.5% of repeats, the yearly ones, exactly when they came round. |
| Savings goals | Out by the creator's decision, 2026-10-01. |
| Splitting one entry across categories | Out by the creator's decision, 2026-10-01. |
| More month-block patterns: busiest weekday, largest entry, subscriptions | The creator sees no value in them, 2026-10-01. |
| A desktop or web target | Out by the creator's decision, 2026-10-01: Môney stays mobile only. |
| A forecast signal from scheduled incomes | Out by the creator's decision, 2026-10-01: no new card either way. |
| Bounded rate downloads | Out by the creator's decision, 2026-10-01: only the first run downloads many months at once. |
| A checksum in the backup | Out by the creator's decision, 2026-10-01: an import already refuses an invalid file. |
| A weekly or monthly digest notification | Out by the creator's decision, 2026-10-01. |
| No re-animation on a range switch | Out by the creator's decision, 2026-10-01. |
| One definition of a word for the tokenizer and the title memory | Out by the creator's decision, 2026-10-01. |
| Two panes (list and detail) on the Fold | Out by the creator's decision, 2026-10-01: the rail only. |
| Folding `positive` into the accent, `surfaceSoft` into `surface` | The accent cannot be read as text on paper (income and gain use `positive`), and a disabled button needs a ground other than the sheet, which is `surface`. |
| Indexing the ledger once (PERF-INDEX) | Nothing measured says it is slow: the title memory takes 4 ms for 7,000 entries. Reopen with a measurement from a device. |
