/**
 * Shown while a server-rendered page is in flight. Deliberately quiet — a
 * single drawing rule rather than a spinner, so a fast navigation does not
 * flash something loud on screen.
 */
export default function Loading() {
  return (
    <div className="flex min-h-[70svh] items-center" aria-busy="true" aria-live="polite">
      <div className="shell">
        <span className="kicker">Loading</span>
        <div className="mt-5 h-px w-full max-w-md overflow-hidden bg-line">
          <div
            className="h-px w-1/3"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--color-signal), var(--color-cool), transparent)",
              animation: "load-sweep 1.25s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            }}
          />
        </div>
      </div>
    </div>
  );
}
