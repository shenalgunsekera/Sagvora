const NOISE = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220">
  <filter id="n">
    <feTurbulence type="fractalNoise" baseFrequency="0.86" numOctaves="4" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
  <rect width="220" height="220" filter="url(#n)" opacity="0.6"/>
</svg>`;

const URL = `url("data:image/svg+xml;utf8,${encodeURIComponent(NOISE)}")`;

/**
 * Film grain + vignette. Both are fixed, pointer-transparent overlays — they
 * cost one composited layer each and give the flat black real depth.
 */
export default function Grain() {
  return (
    <>
      <div className="grain" style={{ ["--grain-url" as string]: URL }} aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
    </>
  );
}
