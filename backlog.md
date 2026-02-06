# Backlog

## Scheduled Transactions (MVP hardening)
- End-to-end QA on device (iOS/Android): create/edit/delete, weekly/monthly patterns, monthly date clamp, and duplicate prevention.
- Verify app resume behavior (`AppState=active`): auto-create due scheduled transactions and sync notifications correctly after date changes.
- Validate notification policy at scale: caps (`8 per schedule`, `48 total`), cancellation of stale/duplicate notifications, and timezone/DST edge cases.
- Final pass on naming/copy consistency (`Scheduled`) across UI, i18n, and logs.

## Insights / Forecast
- Tune `spending_pace` with scheduled transactions using real scenarios (low-activity month, high fixed-cost month, mixed currencies).
- Decide if scheduled incomes should influence a dedicated forecast signal (without adding extra noisy cards).
- Add unit tests for scheduled-aware `spending_pace` edge cases.

## Product
- Insights V2 (low priority): day-of-week patterns, largest transaction summaries, subscription detection.
- Category budgets with monthly rollover (phase 1: soft budgets + dashboard card; phase 2: optional alerts).
- Savings goals with monthly progress.
- Split transactions across multiple categories.

## UX / Notifications
- Weekly/monthly digest with insights.
- Configure exact reminder time (not only “day before”).
- Budget threshold alerts (optional): 80% / 100% per category.

## Engineering
- Memoization/caching for `consolidate` and stats with large datasets.
- Review remaining TODOs in codebase (transactions list refactors).
- Harder backup validation and optional checksums.
- Schema/migrations: keep `settings.schemaVersion` bumps only for breaking/transforming migrations; additive `settings.*` can rely on defaults merge.
