# VICE CITY TROPHY GUIDE — GTA VI (PS5)

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/sarzxy/gta6-trophy-guide-01/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/sarzxy/gta6-trophy-guide-01/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

The best offline guide + tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI — built for the [make.fun GTA 6 trophy guide bounty](https://make.fun/c/gta6-trophy-guide-01).

- **All 55 trophies** with their official names, descriptions and grades (1 Platinum, 2 Gold, 6 Silver, 46 Bronze), exactly as PlayStation publishes them.
- **A cited guide for every trophy**, written in our own words, with its sources named beside it. Five trophies had no confirmed unlock method at launch and say so plainly instead of inventing one.
- **Platinum roadmap** in 7 stages, in play order — including the one missable trophy (Positive Mental Attitude: meditate at every spot from Chapter 1) and the no-mission-replay save advice.
- **Tracker**: checklist saved in localStorage, export/import as JSON, filters (story / missable / collectibles / activities / online), search, and a spoiler setting that hides story trophies until earned.
- **Offline**: static files under `app/`, no build step, no network requests, no Rockstar artwork. Serve with `node serve.ts` and open http://localhost:8080.

Entry program: `main.ts` (Node 22) copies `app/` + `screenshots/` to `/output` and writes `dossier.json` with the vendored `vendor/makefun-frontend.ts`.
