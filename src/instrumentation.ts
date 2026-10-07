import type { Instrumentation } from "next";

export function register() {}

export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  // Imported only on the Node runtime; the edge build drops this branch, so
  // node:fs never reaches the edge bundle (which fails to compile with it).
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { recordError } = await import("./lib/error-log");
    recordError(err, request.path, context.routePath);
  }
};
