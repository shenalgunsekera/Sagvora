"use client";

import { OPEN_EVENT } from "./CookieConsent";

/** Footer link that reopens the cookie banner. */
export default function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))} className={className}>
      Cookie settings
    </button>
  );
}
