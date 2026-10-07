"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Admin-side failure. Unlike the public page this one keeps the author oriented:
 * their unsaved input is gone, so say so plainly rather than implying a retry
 * will bring it back.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin render failed:", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl py-20">
      <span className="kicker kicker-signal">Error</span>
      <h1 className="display-sm mt-4 text-paper">This screen failed to load.</h1>
      <p className="mt-4 text-sm leading-relaxed text-paper-60">
        Nothing was saved, and nothing already stored has been changed. If a form was open,
        its unsaved contents are gone — retry, then re-enter them.
      </p>

      {error.digest && (
        <p className="index mt-5">
          Reference <span className="text-paper-60">{error.digest}</span>
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="admin-btn admin-btn-primary">
          Try again
        </button>
        <Link href="/admin" className="admin-btn">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
