import type { Instrumentation } from "next";

export function register() {}

/**
 * Keeps the last few server errors in /tmp so /api/health can show them on
 * hosts where function logs are not at hand. Message, route and stack top
 * only — no request bodies, headers or environment values.
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const fs = await import("node:fs");
    const file = "/tmp/sagvora/errors.json";
    fs.mkdirSync("/tmp/sagvora", { recursive: true });
    const prev = fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as unknown[]) : [];
    const e = err as Error & { digest?: string };
    const entry = {
      at: new Date().toISOString(),
      path: request.path,
      route: context.routePath,
      error: `${e.name}: ${e.message}`,
      digest: e.digest,
      stack: e.stack?.split("\n").slice(0, 8),
    };
    fs.writeFileSync(file, JSON.stringify([entry, ...prev].slice(0, 10)));
  } catch {
    // Diagnostics must never become the failure.
  }
};
