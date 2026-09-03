// Shared Framer Motion `animate` targets for answer-feedback state, reused
// across every question card (PracticeCard, AssessmentPanel, TimeAttack,
// MatchmakingPanel) so the pulse/shake stays visually consistent.
export function feedbackPulse(feedback) {
  if (feedback === 'correct') return { scale: [1, 1.015, 1] };
  if (feedback === 'wrong') return { x: [0, -6, 6, -4, 4, 0] };
  return { scale: 1, x: 0 };
}

// Shared mount-in transition for panel/card sections. Spread onto a
// motion.* element: {...fadeUp}
export const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
};

// Faster variant for content that re-mounts frequently (e.g. the question
// text swapping on every new prompt), keyed by the caller on the changing value.
export const fadeUpFast = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25 },
};
