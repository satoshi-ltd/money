# Môney — agent instructions

Môney is a local-first ledger for one person's phone: accounts in any currency, a month that explains itself, nothing
measured, everything exportable. An Expo app for iOS and Android with no web target. These are the rules for working
on it. Personal rules of the creator (@soyjavi) live in `~/.claude/CLAUDE.md` and apply on top.

## Documents

Five documents, each answering one question. Put information in the one that owns it and nowhere else.

| File | Question | Never contains |
| --- | --- | --- |
| `README.md` | What is Môney, and how do I run, develop and build it? (for humans) | Status beyond its version banner, contracts, history |
| `AGENTS.md` | Which rules apply when working here? | Status, tasks, history |
| `ROADMAP.md` | What is left to do? (its header defines fields and lanes) | Shipped work |
| `SPEC.md` | How does Môney work today? Product decisions, data and storage, ledger rules, rates, insights, screens, operations, design system | Dates, statuses beyond its current-state summary, test counts, investigation logs |
| `CHANGELOG.md` | What did each version ship? | Implementation detail, test counts, review narrative |

- Start from README, SPEC's current state and ROADMAP; then read the SPEC section the task touches.
- **SPEC** is present tense and edited in place: when behaviour changes, rewrite the section that owns it. History
  lives in git and the changelog.
- **CHANGELOG** entries: `## x.y.z — YYYY-MM-DD`, at most five bullets of what changed for someone using the app, then
  why when it is not obvious; a `Needs: native build` line only when a native change needs a new binary.
  `yarn check:release` refuses a version without its entry.
- Update the owning document in the same change as the code. Decisions go to the list below or to SPEC, remaining work
  to ROADMAP, never to chat history or extra status files. `design/` is the design kit, not a document: after any
  visible change run `yarn design` (`scripts/__tests__/design.test.js` fails until you do).

## Workflow

The creator runs the project as an autonomous loop with the user-level `next-task` skill (usually `/loop /next-task`)
and the `adversarial-reviewer` agent in `~/.claude/`. Each iteration takes one approved task, implements and tests it,
bumps the version and changelog, has the reviewer try to break it, applies the findings, validates, commits and pushes.

Project wiring for those tools:

- **Task pool:** `ROADMAP.md`. Only `owner: agent` tasks in Queue are worked on; only the creator approves a task into
  Queue.
- **Version:** every commit that changes what ships (`src/`, `assets/`, `app.json`, a native dependency) runs
  `yarn bump` (patch by default; `yarn bump minor|major`), which moves `version`, `ios.buildNumber` and
  `android.versionCode` together and opens the CHANGELOG entry to write. Docs-only, design-only and tooling-only
  commits do not bump. `yarn check:release` proves the manifests and the changelog agree.
- **Validation:** `yarn validate` (`check:release`, `lint`, `test`) before claiming done. Report it apart from device
  evidence.
- **CI:** none. There is no pipeline; builds are the creator's (README). A failing `yarn validate` on `v3` is the
  next task.
- **Review checklist**, on top of the generic one: core flows stay offline (the only network calls are the rates feed);
  a `settings` shape change updates `store.constants.js`, `migrateState.js` and keeps old backups importable;
  notifications are cancelled only by their own metadata; `exchange()` answering `undefined` is never read as 0;
  category ids are read within their type; swaps (99) and `meta.moved` stay out of every month figure and inside every
  balance; every copy key exists in the five dictionaries; large text sizes and both platforms hold without a device;
  the design kit is regenerated and matches what ships.

Rules of the loop:

- Invoking `/next-task` or `/loop /next-task` is the creator's explicit request to commit and push each finished task
  once review and validation pass. Outside the loop, commit only when asked in the current turn. When the creator says
  not to commit, prepare and validate but leave the change uncommitted until told otherwise.
- Adversarial review before every commit; a second pass on the deltas when the fixes were substantive.
- Interruptions: triage before continuing, and say where each item went. A bug the creator reports goes to the top of
  Queue; a requested feature goes to Queue; ideas, including your own, go to Proposed; questions get answered.
