import Link from "next/link";
import { CircuitBackdrop } from "@/components/fx/backdrops";
import SplitText from "@/components/fx/SplitText";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80svh] items-center overflow-clip pt-32">
      <CircuitBackdrop className="opacity-50" seed={404} traces={8} />

      <div className="shell relative">
        <span className="kicker kicker-signal">Error 404</span>
        <SplitText
          as="h1"
          text="This page was automated away."
          className="display-lg mt-6 max-w-4xl text-paper"
        />
        <p className="lead mt-8 max-w-md" data-reveal="up">
          Nothing lives at this address. The work, the method and the way to reach us are all one
          click back.
        </p>
        <div className="mt-10 flex flex-wrap gap-4" data-reveal="up">
          <span className="magnetic inline-block" data-magnetic="0.3">
            <Link href="/" className="btn btn-solid">
              <span>Back to start</span>
              <span className="btn-arrow">→</span>
            </Link>
          </span>
          <Link href="/#contact" className="btn">
            <span>Contact</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
