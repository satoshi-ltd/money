# Môney roadmap

Updated 2026-11-15 · 3.0.99, build 75.

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

- **VERIFY-DATE** — The date picker on a device
  `verify · creator · high`
  accept: on iOS and on Android the date row of a new transaction, of a clone and of a scheduled form opens the month
  in the sheet, a tap on a day then Accept sets the date, Cancel leaves it, days past the limit do not answer, the arrows
  stop at the limits, a screen reader names every day, a 6-week month fits the sheet at the largest
  text size, the 48 pt days are easy to hit, and the sheet's drag to close works on Android.
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
- **VERIFY-FOLD** — The side rail on the unfolded Fold
  `verify · creator · normal`
  accept: with the Fold open the four tabs are in a 128-point rail on the left, the bar and the seal are gone, New opens a new expense, the screens fill the width beside the rail from the same gutter as the bar, charts and lists use it, and Android back and the tab state behave as before; folding the device back brings the bar and the 480 column; try a rotation; the labels in German and French at the largest text size fit the rail; say how the sheets (Transaction, Clone, Scheduled, Account) and pushed panels look on the open Fold.
- **SCHED-DEVICE** — Scheduled transactions end to end on a device
  `verify · creator · normal`
  accept: create, edit and delete of weekly and monthly schedules; the monthly day clamp; no duplicate occurrence after
  a timezone or date change and after days of downtime (the 90-day window and the 100-occurrence cap hold).

- **VERIFY-DECIMALS** — A comma decimal on a phone that types one
  `verify · creator · normal`
  accept: on a phone in Spanish or German, a swap typed "12,5" in Send and "9,75" in Receive saves 12.5 and 9.75, and an
  opening balance of "1200,50" in Onboarding creates the account with 1,200.50.
- **VERIFY-PERMISSIONS** — The Android binary asks only for what Môney uses
  `verify · creator · normal · depends: ANDROID-PERMISSIONS`
  accept: on the next production build, `aapt2 dump permissions` on the APK lists only INTERNET, VIBRATE,
  USE_BIOMETRIC/USE_FINGERPRINT, POST_NOTIFICATIONS, RECEIVE_BOOT_COMPLETED and what scheduling an exact local
  notification needs; reminders and scheduled notifications still fire after a reboot; backup export and import
  still open the system pickers.
- **VERIFY-THEME-SYSTEM** — The System theme follows a dark iPhone
  `verify · creator · normal`
  accept: with Settings → Theme on System, switching the iPhone between light and dark switches the app, the splash
  and the status bar; Light and Dark still override the phone, and Light on a dark phone keeps the keyboard and
  alerts light; the same on Android.

### Site

- **DEPLOY-SITE** — Publish the landing page at money.satoshi-ltd.com (handed to Mikel, Satoshi's devops)
  `deploy · creator · normal`
  accept: a Cloudflare Pages project exists for it with its production branch set to `main`, Git deploys off, and `money.satoshi-ltd.com` pointing at it; the
  repository has secrets `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` (Pages Edit) and variable
  `CLOUDFLARE_PAGES_PROJECT_NAME`; a manual run of `publish-site` from `main` goes green and serves the page with
  the Android button disabled; after a GitHub Release `v<version>` carries `money-<version>-android.apk`, the next
  run shows that version and turns the direct-APK link into the download; the two store buttons open the App Store and
  Google Play listings.

### Decisions

- **DEC-CATEGORY-HIDDEN** — Do hidden entries belong to a category's sheet?
  `decision · creator · normal`
  accept: an entry marked "Hide from Analytics" leaves the Analytics category bar (`queryMonth` skips `isMovement`)
  but still counts in the Category sheet's total, share and average and in its "See all" (`isCategoryEntry` skips
  swaps only), so the sheet can disagree with the bar it opened from and a share can pass 100%. Decide whether the
  sheet, its count and the filtered panel follow the bar (`!isMovement`) or keep listing hidden entries, marked; the
  agent task follows the decision.