- Anything needing an EAS build, an install, a physical device, credentials or a product choice becomes a
  `Needs creator` task. When a feature needs device evidence, split it: the implementation is an agent task; the
  device check is a creator `verify` task that depends on it.
- Stop and report when Queue is empty or everything is blocked on the creator.

## Engineering rules

- Implement only the approved scope. Propose product or UX changes, never implement them without the creator's
  explicit validation. Within approved work, use the shared tokens and components and update SPEC's design section.
- Every functional change ships with a test that fails without it. Tests live beside the code in `__tests__`
  directories and run with Jest (`jest-expo`); components are tested with `react-test-renderer` and mocked
  `../contexts`, `../components` and services.
- `src/primitives` over raw `react-native` components; colours from `useApp().colors`, never hardcoded; styles in
  `*.style.js` with `StyleSheet` and values from `src/theme`; no TypeScript; no inline styles unless unavoidable; no
  overengineering.
- Persisted state: any change to the `settings` shape updates `DEFAULTS` in `src/contexts/store.constants.js` and the
  path in `src/contexts/modules/migrateState.js`; never rename or drop a persisted field without a migration; keep the
  backup keys (`schemaVersion`, `accounts`, `scheduledTxs`, `settings`, `txs`) compatible and imports non-destructive.
- Notifications: cancel only what the feature owns, by its metadata (`kind`, `scheduledId`, `occurrenceAt`); never
  `cancelAllScheduledNotificationsAsync`.
- `exchange()` returns `undefined` when it cannot convert; callers skip the figure, never substitute 0.
- Copy in code is English. A new key goes into all five dictionaries (EN, ES, PT, FR, DE) in the same change; a label
  that needs the language's own shape (ordinals, marks) is a function of its argument, not a template.
- Parallel shell calls use absolute paths; a `cd` in one call leaks into its siblings.
- Remote: `git@github.com:satoshi-ltd/money.git`, branch `v3`; Mikel also pushes there. Never rewrite pushed history.

## Product decisions (non-negotiable)

- Local-first. The ledger lives on the phone in AsyncStorage; the only request the app makes is for public exchange
  rates, and it carries nothing about the user. No account, no cloud, no analytics, no crash reports, no identifiers,
  no lead capture and no subscription: those were removed and stay out.
- Mobile only: iOS 15.1+ and Android, phones and the Fold in one layout. No web target until the creator decides one.
- One base currency the reader thinks in; everything converts to it at the day's public rate, and a closed month at its
  closing day. Metals are priced per troy ounce.
- Backups are plain JSON the user owns, plus CSV export; the PIN, the biometric preference and the learned catalogs
  never travel in one, and an invalid payload never overwrites the ledger.
- A four-digit PIN asked on every open, optionally behind the phone's biometric reader; neither can be recovered.
- A transaction hidden from Analytics (`meta.moved`) and a swap between own accounts leave every month figure and stay
  in every balance: money moved is not money earned or spent.
- Insights read the month against the reader's own usual (a median over six months), never against a budget.
- Quiet, exact interface: hairlines instead of elevation, three radii, figures in mono, the accent for what moves.
  SPEC's design section is the contract; `design/` shows it.
- Five languages (EN, ES, PT, FR, DE); the product says **Overview**, **Accounts**, **Analytics**, **Settings**.

## Live environment boundaries

- Metro, the emulator and the phones are the creator's. Never start Expo or Metro, never drive the emulator or a device
  (installs, taps, typing, screenshots) and never build unless asked in the turn; hand device checks to the creator.
- Read-only `adb` diagnostics only when asked, and with the SDK's binary (`~/Library/Android/sdk/platform-tools/adb`):
  a second adb of another version against the same server knocks the emulator offline.
- The emulator and the phones carry the creator's real ledger: never wipe it, import over it or reset data.
- Tests never touch a device's storage: services are mocked and storage tests use in-memory stores.
- A green suite is not a device check, and a pushed commit is not an installed build; keep implemented, built and
  verified apart in ROADMAP and in reports.
