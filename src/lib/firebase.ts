import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Server-side Firestore, through the Admin SDK.
 *
 * Credentials come from FIREBASE_SERVICE_ACCOUNT: the service account JSON,
 * base64-encoded so it fits in one environment variable on any host. The
 * Firestore rules deny every browser client, so this server is the only door.
 */

declare global {
  // One SDK instance per process, surviving dev-server hot reloads.
  // eslint-disable-next-line no-var
  var __sagvoraFirestore: Firestore | undefined;
}

function credentials() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is not set — see README → Firebase.");
  }
  const json = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
  return JSON.parse(json) as { project_id: string; client_email: string; private_key: string };
}

export function firestore(): Firestore {
  if (global.__sagvoraFirestore) return global.__sagvoraFirestore;

  const app: App =
    getApps()[0] ??
    initializeApp({
      credential: cert(
        (() => {
          const c = credentials();
          return { projectId: c.project_id, clientEmail: c.client_email, privateKey: c.private_key };
        })(),
      ),
    });

  const db = getFirestore(app);
  db.settings({ ignoreUndefinedProperties: true });
  global.__sagvoraFirestore = db;
  return db;
}
