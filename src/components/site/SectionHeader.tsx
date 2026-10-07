import SplitText from "@/components/fx/SplitText";

type Props = {
  index: string;
  kicker: string;
  title: string;
  lead?: string;
  align?: "left" | "split";
};

/**
 * The shared section opener: index number, wide-tracked kicker, a rule that
 * draws itself, then the title splitting up word by word.
 */
export default function SectionHeader({ index, kicker, title, lead, align = "split" }: Props) {
  return (
    <header className="shell">
      <div className="flex items-baseline gap-5">
        <span className="index" data-reveal="fade">
          {index}
        </span>
        <span className="kicker" data-reveal="fade" style={{ ["--reveal-delay" as string]: "80ms" }}>
          {kicker}
        </span>
      </div>

      <div
        className="mt-5 h-px w-full origin-left bg-line"
        data-reveal="rule"
        style={{ ["--reveal-delay" as string]: "120ms" }}
      />

      <div
        className={
          align === "split"
            ? "mt-10 grid gap-8 md:grid-cols-12 md:gap-12"
            : "mt-10 max-w-4xl"
        }
      >
        <SplitText
          as="h2"
          text={title}
          delay={120}
          className={`display-lg text-paper ${align === "split" ? "md:col-span-7" : ""}`}
        />
        {lead && (
          <p
            className={`lead ${align === "split" ? "md:col-span-5 md:pt-3" : "mt-7 max-w-2xl"}`}
            data-reveal="up"
            style={{ ["--reveal-delay" as string]: "260ms" }}
          >
            {lead}
          </p>
        )}
      </div>
    </header>
  );
}
