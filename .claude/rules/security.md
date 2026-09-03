# Web Security & Anti-Cheat Rules

This is a fully client-side app (no backend, no API keys) — but that doesn't mean "no security
concerns." The main real risks here are corrupted/malicious `localStorage` or imported-save-file
data crashing the app, and users editing client-side state (via devtools) to inflate their own
Elo/progress. These rules apply to any new state, storage, or scoring code.

## 1. Input sanitization & validation before rendering or saving state

- **Never trust data read from `localStorage`, an imported save file, or any other
  externally-modifiable source at face value.** Validate shape and types before it flows into
  React state or gets rendered.
- Follow the existing pattern in `App.jsx`'s `importSaveData`: parse, check the expected wrapper
  shape (`data.app === 'Atomic Recall'`, `typeof data.progress === 'object'`) **before** writing
  anything to storage or state. Reject and show an error toast on anything that doesn't match —
  don't attempt to "partially recover" a malformed file.
- All `localStorage` reads/writes go through `src/utils/safeStorage.js` (`safeGetItem`/
  `safeSetItem`), which already wraps access in try/catch so a blocked or corrupted store can't
  crash the app (see the `file://` SecurityError case this was built for). Never call
  `localStorage` directly in new code.
- When rendering user-entered text (player name, etc.), rely on React's default text-node
  escaping (`{value}` in JSX) — never use `dangerouslySetInnerHTML` with user-controlled input.
- Numeric/user-editable fields (name length, Elo, scores) should have sane bounds enforced at the
  point of entry (e.g. `maxLength` on the name input) and again when consumed, not just one or
  the other.

## 2. Anti-cheat & state integrity

There is no server here to be the source of truth, so "anti-cheat" in this codebase means: make
tampering hard to do *by accident*, and keep the scoring math itself in one auditable place
rather than scattered/re-derivable arbitrarily.

- **Elo changes must always flow through `calculateExpectedScore`/`calculateNewElo` in
  `src/utils/elo.js`.** Never write an ad-hoc Elo delta directly into state from a component —
  route every rating change through those functions so the formula stays the single source of
  truth and stays auditable/testable in one place.
- Match results (`MatchmakingPanel.jsx`) are computed from the actual recorded battle state
  (`player.correct`, `opp.correct`, finish timestamps) at the moment both sides finish — don't
  accept a result or Elo delta as a pre-computed value passed in from elsewhere without
  recomputing it from the underlying answers.
- Spaced-repetition mastery (`src/utils/spacedRepetition.js`) and match history are derived data.
  When importing a save file, treat these as opaque blobs to restore, but don't let arbitrary
  values in them bypass the *live* calculation functions during actual gameplay — imported data
  seeds state, it doesn't get to redefine how new answers are scored.
- If a future change adds any server/API layer, state-changing requests (Elo updates, match
  results) must be re-validated server-side — never trust a client-submitted score/result as-is.

## 3. Prevent secrets & error leaks

- Never commit or hardcode API keys, tokens, or credentials in source. This project currently has
  none — keep it that way; if one is ever needed, it belongs in an environment variable, never in
  client bundle source (remember: everything in `src/` ships to the browser, including this
  single-file build that inlines the entire bundle into `dist/index.html`).
- Never surface raw error objects, stack traces, or internal exception messages in the UI. User-
  facing errors go through the `Toast` component with a short, plain-language message (see the
  `'ไฟล์ไม่ถูกต้อง ไม่สามารถนำเข้าข้อมูลได้'` pattern in `importSaveData`) — log detail to the
  console during development only if genuinely useful, never render it into the DOM.
- Keep `try/catch` blocks narrow and intentional (matching `safeStorage.js`'s pattern) — don't
  swallow errors silently in a way that hides real bugs, but don't let their raw contents reach
  the rendered page either.

## 4. Self-discipline / anti-cheat warning on answer reveals — MANDATORY, STRICT

The realest "anti-cheat" risk in an app like this isn't a hacker — it's the user cheating
*themselves* out of learning by peeking at the answer before genuinely attempting recall. This
rule is a hard requirement, not a style preference:

- **Scope — applies to:** any hint toggle, answer-reveal control, or external solution-checker
  component, whenever such a component is created or modified. Current instance in this
  codebase: the hint button (`คำใบ้`) in `src/components/PracticeCard.jsx`, shared by Practice
  and Recall mode.
- **Does NOT apply to:** ordinary post-submission feedback (e.g. "ไม่ถูกต้อง — คำตอบคือ ${z}"
  shown in `AssessmentPanel.jsx`, `TimeAttack.jsx`, `MatchmakingPanel.jsx`, and `PracticeCard.jsx`
  after the user has already committed an answer). There is no self-cheating risk once the
  attempt is already locked in — don't add warning banners to normal answer feedback; that would
  just be noise on every wrong answer across every mode.
- **Required wording — use exactly this** (Thai is the primary user-facing copy, matching this
  app's all-Thai UI convention; English is the canonical source the Thai is translated from —
  keep both in sync if either is ever revised):
  - Thai (use this in the actual UI): `คำเตือน: การเปิดดูคำตอบจากที่อื่น ถือเป็นการทำลายตัวเอง เพราะจะไม่ได้ฝึกฝนอะไร`
  - English (reference/source text): `Warning: Looking up answers externally destroys your own progress and robs you of genuine practice!`
- **Required presentation:**
  - A banner (preferred — matches this app's "non-intrusive" UX principle) or a confirmation
    modal if the interaction genuinely warrants blocking (a banner is sufficient for an in-app
    hint toggle; reserve a modal for something more consequential, like a hypothetical "open
    external answer key" action).
  - Clear visual hierarchy using semantic tokens only (see `ui-ux.md` §1): amber/red alert
    styling (`border-amber/20 bg-amber-bg text-amber`, or accent-based tokens for a
    higher-severity variant), a warning icon (`WarningIcon` in `icons.jsx`), small text
    (`text-xs`/`text-sm`).
  - Must be visible **before** the answer is revealed/submitted via that control — i.e. rendered
    at the moment the hint/reveal becomes visible, not after, and not as an easily-missed
    one-time toast that's gone before the user reads it.
  - Non-blocking: don't disable or gate the actual hint/reveal behind the warning — the point is
    to inform and discourage, not to prevent (this remains a self-study tool, not a lockout).
