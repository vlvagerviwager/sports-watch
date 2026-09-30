# AGENTS.md

Rules for anyone (AI agent or human) changing this repository. They come from decisions made while building the app. Follow them all.

## Hard rules

- **No em dashes (U+2014) or en dashes (U+2013) anywhere**: code, comments, README, tests, docs, or commit messages. Use commas, colons, parentheses, or a plain hyphen. Special glyphs that are allowed because they carry meaning in the UI: U+2212 minus (rounds stepper), U+00D7 times, U+25C6 diamond, U+2713 check.
- **Conventional commits only**: `feat:`, `fix:`, `perf:`, `test:`, `docs:`, `chore:`, `refactor:`, `style:`. One logical change per commit. Never bundle unrelated changes together.
- **Do not commit or push unless explicitly asked.** The user tests locally first and reviews each change. When asked to prepare something for review, leave it uncommitted.
- **No emoji** in the codebase or messages.
- **No magic numbers and no single letter variable names.** Extract constants with descriptive names, and give every variable a descriptive name. One letter names like `x`, `i`, or `n` are not allowed. Scope: this applies to TypeScript and test code. Literal values in CSS (layout sizes, transitions, clip paths) are fine as long as colors stay in variables. Parameters named with a leading underscore plus a word (for example `_unused`) are allowed when the value is intentionally ignored.
- **Update the README feature list** whenever a feature is added, changed, or removed.

## Mobile performance first

This app is used on phones at the gym. Mobile speed beats developer convenience.

- Keep the bundle small. No UI frameworks, no web fonts (system and display fonts only), no new dependencies without a strong reason. Check `bun run build` output sizes after changes.
- Minimize re-renders. The session timer uses signature gated updates in `src/hooks/useTimer.ts` (about 4 to 5 renders per second, not 60). Do not reintroduce unconditional render loops.
- Prefer CSS that avoids layout thrash; keep animations cheap.
- The layout must never look broken: `body` has a 320px minimum width, and phase banners reserve a stable `min-width` so switching phases causes no layout shift.
- The timer is timestamp based (`Date.now` deadlines), not tick based, so throttled background tabs stay accurate. Keep it that way.

## Testing trophy

Follow the [testing trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications). Static checks form the base, unit and integration tests the wide middle, end to end coverage stays deliberately thin.

- **Static**: `bun run typecheck` must pass. Tests are typechecked too.
- **Unit**: `src/lib/time.test.ts`, `src/hooks/useTimer.test.ts` (engine transitions), `src/hooks/usePresets.test.ts` (storage validation).
- **Integration**: `src/components/SetupView.test.tsx` and `src/App.test.tsx` render real components in a happy DOM with Testing Library.
- **Thin top**: the deploy workflow runs `typecheck`, `bun test`, and `bun run build` before publishing. Do not weaken that gate.
- Run `bun run typecheck && bun test && bun run build` before considering any change done. New behavior needs a test.

## Stack and structure

- Bun runtime and package manager, TypeScript strict, React 19, Vite 7, plain CSS in `src/styles.css`. No CSS framework, no state library, no router.
- Keep pure logic in `src/lib` and the timer engine as exported pure functions (`createEngine`, `advance`) so it stays testable without a DOM.
- Presets persist under the localStorage key `sports-watch/presets/v1`. If the shape changes, bump the version suffix.
- Test environment: `bunfig.toml` preloads `src/test/register.ts` (happy DOM globals) then `src/test/setup.ts` (cleanup). DOM queries need that order because `screen` binds to `document.body` at import time.

## UX and design

- Luchador inspired theme: red, gold, magenta, Impact display font, poster style buttons, rope divider. Match the existing visual language for anything new.
- Touch first: interactive elements need a tap target around 44px high, labeled controls (`aria-label`, `aria-pressed`, `aria-expanded`), and visible focus states.
- Copy is short, direct, and energetic. No filler lines.

## Deployment

- GitHub Pages deploys from `.github/workflows/deploy.yml` on push to `main`. Pages source must stay "GitHub Actions" in repo settings.
- `vite.config.ts` must keep `base: "./"` so assets resolve under the repo subpath.
- Push only after explicit approval.
