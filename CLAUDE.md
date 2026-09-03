# Atomic Recall — Project Guidelines

This is a client-side-only React + Vite + Tailwind chemistry-quiz app (single-file build via
`vite-plugin-singlefile`). For **any** code generation or refactoring in this repository, the
primary guidelines are the rule files in `.claude/rules/`:

- **[`.claude/rules/ui-ux.md`](.claude/rules/ui-ux.md)** — semantic color tokens (Light/Dark
  theming), micro-interactions, borders-over-shadows, whitespace, and general Tailwind/shadcn/
  Linear-Vercel-inspired component conventions. Read this before touching any component's
  markup or styling.
- **[`.claude/rules/security.md`](.claude/rules/security.md)** — input sanitization, anti-cheat/
  state-integrity rules for the Elo and scoring systems, and never leaking secrets or raw errors
  into the UI. Read this before touching `localStorage`, save import/export, or any scoring code.
- **[`.claude/rules/code-quality.md`](.claude/rules/code-quality.md)** — accessibility
  requirements (`aria-*`, semantic HTML) and when/how to extract logic into `src/utils/` modules
  or custom hooks. Read this before adding non-trivial logic to a component.

Treat all three as binding, not optional style suggestions — they encode decisions already made
and verified working across this codebase (Light/Dark theming, the SFX/anti-cheat-adjacent Elo
system, accessibility passes), not speculative preferences.

## MANDATORY: self-discipline / anti-cheat warning on answer reveals

For **every** educational/quiz/challenge component in this codebase — any hint toggle, answer
reveal, or external solution-checker, whether existing or newly created — a warning banner with
the exact required wording is **mandatory, not optional**. Full specification (exact English +
Thai copy, scope, styling, reference implementation) lives in
[`.claude/rules/security.md`](.claude/rules/security.md) §4, cross-referenced from
[`.claude/rules/ui-ux.md`](.claude/rules/ui-ux.md) §6. Do not create or modify a hint/reveal/
solution-checker component without it — see `src/components/PracticeCard.jsx`'s hint-toggle
banner for the reference implementation.

## Quick orientation

- Theming: `src/index.css` defines all color tokens under `@theme` (light) and `:root.dark`
  (dark). Never hardcode colors — see `ui-ux.md` §1.
- State: `src/App.jsx` centralizes cross-mode app state; domain logic lives in `src/utils/*.js`
  (Elo, spaced repetition, audio/SFX, safe storage) — see `code-quality.md` §2.
- Build: `npm run dev` (Vite dev server), `npm run build` (produces a single self-contained
  `dist/index.html`, several MB because fonts and the rain-ambience audio clip are base64-inlined
  — this is intentional so the app also runs by double-clicking the file via `file://`, not a bug
  to "fix" by moving assets to `public/`).
