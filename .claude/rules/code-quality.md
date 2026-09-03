# Clean Code & Accessibility Rules

## 1. Accessibility standards across all components

- Use semantic HTML elements (`<button>`, `<main>`, `<header>`, `<nav>`, `<label>`) instead of
  generic `<div>`s for anything interactive or structural. This codebase has zero
  `<div onClick>` anti-patterns — keep it that way; every click handler belongs on a real
  `<button>` (or `<a>`/native form control where appropriate).
- **Icon-only buttons need `aria-label`** (e.g. the header theme toggle, `AudioPlayer`'s expand
  button, `Numpad`'s backspace key). If a button has visible text content, an extra `aria-label`
  usually isn't needed — the text already provides the accessible name.
- Stateful toggle controls need `aria-pressed` (sound toggles, theme buttons, track selection) or
  `aria-current="page"` (active nav item) so the current state is exposed to assistive tech, not
  just conveyed visually via color.
- Disclosure/overlay widgets need `aria-expanded`/`aria-haspopup` on their trigger (see
  `AudioPlayer.jsx`'s popover button).
- Every focusable element needs a visible `focus-visible` ring — see `ui-ux.md` §2 for the exact
  utility pattern. Don't ship a control that's usable by mouse but invisible to keyboard focus.
- Keyboard support (Enter-to-submit, Escape-to-close) is an accessibility requirement, not just a
  UX nicety — see `ui-ux.md` §5.

## 2. Refactor complex logic into custom hooks and utility functions

- Business/domain logic does not belong inline in JSX-heavy component bodies. This codebase's
  established pattern is a `src/utils/*.js` module per concern, exporting small, pure,
  independently-testable functions:
  - `safeStorage.js` — all `localStorage` access
  - `elo.js` — Elo rating math and matchmaking
  - `spacedRepetition.js` — SM-2 mastery scoring
  - `sfx.js` / `audio.js` — sound synthesis engines
  - Follow this pattern for new domain logic: a plain-function module under `src/utils/`,
    imported directly where needed, rather than growing `App.jsx` further or duplicating logic
    across components.
- When a component's `useState`/`useEffect` bundle grows complex enough to be hard to follow
  (managing timers, refs, and derived state together), extract it into a custom hook
  (`useXyz.js`) rather than letting the component body sprawl. `App.jsx` currently keeps state
  centralized by design (single source of truth for cross-mode data); if it grows further,
  extracting cohesive slices (e.g. a `useTheme()` hook for the theme state/effect pair) is
  preferable to adding more inline `useCallback`s.
- Keep components focused on rendering + wiring handlers; keep calculation, validation, and
  persistence in utilities they call. A component should read as "what does this look like and
  what happens on X," not "here is how Elo is computed."
- Avoid duplicating logic across components — if two components need the same derived value or
  behavior, it belongs in a shared utility/hook, not copy-pasted.
