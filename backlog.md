# Backlog

This backlog is aligned to the current codebase state (Scheduled transactions, Premium export gating, local insights, optional onboarding lead capture).

## Now (Stability)
- Scheduled transactions: run end-to-end QA on device (iOS/Android) for create/edit/delete, weekly + monthly patterns, monthly day clamp, and duplicate prevention.
- Scheduled auto-create: verify `AppState=active` path creates missed occurrences correctly after timezone/date changes and app downtime (bounded by the 100-tx safety cap).
- Scheduled notifications: validate policy at scale (caps `8 per schedule`, `48 total`), cancellation of stale/duplicate notifications, and DST edge cases.
- Settings + Premium: ensure copy/UX is consistent for Pro-gated exports (JSON/CSV) and non-gated import; confirm the paywall flow is coherent.
- Backups: add stricter validation (schemaVersion, required keys, and defensive parsing) and consider optional checksums.
- Tooling: remove Jest deep-import shims by upgrading Expo/Jest preset configuration when feasible (currently solved via `jest.moduleNameMapper`).

## Next (Insights / UX)
- Tune `spending_pace` with scheduled transactions using real scenarios (low-activity month, high fixed-cost month, mixed currencies).
- Decide whether scheduled incomes should influence any forecast signal (without adding noisy cards).
- Add tests for scheduled-aware insights edge cases (no spend month, day 1, FX conversion dates).
- Notifications: allow configuring reminder time (not only fixed 08:00 / “day before”).
- Digest: optional weekly/monthly insights digest (scoped notifications, no global cancel).

## Product (Later)
- Insights V2: day-of-week patterns, largest transaction summaries, subscription detection.
- Category budgets with monthly rollover (phase 1: soft budgets + dashboard card; phase 2: optional alerts).
- Savings goals with monthly progress.
- Split transactions across multiple categories.

## Engineering (Ongoing)
- Accounting correctness: support negative balances (liabilities/credit cards) end-to-end (storage, consolidate, UI, insights).
- FX consistency: define and apply one rule for historical conversion across charts, month summaries, and insights.
- Performance: index txs once (by account, by day/month) and reuse for Dashboard/Transactions/Stats to avoid repeated sorts/finds with large datasets.
- Stats UX performance: avoid full chart reveal re-animation on range switch; keep pointer behavior consistent.
- Fix remaining lint warnings around Hooks usage (Modal animations, `useMotion`, and `FormTransfer` deps).
