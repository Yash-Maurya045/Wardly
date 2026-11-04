export default function WardlyLogo({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`wardly-logo-svg ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="wardlyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2F4BFF" />
          <stop offset="50%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
        <linearGradient id="wardlyGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#2F4BFF" stopOpacity="0.2" />
        </linearGradient>
        <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2F4BFF" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Hexagonal / Civic Network Frame */}
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="10"
        fill="rgba(47, 75, 255, 0.12)"
        stroke="url(#wardlyGrad)"
        strokeWidth="1.8"
      />

      {/* Stylized Interconnected Geometric 'W' */}
      <path
        d="M8 12 L14 28 L20 17 L26 28 L32 12"
        stroke="url(#wardlyGrad)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#logoShadow)"
      />

      {/* Interconnecting Civic Network Nodes */}
      <circle cx="8" cy="12" r="2.2" fill="#60A5FA" />
      <circle cx="14" cy="28" r="2.2" fill="#38BDF8" />
      <circle cx="20" cy="17" r="2.5" fill="#FFFFFF" />
      <circle cx="26" cy="28" r="2.2" fill="#38BDF8" />
      <circle cx="32" cy="12" r="2.2" fill="#60A5FA" />

      {/* Central Civic Radar Pulse */}
      <circle cx="20" cy="17" r="5" stroke="#38BDF8" strokeWidth="0.8" strokeOpacity="0.5" />
    </svg>
  );
}
