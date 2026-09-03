# UI/UX Rules — Tailwind, shadcn/ui & Modern Minimalist Design (Linear / Vercel)

These rules apply to all UI components and styles written or refactored in this project. They
synthesize best practices from Tailwind CSS, shadcn/ui's component conventions, and the
Linear/Vercel school of minimalist product design.

## 1. Semantic Color Tokens ONLY — no hardcoded colors

This is the single most important rule in this file, because the app supports a user-toggled
Light/Dark theme built entirely on CSS custom properties (see `src/index.css`, `:root` vs.
`:root.dark`). Every component consumes color exclusively through the Tailwind utilities those
tokens generate — that is the *only* reason dark mode works app-wide with zero `dark:` variants
in component markup.

- **Never** use `bg-white`, `text-black`, `#fff`, `#000`, or any other fixed/literal color for
  surfaces, text, or borders. Use the semantic tokens instead:
  - Surfaces: `bg-bg` (page), `bg-surface` (cards/inputs/panels)
  - Text: `text-ink` (primary), `text-neutral-600`/`text-neutral-700` (secondary/muted)
  - Borders: `border-divider`
  - Accent: `bg-accent`, `bg-accent-100`…`900`, `text-accent-700`, etc.
  - Status: `text-good`/`bg-good-bg` (success), `text-amber`/`bg-amber-bg` (caution),
    accent tokens (error/wrong)
- If a new semantic need doesn't map to an existing token (e.g. a new status color), add it to
  the `@theme` block in `src/index.css` **and** give it a `:root.dark` override in the same file
  — don't reach for a literal color as a shortcut.
- The one sanctioned exception: the rank/Elo tier badges use hardcoded per-tier `oklch` colors
  tuned for light backgrounds, so those specific badges pin an explicit light chip background
  (`background: '#fff'` inline) rather than following the page theme. This is a deliberate,
  narrow exception — not a precedent for skipping tokens elsewhere.
- Before shipping new UI, sanity-check it in both themes (toggle in Settings, or the header
  sun/moon button) — a component that "looks fine" in light mode only is not done.

## 2. Micro-interactions on every clickable element

Every `<button>`, link-like control, and interactive card should feel snappy and alive:

```
transition-all duration-150 active:scale-[0.98] cursor-pointer
hover:bg-neutral-100  (or the element's appropriate hover tint)
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2
```

- `hover:` — a visible but subtle state change (background tint, border color shift).
- `focus-visible:` — always provide a keyboard focus ring; never rely on the browser default,
  and never suppress focus outlines without replacing them.
- `active:scale-[0.98]` — the tactile "press" feedback on click/tap. Pair with
  `disabled:active:scale-100` so disabled controls don't visually "press."
- Toggle-style controls (sound on/off, theme, presets) should also set `aria-pressed`/
  `aria-current` so the interaction is reflected for assistive tech, not just visually.

## 3. Subtle borders over heavy shadows, generous whitespace

- Prefer a crisp `border border-divider` for definition over a heavy `shadow-lg`/glow. Where
  elevation is warranted (cards floating over content, popovers), use `shadow-sm` or `shadow-md`
  — never stacked/heavy drop-shadows.
- No neon glows, dark-purple-to-cyan gradients, drop-shadow overloads, or animated particle
  effects unless explicitly requested — these read as generic "AI-generated" aesthetic, which
  this project deliberately avoids.
- Standardize spacing on consistent Tailwind gaps (`gap-2`, `gap-4`, `gap-6`) and padding
  (`p-4`, `p-5`, `p-8` depending on container size) rather than one-off pixel values. Let content
  breathe — err toward more whitespace, not less.
- Typography hierarchy: solid, high-contrast color for headings (`text-ink`, `font-heading
  font-bold`), muted tones for subtext (`text-neutral-600`). Keep a clear size/weight step
  between heading and body text.
- Group Tailwind classes logically (Layout → Sizing → Spacing → Typography → Background/Border →
  Effects) and avoid redundant/conflicting classes in the same string.

## 4. Component conventions (shadcn/ui-inspired)

This project doesn't depend on the shadcn/ui package, but borrows its underlying discipline:

- Small, composable, single-responsibility components (see `src/components/Numpad.jsx`,
  `src/components/Toast.jsx` for examples of this scale).
- Variant styling driven by simple conditional class strings keyed off props/state (see the
  `on ? '...' : '...'` pattern throughout `SettingsPanel.jsx`, `AudioPlayer.jsx`), not ad-hoc
  one-off classes scattered per call site.
- Accessible-by-default primitives: real `<button>`/`<input>`/`<label>` elements, not styled
  `<div>`s standing in for interactive controls (see `code-quality.md` for the full a11y rules).

## 5. Keyboard navigation

- Text inputs that represent a "submit this" action must support **Enter** to submit
  (see `WelcomeScreen.jsx`, `SettingsPanel.jsx`'s name field).
- Any dismissible overlay (popover, toast, modal) must close on **Escape**
  (see `AudioPlayer.jsx`'s music popover, `Toast.jsx`).

## 6. Anti-cheat / self-discipline warning on answer reveals — MANDATORY

**This is a strict, non-negotiable rule.** See `security.md` §4 for the full specification
(exact required wording, scope, and the existing reference implementation) — this entry exists
so the rule is discoverable from the UI-conventions file too. Summary: any hint toggle, answer
reveal, or external solution-checker component must show a warning banner (amber/red alert
styling, using semantic tokens — `bg-amber-bg`/`text-amber`/`border-amber` or the accent
equivalents) with the exact wording specified in `security.md` §4, visible before the answer is
revealed. This does **not** apply to ordinary post-submission feedback (e.g. "incorrect — the
answer was X" shown after the user already committed an answer) — only to reveals that let a
user see the answer *before* attempting it.
