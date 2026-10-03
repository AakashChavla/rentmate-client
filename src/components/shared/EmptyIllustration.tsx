export function EmptyIllustration(): React.JSX.Element {
  return (
    <svg viewBox="0 0 240 180" aria-hidden className="mx-auto h-40 w-48 text-primary">
      <circle cx="120" cy="85" r="72" fill="currentColor" opacity=".06" />
      <rect x="68" y="62" width="104" height="80" rx="16" fill="currentColor" opacity=".15" />
      <path
        d="M57 75l63-43 63 43M93 142v-38h54v38"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M48 146h144M110 81h20" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <circle cx="181" cy="43" r="9" fill="#0d9488" opacity=".7" />
    </svg>
  );
}
