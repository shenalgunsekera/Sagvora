/**
 * The Sagvora lockup, set live rather than shipped as an image so it stays
 * crisp at any size and inherits colour. Archivo's width axis is pulled in to
 * match the supplied logo's condensed grotesque.
 *
 * The raster originals remain available at /logo-light.png and /logo-dark.png.
 */
export default function Wordmark({
  className = "",
  suffix = true,
}: {
  className?: string;
  suffix?: boolean;
}) {
  return (
    <span className={`inline-block leading-none ${className}`}>
      <span className="wordmark block text-[1em]">Sagvora</span>
      {suffix && (
        <span
          className="block font-medium uppercase text-paper-45"
          style={{
            // Never let the descriptor fall below 8px, however small the lockup
            // is set — at nav size an em-relative value alone is unreadable.
            fontSize: "max(0.5rem, 0.245em)",
            fontFamily: "var(--font-display)",
            letterSpacing: "0.3em",
            fontVariationSettings: '"wdth" 92',
            marginTop: "0.4em",
          }}
        >
          Innovations
        </span>
      )}
      <span className="sr-only">Sagvora Innovations</span>
    </span>
  );
}