- **DEC-RELOCK** — Should the ledger lock again when the app comes back from the background?
  `decision · creator · high`
  accept: SPEC says the PIN is "asked on every open", but Session is only the navigator's initial route
  (`App.Navigator.jsx:173`); the AppState handlers in `store.jsx` and `Session.jsx` sync schedules, rates and the
  biometric prompt and never return to it, so a phone handed over hours after unlocking shows the ledger. Choose:
  lock on every return, lock after a time in the background (and whether that time is a setting, which is a new
  persisted field), or keep today's behaviour and reword SPEC to "on every cold start". The agent task and its
  device check follow the decision.
- **DEC-SWAP-LEG-EDIT** — What does a tap on one leg of a swap open?
  `decision · creator · high`
  accept: a leg opens Clone like any entry (`TransactionItem.jsx`), titled Expense or Income with ordinary
  categories selectable, and `updateTx` writes that one hash: changing a leg's amount, account or date leaves its
  counterpart behind, so net worth moves while both stay out of the month. Choose a read-only sheet with Delete
  only (delete already removes both legs), or a swap-aware form that edits both. A duplicate of a leg no longer joins
  the pair; the form and its board follow this decision.
- **DEC-SCHEDULED-DELETED** — Should a deleted occurrence of a schedule stay deleted?
  `decision · creator · normal`
  accept: the only record that an occurrence was created is the entry itself (`runScheduledSync.js:30-54`), so
  deleting this month's generated rent brings it back on the next foreground, for the 90 days of the window.
  Choose: keep that (the template is the truth; delete the template or move its start), or remember skipped
  occurrences, which needs a persisted list on the template that travels in backups. The agent task follows.
