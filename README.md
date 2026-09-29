# Sports Watch

A minimal, mobile friendly interval timer for gym workouts. Set a workout time, a break time, and a number of rounds, then let it auto cycle: work, break, work, break, until you are done. Save the setup as a preset so the next session is one tap away.

## Run locally

Requires [Bun](https://bun.sh).

```bash
bun install
bun run dev
```

Open the printed URL (use your phone on the same network for mobile testing).

Production build:

```bash
bun run build
bun run preview
```

Type checking:

```bash
bun run typecheck
```

## Features

- Workout timer with hh:mm:ss input
- Break timer with hh:mm:ss input
- Configurable number of rounds (1 to 99)
- Auto cycling session: workout, break, workout, and so on, ending after the final round
- Pause, resume, skip phase, and stop controls during a session
- Phase alerts: sound (Web Audio API), vibration, and a full screen color flash (green for work, amber for break, pink for the finish)
- Round progress dots, phase progress bar, and a hint of what comes next
- Save the current setup as a preset, load a preset with one tap, delete presets you no longer need
- Presets persist in localStorage, no account or backend
- Wake Lock keeps the screen on while a session is running (where supported)
- Timestamp based countdown, so a throttled background tab still lands on the right phase
- Fully responsive, works from 320px up, optimised for phone use

## Tech stack

- [Bun](https://bun.sh) runtime and package manager
- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Vite 7](https://vite.dev) dev server and bundler
- Plain CSS, no UI framework
- Browser APIs: localStorage, Web Audio API, Vibration API, Wake Lock API

## Deploy to GitHub Pages

The repo includes a GitHub Actions workflow at `.github/workflows/deploy.yml` that builds and publishes to GitHub Pages on every push to `main`.

## Credits

- Trashcan icon by Cédric Villain from the Noun Project (icon 888071).
