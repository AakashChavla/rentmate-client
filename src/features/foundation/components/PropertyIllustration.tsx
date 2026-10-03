export function PropertyIllustration(): React.JSX.Element {
  return (
    <svg aria-hidden viewBox="0 0 320 200" className="w-full text-primary">
      <rect x="32" y="36" width="112" height="144" rx="16" fill="currentColor" opacity=".12" />
      <rect x="162" y="12" width="124" height="168" rx="16" fill="currentColor" opacity=".22" />
      <path
        d="M60 70h55M60 100h55M60 130h55M190 48h68M190 80h68M190 112h68"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path d="M20 180h280" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
