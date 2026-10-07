"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Public-side failure. Keeps the brand, says only what is useful, and offers a
 * retry that re-runs the server render rather than a full page reload.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaces in the server log with the digest, which is the only handle you
    // get on a production error from the client side.
    console.error("Site render failed:", error.digest ?? error.message);
  }, [error]);

  return (
    <section className="flex min-h-[80svh] items-center pt-32">
      <div className="shell">
        <span className="kicker kicker-signal">Something broke</span>
        <h1 className="display-lg mt-6 max-w-3xl text-paper">
          That did not load.
        </h1>
        <p className="lead mt-8 max-w-md">
          The page failed on our side, not yours. Trying again usually clears it.
        </p>

        {error.digest && (
          <p className="index mt-6">
            Reference <span className="text-paper-60">{error.digest}</span>
          </p>
        )}

        <div className="mt-10 flex flex-wrap gap-4">
          <button type="button" onClick={reset} className="btn btn-solid">
            <span>Try again</span>
            <span className="btn-arrow">↻</span>
          </button>
          <Link href="/" className="btn">
            <span>Back to start</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