- **DEC-ACCOUNT-FLOW-MOVED** — Do swaps and hidden entries count in an account's month bars and in a day's net?
  `decision · creator · normal`
  accept: `monthFlow` (the Incomes and Expenses bars of an account's panel) sums every entry by type, swap legs and
  `meta.moved` included: a swap of 500 and an expense of 10 read "Expenses 510"; its test "ignores transfers" only
  covers type 2, which no stored entry has. `dailyNet` (the day header) skips swaps but not `meta.moved`. Either both
  follow `isMovement` like every other month figure, or SPEC states that an account's own panel shows everything
  that crossed it. One rule for both; the agent task follows.
- **DEC-SITE-PRIVACY** — Which privacy policy does the landing page link?
  `decision · creator · normal`
  accept: the app points at `satoshi-ltd.com/privacy`, `/terms` and `/security` (`src/modules/constants.js`), the
  page at `site/index.html` links neither, and both stores expect the policy reachable from the product page.
  Choose the company's policy or a page of Môney's own under `money.satoshi-ltd.com`; SITE-META adds the link.
- **DEC-ICLOUD-ENTITLEMENT** — Does a "no cloud" app keep the iCloud container entitlement?
  `decision · creator · low`
  accept: `app.json` sets `ios.usesIcloudStorage: true` and the document picker's `iCloudContainerEnvironment:
  Production`, which add iCloud entitlements to the binary. Find out on a device whether picking a backup from
  iCloud Drive in Files still works without them, then keep or drop them. The same pass removes
  `LSMinimumSystemVersion` (a macOS key that does nothing on iOS; the 15.1 floor is only Expo's default) and decides
  whether `eas.json` should also build the AAB the Play listing needs.
- **BACKUP-SHARE-OUTCOME** — What should the backup timestamp promise?
  `decision · creator · normal`
  accept: installed expo-sharing resolves without a result for both completion and dismissal on iOS
  (`SharingModule.swift`), and on Android its activity-result handler resolves without inspecting the result.
  BackupService treats that resolution as success and Settings advances `backupAt`, clearing the weekly nudge.
  Choose whether to describe that timestamp as the last export attempt (for example, "Last export", without
  claiming a saved copy), or require the reader to confirm that a copy was saved before the nudge resets.
  Prefer accurate export wording over an extra confirmation step; neither the current API nor a mocked test
  can establish that another app retained the file. Keep the persisted key compatible; implementation and any
  copy board follow the decision, with device verification if the sharing flow changes.
- **DEC-FX-COVERAGE** — How should a partial total read when a currency cannot convert?
  `decision · creator · normal`
  accept: `calcAccount` uses zero for unavailable historical conversions, `consolidate` sums the convertible
  balances, and Accounts' filtered total also defaults missing base amounts to zero. Decide whether totals
  with incomplete rate coverage keep the available subtotal with an explicit coverage indication, or are
  unavailable until every participating account can convert. Define the all-missing case and apply one rule
  to net worth, filtered totals, historical balances and their deltas. Preserve native balances and valid zeroes.
  The account-row correction FX-MISSING-VALUES can proceed independently; no chart-gap or subtotal design is
  implied by it. A scoped implementation and its board follow this decision.

## Proposed

### High priority

- **ANDROID-PERMISSIONS** — Ship only the Android permissions the app uses
  `chore · agent · high`
  accept: the 3.0.99 APK declares 30 permissions, among them SYSTEM_ALERT_WINDOW, READ/WRITE_EXTERNAL_STORAGE,
  `c2dm.permission.RECEIVE` (push), the install-referrer binding and some fifteen launcher-badge ones, because
  `app.json` has neither `android.permissions` nor `android.blockedPermissions`. Block what the template and
  `expo-notifications` add and nothing the app needs (local notifications, boot rescheduling, biometrics, the rates
  request); `privacy.test.js` asserts the block list and that `app.json` has no `updates` block. Needs: native
  build; the binary check is VERIFY-PERMISSIONS.

### Normal priority

- **IMPORT-RATES-TIMESTAMP** — An imported backup must not vouch for this phone's rates
  `bug · agent · normal`
  accept: `importBackup.js:17-23` drops the backup's `lastRatesUpdate` only when the cache was seeded; with a local
  cache and the same base, the exporting phone's later timestamp marks months as final that this phone never
  finished downloading, and Settings shows a last update that did not happen here. A malformed value
  (`"lastRatesUpdate": "abc"`) imports and then throws `Invalid time value` on every start
  (`RatesService.js:111`). After an import the timestamp is this phone's own or undefined, and `ratesOrSeed` reads
  an invalid date as no download; tests for both.

- **SETTINGS-IMPORT-VALIDATION** — Validate the settings of a backup, not only their container
  `bug · agent · normal`
  accept: `migrateState.js:20-27` clamps `textSize`, `reminderHour` and `budgets`; `baseCurrency`, `reminders`
  (read as an array at `NotificationsService.js:88`), `statsRangeMonths`, `language` and `theme` pass through
  untouched. An unsupported value falls back to its default (or rejects the import where there is no safe default,
  as for an unknown base currency); a test per field, and every supported old backup still imports.

- **DATES-LOCALE** — Dates follow the language of the app
  `bug · agent · normal`
  accept: the store exposes no `session`, so `locale` is undefined in `FormTransaction.jsx:52`, `Dashboard.jsx:20`
  and `ScheduledForm.jsx:40`; `Dashboard.ListHeader.jsx:63`, `MonthSummary.jsx:121` and `Category.jsx:183` pass none;
  `verboseDate` and `ledgerDate` then default to `en-US`. In Spanish the masthead reads "Sun 15 Nov 2026" and the
  month eyebrow "November". One source (`useApp().language`) reaches every call; a test per call site renders a
  German date, and no formatter keeps an `en-US` default.

- **SCHEDULED-FORM-CATEGORY-TYPE** — A schedule cannot keep a category of the other type
  `bug · agent · normal`
  accept: in ScheduledForm, pick an expense category and switch to Income (`ScheduledForm.jsx:190` changes the type
  only): the row shows "...", Save stays enabled and stores an income with an expense id, which every reader then
  looks up within the wrong type. Changing the type clears the category and Save waits for one of that type;
  a render test covers both directions and an edit of an existing template.

- **MASK-LEAKS** — "Hide amounts" hides the chart scale and the budget total
  `bug · agent · normal`
  accept: with amounts masked, the gridline labels of the net-worth chart (`Chart.jsx:126`, `compactFigure` in a
  plain Text) and "of 345" in the Category sheet (`Category.jsx:145`) still show figures. Both are masked like the
  amounts beside them, to the eye and to a screen reader; a render test per place, and one that walks every screen
  test's masked render for a digit followed by "k" or a currency figure.

- **INSIGHTS-SHORT-MONTH** — On the last day of a short month, earlier months count whole
  `bug · agent · normal`
  accept: `insights.js:54,101` counts an earlier entry as "to date" when its day is at most today's: on 28 February,
  rent paid on the 30th in December and January is left out of the usual, so the pace reads "+333% over" and the
  swing "Home +1000". When today is the last day of its month, every day of an earlier month is to date; the
  fixture reads flat with no swing, and 30 April against the 31st behaves the same.

- **SCHEDULED-IMPACT-DUE-DAY** — A monthly schedule counts once in the 30-day figure
  `bug · agent · normal`
  accept: `monthlyImpact.js` counts occurrences in a 30-day window closed at both ends and starting now: rent of
  1000 on the 15th reads −2000 on the morning of 15 November (the 15th of November and of December) and −1000 the
  day after. `getNextOccurrenceAt` normalises `afterAt` to midday, so at 15:00 on the due day "next" is today's
  occurrence, already recorded. The window never holds a monthly template twice and "next" is after now or skips
  recorded occurrences; tests at 09:00 and 15:00 on the due day.

- **DAY-GROUP-DST** — Entries group under their own local day
  `bug · agent · normal`
  accept: `groupTxsByDate.js` shifts every timestamp by today's UTC offset: read in November, an entry of 10 July at
  00:30 falls under 9 July, and in summer a winter entry from 23:00 moves to the next day. It also sorts the
  caller's array in place. Group by each entry's local calendar day without mutating the input; the suite gains a
  DST timezone run (`TZ=Europe/Madrid`) covering this module and `recurrence`.

- **OVERVIEW-SEE-ALL** — "See all" on Overview's transactions opens something
  `bug · agent · normal`
  accept: `Dashboard.ListHeader.jsx:130` navigates to `transactions` with no params and `Transactions.jsx:35`
  answers an empty list without an account, so the link shows "no transactions" over a full ledger. It lists the
  whole ledger by day without the account hero or Edit, as the category route already does, or the link goes;
  a render test follows the link. Before approval the destination needs its board, not drawn yet.

- **OVERVIEW-EMPTY-STATES** — Overview says when there is nothing to show
  `bug · agent · normal`
  accept: SPEC promises an empty state that leads to the first account, and `Dashboard.jsx` has no
  `ListEmptyComponent`: an empty ledger and a search with no match are both a blank list. Restore the first with
  the EmptyState the other tabs use and give the search its own line; render tests for both. The Mobile view has
  neither state; before approval both need their board, not drawn yet.

- **CATEGORY-INCOME-COPY** — An income category does not talk about spending
  `bug · agent · normal`
  accept: the Category sheet opens for incomes from Analytics (`ItemGroupCategories.jsx:83-91`) and says "of
  spend" (`Category.jsx:85`) and "Where it went" (`:154`), and its Delta is always `inverted`, so an income above
  its average reads as unwanted. Copy by type in the five dictionaries and `inverted` for expenses only; tests for
  an income sheet in EN and DE. The same pass makes Analytics' KPI heading say the month's name for a past month
  instead of "Month to date" (`MonthKpis.jsx:17`). New copy: its board shows it in the languages before approval.

- **A11Y-ROW-ROLES** — Every row that is a button says so
  `bug · agent · normal`
  accept: these answer a tap and carry no role, name or state: `FieldRow.jsx:16` (the Account, Category and Date
  rows), the account rows of `Accounts.jsx:171` and `Dashboard.ListHeader.jsx`, the hero that toggles masking
  (`Dashboard.ListHeader.jsx:43`), "See all" (`:74,130`, `Category.jsx:175`), `TransactionItem.jsx`, the rows of
  `Scheduled.jsx:172`, the currency list of Onboarding (selected by a check icon only) and the weekday chips of
  ScheduledForm. Each gets `accessibilityRole`, a label from the dictionaries and its state; a render test per
  component, masked amounts left out of the label. VERIFY-A11Y gains these on its list.

- **A11Y-CHART-COLUMNS** — The charts are one named element, not a hundred silent stops
  `bug · agent · normal`
  accept: each month column of `Chart.jsx:134` and `FlowChart.jsx:105` is an unnamed focus stop, up to 120 under
  All. Either each is named by its month and figures (masked-aware), or the overlay is hidden from the screen
  reader and the chart is one adjustable element that steps through months; a render test asserts no pressable
  without a label inside either chart.

- **TOUCH-TARGETS** — No control answers a touch on less than 44 points
  `bug · agent · normal`
  accept: IconButton is 34 points with no `hitSlop` (`IconButton.jsx:14-21`, unlike Chip), the weekday chips are 38
  (`ScheduledForm.style.jsx`), "See all" is the height of its eyebrow and the close of the band has no slop
  (`Notification.jsx:153`). Each reaches 44 by `hitSlop` or `minHeight` without moving anything drawn; a test reads
  the effective target of each from its style and slop.

- **RELEASE-CHECK-ENTRY** — `check:release` refuses the entry nobody wrote
  `chore · agent · normal`
  accept: `check-release.mjs:27` only looks for `## <version> —`, so the blank bullet `bump.mjs` leaves validates,
  as does `## 3.0.99 — tomorrow` or six bullets. `bump.mjs` stamps the UTC date (yesterday until 02:00 in Spain)
  and inserts nothing, silently, when the file does not start with `# Changelog\n\n`. The check fails on an empty
  bullet, a date that is not `YYYY-MM-DD`, more than five bullets and a version that is not the topmost entry; bump
  uses the local date and exits non-zero when it cannot insert; a failing fixture per rule. Tooling only: no bump.

- **DEPS-HYGIENE** — Declare what is imported, drop what is not
  `chore · agent · normal`
  accept: `crypto@1.0.1` (the deprecated npm stub), `expo-blur` and `expo-linear-gradient` have no import in `src/`
  and the last two ship as native modules; `jest` and `jest-expo` sit in `dependencies`;
  `@babel/plugin-transform-regenerator` is unused; `react-test-renderer` (52 imports) and `expo-constants`
  (`NotificationsService.js`, at runtime) are imported and undeclared; `transformIgnorePatterns` still names
  `sentry-expo` and `native-base`. A test asserts every bare import of `src/` is declared and every runtime
  dependency is imported or a config plugin. Needs: native build (two native modules leave).

- **PRIVACY-TEST-ALLOWLIST** — Prove "one request, nothing about you" with an allowlist
  `chore · agent · normal`
  accept: `privacy.test.js` checks ten name fragments in `dependencies` and literal `fetch(` calls; it would pass
  with `expo-updates`, `expo-application`, `expo-device`, `axios`, a remote image or `const f = fetch`. Today is
  clean (the only request is `RatesService.js:60`). Turn it round: an allowlist of runtime dependencies, of
  `app.json` plugins and of the hosts in any `https://` literal under `src/` (the two rates hosts and the
  company's pages opened from Settings); a new dependency or host fails until it is listed.

- **EXPORT-FILES-CLEANUP** — An export does not leave a copy of the ledger behind
  `bug · agent · normal`
  accept: `BackupService.js:33,67` writes each JSON and CSV into `documentDirectory` and never deletes it, so every
  export leaves another plaintext ledger in the app's documents (and in the phone's own backup of them). Write to
  the cache directory and delete the file once sharing resolves or fails; a test asserts the delete on both paths.
  The same pass makes an export error readable: `JSON.stringify(error)` prints `{}` (`:39,73,97`).

- **SITE-META** — The landing page has previews, a 404 and its policy link
  `feature · agent · normal · depends: DEC-SITE-PRIVACY`
  accept: `site/index.html` has no `og:*` or `twitter:*` tags and no `apple-touch-icon`; `site/scripts/build.mjs`
  emits no `404.html` or `robots.txt`, so Cloudflare Pages answers every unknown path with the index and a 200.
  `site.test.js` asserts the tags built from the site URL, `dist/404.html`, `robots.txt` and the footer links the
  decision names; still no inline script, no third-party request.

- **FX-MISSING-VALUES** — Keep missing account conversions distinct from zero
  `bug · agent · normal · depends: UI-FX-MISSING-VALUES`
  accept: the interface follows board UI-FX-MISSING-VALUES; a nonzero THB account with no usable THB rate keeps
  its native balance and shows the unavailable secondary value in Accounts and Dashboard.ListHeader, where
  `currentBalanceBase = 0` and `currentBalanceBase || 0` currently manufacture a zero. A genuine zero remains
  numeric; tests cover positive and negative native balances, a restored rate and masking. Keep the existing
  row geometry and conversion fallback rules. This task only covers account rows; totals, progression and
  chart coverage belong to DEC-FX-COVERAGE and are not redesigned here.

- **DOC-CURRENT-CONTRACT** — Bring the current-state documents back to the code
  `chore · agent · normal`
  accept: README and SPEC version banners match `package.json` and the native manifests (currently 3.0.99,
  build 75, while those banners still say 3.0.61/build 37); reconcile SPEC's "never with a budget" wording with
  the optional category budgets already implemented in `src/modules/budgets.js` and the existing Budgets section,
  preserving the distinction between the usual-based pace and optional category limits. Extend release/bump
  checks to detect stale current-version banners, with a failing fixture; do not rewrite historical changelog entries
  or change product behaviour. No version bump is needed for this documentation/tooling task.

- **DESIGN-SPECIMEN-FIDELITY** — Show the states that the real components render
  `chore · agent · normal`
  accept: audit `design/src/views.mjs` against the owning screens, starting with Settings: replace the invented
  `2 h ago` and `9 days ago` values on the Data rows with the date/time shapes `lastRunValue` actually returns
  (the backup nudge still uses its own relative date). Cover never-run, today, earlier-day and loading states,
  and both EN and DE samples. Check `draw.mjs` account rows against Accounts so base-currency rows do not acquire
  a conversion the app omits. For the shared month row, match `MonthSummary.style.js` (104-point label,
  nonshrinking value, shrinking context) and the positive tone of an underspending swing; the current helper
  uses 96 points and loses that tone. The Account sheet is drawn with FieldRow while `Account.jsx:97-130` uses
  its own rows (a 104-point label, boxed fields), and Mobile has no masked-amounts specimen and no Overview search
  state although SPEC describes both. Add focused generator assertions for those states, then run `yarn design`
  and `yarn validate`; preserve current shipped behaviour and keep proposals out of the Mobile view.

- **DESIGN-FLOW-FIXTURES** — Make the kit's connected screens tell the same story
  `chore · agent · normal`
  accept: use consistent sample data and dates across Overview, Analytics, Category and its transaction list.
  The current Category specimen says six months while `queryCategory.AVERAGE_MONTHS` is three; Analytics shows
  a 1Y selection but its cash-flow fixture only has six bars, although Stats passes the same `monthsLimit` to
  both charts; ScheduledForm only shows the weekly variant, leaving its monthly date-picker path unrepresented.
  Render those current behaviours, include the category-filtered Transactions state reached by See all, and
  derive sample weekday labels from their dates. Label the static sheet frames as reference canvases, not
  native detents; do not invent device measurements. Tests check the shared range, average period, monthly date field and
  category route context. Run `yarn design` and `yarn validate`; this changes the reference, not the app or its
  navigation. A browser rendering of the kit is not device evidence.

### Low priority

- **FX-CLOSED-MONTH** — Use historical rates for the closed-month expense figure
  `feature · agent · low`
  accept: the closed-month expense amount in Overview equals the expense total of that month in Analytics
  for the same ledger, including mixed currencies and skipped movements. `buildInsights` currently converts
  all entries at the latest table before producing its closed insight. Convert the displayed closed amount
  using that month's historical table, while retaining the constant-currency baseline and comparison;
  a fixture with different current and historical rates proves both behaviours. Keep the existing row and copy.

- **SETTINGS-LEGACY** — Remove retired lead-capture data from storage and exports
  `chore · agent · low`
  accept: remove `userProfile` and `marketingLead` from DEFAULTS and drop them in `migrateState`; extend
  `retireSettings` so these keys are removed from disk rather than surviving merge-only saves. Exclude them
  from backup exports too. Tests import an old backup containing populated fields without losing accounts,
  transactions or active settings, verify their disk removal, and prove the retired data is absent from the
  exported JSON. These fields are still exported today by BackupService's denylist; their removal completes
  the existing decision to retire lead capture rather than introducing a new product preference. `fingerprint`
  goes the same way: `store.constants.js:16` is its only reference, yet a random per-install value is persisted
  and exported against "no identifiers".

- **MEDIAN-SINGLE** — The median of one value is that value
  `bug · agent · low`
  accept: `median([5])` answers 0 (`median.js:5`), so with two months of history the "usual" lines of the cash-flow
  chart sit on the baseline (`buildFlow.js:63-69`); `insights.js:29` carries its own, correct, median. One shared
  implementation answers 5, and the chart test with a single earlier month draws the line at it.

- **SEARCH-ACCENTS** — Search and the title memory ignore accents and a trailing space
  `bug · agent · low`
  accept: "cafe" does not find "Café Niño" in Overview's search (`querySearchTxs.js:12-20`) nor recall it as a
  title (`titleMemory.js:70,80`), and "niño " with the space a keyboard adds finds nothing; `tokenizeTitle` already
  strips marks. "cafe", "CAFÉ" and "niño " all find it in both; tests.

- **RECURRENCE-DST-INTERVAL** — A rule every two weeks keeps its weeks across the clock change
  `bug · agent · low`
  accept: `recurrence.js:50` floors a difference that is one hour short of whole weeks after the spring change: a
  rule from Monday 2 March 2026 with interval 2 gives 2 and 16 March, then 6 and 20 April instead of 30 March and
  13 April. Latent: the form always writes interval 1, only an imported template reaches it. Round, with the
  fixture, under a DST timezone.

- **CURRENCY-DECIMALS** — The decimals table matches the currencies offered
  `chore · agent · low`
  accept: `constants.js` `FIXED` gives PLN 0 decimals (it has two and is not offered) and leaves KRW and VND out,
  so they get two (they have none). THB at 0 is assumed to be the creator's choice (cash in whole baht) and stays
  unless told otherwise; `roundToCurrency` then rounds a computed THB swap leg to whole baht. A test reads every
  code of `SYMBOL` against an explicit table.

- **SCHED-SYNC-CONCURRENT** — Two foreground events create each occurrence once
  `bug · agent · low`
  accept: the foreground sync dedupes against React state (`store.jsx:159-179`) and writes back the `settings` it
  read before awaiting, so two `active` events before the first `setState` can both generate the same occurrences
  and a setting changed meanwhile is overwritten. An in-flight guard (as the rates sync has) and only `txs` set;
  a store test fires two events with a deferred sync.

- **DELETE-ACCOUNT-ATOMIC** — Deleting an account is one write
  `bug · agent · low`
  accept: `deleteAccount.js:10-12` removes the account, its entries and its templates in three writes, and
  `StorageService.js:29-73` mutates memory before the adapter with no rollback (only `replace` has one): a failure
  between them leaves entries of no account on disk that still travel in backups. One `store.replace`, and a failed
  save, update or remove restores memory; tests fail the adapter at each step.

- **RESET-RATES-SEED** — After a reset the seed is there to convert
  `bug · agent · low`
  accept: `resetAppData.js:15-18` leaves `rates: {}` in memory until a restart or a successful download, so a new
  ledger started offline right after a reset converts nothing. Use `ratesOrSeed` as the start and the import do;
  a reducer test.

- **COUNT-COPY-FUNCTIONS** — A count and its noun are one function of the count
  `chore · agent · low`
  accept: `Scheduled.jsx:134` ("1 activas"), `Category.jsx:154` ("1 merchants") and `MonthSummary.jsx:172` glue a
  number to a plural word. Each becomes a function key in the five dictionaries, as `ACCOUNTS_CAPTION` is; tests
  for 1 and 2 in EN and ES.

- **DEAD-CODE** — Remove what nothing imports
  `chore · agent · low`
  accept: `Stats/modules/calcScales.js`, `Stats/modules/orderCaptions.js` and `Transaction/helpers/getCurrency.js`
  are imported only by their index; the fallback of `PriceFriendly/helpers/format.js:26-43` cannot be reached;
  `Transaction/helpers/queryCategories.js:16` compares numbers with the string `'99'` and filters nothing;
  `Stats/modules/orderByAmount.js:4` never answers 0; `Dropdown.jsx` uses `TouchableOpacity` where the Pressable
  primitive exists. Removed or corrected with the suite green and a test for the comparator and the filter.

- **LINT-SCOPE** — Lint what gates a release
  `chore · agent · low`
  accept: `yarn lint` covers `src` only: `scripts/`, `site/`, `design/` and their tests are never linted, though
  they decide releases and the deploy. The command includes them with `.mjs` and `.cjs` and is green.

- **RATES-SEED-SCRIPT** — The seed script follows SPEC and fails loudly
  `chore · agent · low`
  accept: `scripts/rates-seed.mjs:57` prices the current month from `latest`, which SPEC says has been held a week
  behind (the app tries dated files first); a skipped month only warns and the file is still written with exit 0;
  its paths are relative to the working directory; it is the one script without a test. Extract the fetch plan and
  test it: dated days before `latest`, non-zero exit on a missing month, paths from the repository root.

- **WORKFLOW-PINS** — Pin what the publish workflow runs
  `chore · agent · low`
  accept: `publish-site.yml` pins its actions by tag and runs `npx --yes wrangler@4.146.0` with the Cloudflare
  token in its environment and no lockfile behind it. `site.test.js` asserts 40-hex pins and a wrangler installed
  from a lockfile.

- **KIT-THEME-FLASH** — The design kit opens in the reader's theme
  `chore · agent · low`
  accept: `design/kit.js` loads deferred and adds `.dark` after the parse, and `kit.css` has no
  `prefers-color-scheme` rule, so a dark-mode reader sees a light flash on every page. The stored or system theme
  applies before first paint; `design.test.js` asserts it, and the count of inline `style=` attributes in the
  generated views (hundreds, `flex-shrink:0` seventy times) only goes down from there.

- **PIN-ATTEMPT-DELAY** — Wrong PINs slow down
  `feature · agent · low`
  accept: `Session.jsx:62-76` accepts any number of tries over 10,000 codes. After five wrong PINs the keypad waits,
  doubling up to a cap, and the wait survives a restart (a persisted counter, named here: `settings.pinFailures`
  with its default and migration, never exported). Its copy and the waiting keypad need a board before approval.

- **SEARCH-ACCOUNT-AMOUNT** — Search also finds by account and by amount
  `feature · agent · low`
  accept: `querySearchTxs.js` reads title and category only. "wallet" lists that account's entries and "1200"
  the entries of that amount, alongside today's matches; tests. No change to the search field.

- **CATEGORY-LATEST-OPEN** — A "Latest" row of a category opens its entry
  `feature · agent · low`
  accept: the rows under Latest in the Category sheet are plain views (`Category.jsx:180-199`), the only list of
  entries that does not open Clone. A tap opens it as in every other list, with the role and name of a row;
  a render test.

- **ONBOARDING-BACK** — Go back a step in Onboarding
  `feature · agent · low`
  accept: `Onboarding.jsx:128` only advances: from the PIN step the name and the balance cannot be corrected, and
  Android back leaves the app with the steps lost. Back (the system gesture and a control) returns to the previous
  step with its values. Its control needs a board before approval; Android back needs a device check.

## Discarded — don't relitigate

| Decision | Reason |
| --- | --- |
| Scheduled-only month-end projection (INS-PACE-SCHEDULED) | Adds another amount beside Scheduled while omitting future everyday spending; "Ends near" implies a forecast the calculation cannot support. |
| Amount-touch cleanup without a behaviour defect (AMOUNT-TOUCHED-CLEANUP) | The state still dismisses the suggestion on the first amount edit; removing it changes behaviour and renaming alone has no demonstrated benefit. |
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
| A checksum in the backup | Keep import validation as the safeguard (`backupValidation`); a checksum does not validate record semantics. |
| A weekly or monthly digest notification | Out by the creator's decision, 2026-10-01. |
| No re-animation on a range switch | Out by the creator's decision, 2026-10-01. |
| One definition of a word for the tokenizer and the title memory | Out by the creator's decision, 2026-10-01. |
| Two panes (list and detail) on the Fold | Out by the creator's decision, 2026-10-01: the rail only. |
| Folding `positive` into the accent, `surfaceSoft` into `surface` | The accent cannot be read as text on paper (income and gain use `positive`), and a disabled button needs a ground other than the sheet, which is `surface`. |
| Indexing the ledger once (PERF-INDEX) | Nothing measured says it is slow: the title memory takes 4 ms for 7,000 entries. Reopen with a measurement from a device. |
