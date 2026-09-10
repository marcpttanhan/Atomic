// Shared Tailwind class strings for buttons, toggles, and elevated "glass"
// cards, reused across every mode's panels so hover/glow treatment stays
// consistent instead of being hand-duplicated per component. All glow/tint
// values are built from the existing @theme color tokens via color-mix(),
// never literal hex/rgba, so they re-theme automatically in light/dark.

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2';

export const primaryButtonClass =
  'rounded-xl bg-accent font-heading font-bold text-white cursor-pointer ' +
  'shadow-[0_0_14px_color-mix(in_srgb,var(--color-accent)_28%,transparent)] ' +
  'transition-colors duration-150 hover:bg-accent-600 active:bg-accent-700 ' +
  'hover:shadow-[0_0_22px_color-mix(in_srgb,var(--color-accent)_48%,transparent)] ' +
  'disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none ' +
  focusRing;

export const secondaryButtonClass =
  'rounded-xl border border-divider bg-surface font-heading font-bold shadow-sm cursor-pointer ' +
  'transition-colors duration-150 hover:border-accent-300 hover:bg-neutral-100 ' +
  'disabled:cursor-not-allowed disabled:opacity-45 ' +
  focusRing;

// Pill-style toggle buttons (sound toggles, theme switch, track select).
// Caller supplies its own rounding (rounded-xl, rounded-full, ...).
export function toggleClass(active) {
  return (
    'border text-[13px] font-semibold cursor-pointer shadow-sm transition-all duration-150 ' +
    focusRing + ' ' +
    (active
      ? 'border-accent-700 bg-accent-100 text-accent-700 ' +
        'shadow-[0_0_12px_color-mix(in_srgb,var(--color-accent)_25%,transparent)]'
      : 'border-divider bg-surface text-ink hover:bg-neutral-100 hover:border-accent-300')
  );
}

// Spring used with `whileHover`/`whileTap` on motion.button — the "responsive
// spring hover" micro-interaction, layered on top of the CSS focus ring/
// disabled handling above rather than replacing it.
export const springHover = { type: 'spring', stiffness: 420, damping: 22 };
export const hoverLift = { scale: 1.02 };
export const tapShrink = { scale: 0.97 };

// Extra ambient depth for elevated "glass" cards (question cards, result
// panels): a soft outer glow plus a hairline inner top highlight.
export const glowCardClass =
  'shadow-[0_1px_0_0_color-mix(in_srgb,var(--color-ink)_5%,transparent)_inset,' +
  '0_16px_40px_-22px_color-mix(in_srgb,var(--color-accent)_25%,transparent)]';

// Glowing-border treatment for micro-badges/pill tags.
export const glowBadgeClass =
  'border border-accent-300/70 shadow-[0_0_10px_color-mix(in_srgb,var(--color-accent)_22%,transparent)]';

export const glowBadgeCyanClass =
  'border border-cyan/40 shadow-[0_0_10px_color-mix(in_srgb,var(--color-cyan)_25%,transparent)]';

export const glowBadgeGoodClass =
  'border border-good/40 shadow-[0_0_10px_color-mix(in_srgb,var(--color-good)_25%,transparent)]';
