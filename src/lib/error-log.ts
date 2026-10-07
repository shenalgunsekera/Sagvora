import fs from "node:fs";

const DIR = "/tmp/sagvora";
const FILE = `${DIR}/errors.json`;

/**
 * Keeps the last few server errors in /tmp so /api/health can show them on
 * hosts where function logs are not at hand. Message, route and stack top
 * only — no request bodies, headers or environment values.
 */
export function recordError(err: unknown, path: string, route: string) {
  try {
    fs.mkdirSync(DIR, { recursive: true });
    const prev = fs.existsSync(FILE) ? (JSON.parse(fs.readFileSync(FILE, "utf8")) as unknown[]) : [];
    const e = err as Error & { digest?: string };
    const entry = {
      at: new Date().toISOString(),
      path,
      route,
      error: `${e?.name}: ${e?.message}`,
      digest: e?.digest,
      stack: e?.stack?.split("\n").slice(0, 8),
    };
    fs.writeFileSync(FILE, JSON.stringify([entry, ...prev].slice(0, 10)));
  } catch {
    // Diagnostics must never become the failure.
  }
}

export function readErrors(): unknown[] {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return [];
  }
}
