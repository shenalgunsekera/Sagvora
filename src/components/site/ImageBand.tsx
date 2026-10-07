import SplitText from "@/components/fx/SplitText";

/**
 * Full-bleed image break between sections.
 *
 * The photograph sits under a heavy gradient and a cool wash so it never
 * competes with the type — it reads as depth rather than decoration, which is
 * the only way a photo survives on a page this dark.
 */
export default function ImageBand({
  src,
  alt,
  kicker,
  line,
  height = "tall",
}: {
  src: string;
  alt: string;
  kicker: string;
  line: string;
  height?: "tall" | "short";
}) {
  return (
    <section
      className={`relative overflow-clip ${
        height === "tall" ? "h-[68svh] min-h-[26rem]" : "h-[44svh] min-h-[18rem]"
      }`}
    >
      {/* The source photography is already near-black, so it needs lifting
          before it is graded — otherwise the scrim buries it entirely. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full scale-105 object-cover"
        loading="lazy"
        decoding="async"
        data-reveal="scale"
        style={{
          ["--reveal-duration" as string]: "1600ms",
          filter: "brightness(1.5) contrast(1.06) saturate(0.85)",
        }}
      />

      {/* Grade in three passes: a directional scrim that is heavy where the type
          sits and clears to the right so the photograph is actually visible, a
          softer vertical blend into the sections above and below, and a cool
          tint that pulls the image into the palette. */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(100deg, rgba(8,8,10,0.94) 0%, rgba(8,8,10,0.72) 34%, rgba(8,8,10,0.28) 68%, rgba(8,8,10,0.12) 100%), linear-gradient(to top, rgba(8,8,10,0.88) 0%, rgba(8,8,10,0) 38%, rgba(8,8,10,0) 72%, rgba(8,8,10,0.7) 100%), radial-gradient(70% 60% at 80% 30%, rgba(166,200,232,0.18), transparent 72%), radial-gradient(50% 45% at 10% 85%, rgba(217,185,120,0.08), transparent 70%)",
        }}
      />

      {/* Hairlines tie the band back into the rest of the page grid. */}
      <div className="absolute inset-x-0 top-0 h-px bg-line" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-line" aria-hidden="true" />

      <div className="relative flex h-full items-end pb-12">
        <div className="shell">
          <div className="flex items-center gap-4" data-reveal="fade">
            <span className="h-px w-8 bg-cool" />
            <span className="kicker">{kicker}</span>
          </div>
          <SplitText
            as="p"
            text={line}
            className="display-md mt-5 max-w-3xl text-paper"
          />
        </div>
      </div>
    </section>
  );
}
