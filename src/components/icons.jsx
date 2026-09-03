const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

export function PracticeIcon(props) {
  return (
    <svg {...base} width="18" height="18" {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function RecallIcon(props) {
  return (
    <svg {...base} width="18" height="18" {...props}>
      <path d="M3 12a9 9 0 1 0 3.5-7.1" />
      <polyline points="3 4 3 9 8 9" />
    </svg>
  );
}

export function AssessmentIcon(props) {
  return (
    <svg {...base} width="18" height="18" {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 8h6" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function TimeAttackIcon(props) {
  return (
    <svg {...base} width="18" height="18" {...props}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l3 2" />
      <path d="M9 2h6" />
    </svg>
  );
}

export function StatsIcon(props) {
  return (
    <svg {...base} width="18" height="18" {...props}>
      <line x1="4" y1="20" x2="4" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="20" y1="20" x2="20" y2="14" />
    </svg>
  );
}

export function SettingsIcon(props) {
  return (
    <svg {...base} width="18" height="18" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}

export function HintIcon(props) {
  return (
    <svg {...base} width="18" height="18" {...props}>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z" />
    </svg>
  );
}

export function WarningIcon(props) {
  return (
    <svg {...base} width="16" height="16" {...props}>
      <path d="M10.3 3.6 1.8 18a1.8 1.8 0 0 0 1.55 2.7h17.3A1.8 1.8 0 0 0 22.2 18L13.7 3.6a1.8 1.8 0 0 0-3.4 0z" />
      <path d="M12 9.5v4" />
      <path d="M12 16.8h.01" />
    </svg>
  );
}

export function MatchIcon(props) {
  return (
    <svg {...base} width="18" height="18" {...props}>
      <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
      <path d="M13 19l6-6" />
      <path d="M16 16l4 4" />
      <path d="M19 21l2-2" />
      <path d="M9.5 6.5 12 4l3-1-1 3-2.5 2.5" />
    </svg>
  );
}

export function GameModeIcon(props) {
  return (
    <svg {...base} width="18" height="18" {...props}>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  );
}

export function HeatmapIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
      <rect x="3" y="3" width="5" height="5" rx="1" />
      <rect x="9.5" y="3" width="5" height="5" rx="1" opacity="0.55" />
      <rect x="16" y="3" width="5" height="5" rx="1" opacity="0.25" />
      <rect x="3" y="9.5" width="5" height="5" rx="1" opacity="0.55" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      <rect x="16" y="9.5" width="5" height="5" rx="1" opacity="0.55" />
      <rect x="3" y="16" width="5" height="5" rx="1" opacity="0.25" />
      <rect x="9.5" y="16" width="5" height="5" rx="1" opacity="0.55" />
      <rect x="16" y="16" width="5" height="5" rx="1" />
    </svg>
  );
}

export function SunIcon(props) {
  return (
    <svg {...base} width="18" height="18" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M4.93 19.07l1.41-1.41" />
      <path d="M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export function MoonIcon(props) {
  return (
    <svg {...base} width="18" height="18" {...props}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
    </svg>
  );
}

export function MusicIcon(props) {
  return (
    <svg {...base} width="18" height="18" {...props}>
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </svg>
  );
}

export function PlayIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function PauseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <rect x="6" y="5" width="4" height="14" />
      <rect x="14" y="5" width="4" height="14" />
    </svg>
  );
}

export function FocusIcon(props) {
  return (
    <svg {...base} width="16" height="16" {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function FlameIcon({ active, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24" width="16" height="16"
      fill={active ? 'var(--color-accent)' : 'none'}
      stroke={active ? 'var(--color-accent-700)' : 'var(--color-neutral-600)'}
      strokeWidth="1.5"
      {...props}
    >
      <path d="M12 2c1 3-2 4-2 7a4 4 0 0 0 8 0c0-1-.3-2-1-3 1.5.7 3 2.6 3 5.5A6.5 6.5 0 0 1 6.5 18 6.5 6.5 0 0 1 8 7c0 1.5.8 2 1.5 1.5C8 6 9 3.5 12 2z" />
    </svg>
  );
}
