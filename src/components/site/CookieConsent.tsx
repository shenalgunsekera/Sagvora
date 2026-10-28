"use client";

import { useEffect, useState } from "react";

/**
 * Cookie consent. Nothing that tracks (analytics, pixels, any third-party
 * script) is added to the page until the visitor presses "Accept". The choice
 * is kept for six months in a first-party cookie; "Cookie settings" in the
 * footer reopens the banner. Declining after accepting removes the analytics
 * cookies and reloads, so the tag is gone too.
 */
const COOKIE = "sv_consent";
const MAX_AGE = 60 * 60 * 24 * 182;
export const OPEN_EVENT = "sv:cookie-settings";

type Choice = "granted" | "denied";

function readChoice(): Choice | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=(granted|denied)`));
  return (m?.[1] as Choice) ?? null;
}

function saveChoice(c: Choice) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE}=${c}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`;
}

/** Drops Google Analytics cookies (_ga, _ga_*, _gid) on this host and its parent domain. */
function clearAnalyticsCookies() {
  const host = location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const name of document.cookie.split("; ").map((c) => c.split("=")[0])) {
    if (!/^(_ga|_gid|_gat)/.test(name)) continue;
    for (const d of domains) document.cookie = `${name}=; Max-Age=0; Path=/${d ? `; Domain=${d}` : ""}`;
  }
}

function loadAnalytics(id: string) {
  if (!id || document.getElementById("ga-loader")) return;
  const w = window as unknown as { dataLayer: unknown[]; gtag: (...a: unknown[]) => void };
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer.push(arguments);
  };
  w.gtag("js", new Date());
  w.gtag("config", id);
  const s = document.createElement("script");
  s.id = "ga-loader";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);
}

export default function CookieConsent({ analyticsId }: { analyticsId: string }) {
  // null until mounted: the server never renders the banner, so there is no flash.
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const choice = readChoice();
    setOpen(choice === null);
    if (choice === "granted") loadAnalytics(analyticsId);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, [analyticsId]);

  const choose = (c: Choice) => {
    const before = readChoice();
    saveChoice(c);
    setOpen(false);
    if (c === "granted") loadAnalytics(analyticsId);
    else if (before === "granted") {
      clearAnalyticsCookies();
      location.reload();
    }
  };

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="false" aria-labelledby="cookie-title" aria-describedby="cookie-text" className="cookie-banner">
      <p id="cookie-title" className="index text-paper">
        Cookies
      </p>
      <p id="cookie-text" className="mt-2 text-[0.9375rem] leading-relaxed text-paper-60">
        We&rsquo;d like to use analytics cookies to see which pages help people. Nothing that tracks you loads unless you
        accept. The site works the same either way.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={() => choose("granted")} className="btn btn-solid">
          <span>Accept</span>
        </button>
        <button type="button" onClick={() => choose("denied")} className="btn">
          <span>Decline</span>
        </button>
      </div>
    </div>
  );
}
