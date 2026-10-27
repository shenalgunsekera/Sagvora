"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Wordmark from "./Wordmark";

const LINKS = [
  { label: "Method", href: "/#method" },
  { label: "Capabilities", href: "/#capabilities" },
  { label: "Work", href: "/#work" },
  { label: "Contact", href: "/#contact" },
];

export default function Nav({ email, phone }: { email?: string; phone?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the overlay on navigation and lock scroll while it is open.
  useEffect(() => setOpen(false), [pathname]);

  /**
   * Section links (/#work) on the home page don't change the pathname, so the
   * effect above never closed the menu, and the scroll lock it holds swallowed
   * the jump. Handle them here: close, release the lock, then scroll.
   */
  const goTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const [path, hash] = href.split("#");
    if (!hash || (path || "/") !== pathname) {
      setOpen(false);
      return; // a different page: let the router navigate
    }
    const target = document.getElementById(hash);
    if (!target) return;
    e.preventDefault();
    setOpen(false);
    document.body.style.overflow = "";
    // One frame later the lock is gone and the overlay has started to lift.
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${hash}`);
    });
  };
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // A full-screen overlay that traps neither focus nor Escape is a keyboard
  // dead end: tabbing walks invisibly through the page behind it.
  useEffect(() => {
    if (!open) return;
    const panel = overlayRef.current;

    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
      );

    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || !panel?.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500"
        style={{
          backgroundColor: scrolled ? "rgba(8,8,10,0.72)" : "transparent",
          backdropFilter: scrolled ? "blur(14px) saturate(140%)" : "none",
          borderBottom: `1px solid ${scrolled ? "var(--color-line)" : "transparent"}`,
        }}
      >
        <div className="shell flex h-20 items-center justify-between">
          <Link href="/" aria-label="Sagvora Innovations — home" className="relative z-10">
            <Wordmark className="text-[1.15rem]" />
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={(e) => goTo(e, l.href)}
                className="link-wipe kicker transition-colors duration-500 hover:text-paper"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/#contact" onClick={(e) => goTo(e, "/#contact")} className="btn py-3">
              <span>Start</span>
              <span className="btn-arrow">→</span>
            </Link>
          </nav>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="relative z-10 flex h-10 w-10 flex-col items-center justify-center gap-[7px] md:hidden"
          >
            <span
              className="h-px w-6 bg-paper transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ transform: open ? "translateY(4px) rotate(45deg)" : "none" }}
            />
            <span
              className="h-px w-6 bg-paper transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ transform: open ? "translateY(-4px) rotate(-45deg)" : "none" }}
            />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        id="mobile-menu"
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        // Hidden from assistive tech and taken out of the tab order while
        // closed; the clip-path alone would leave it reachable.
        inert={!open}
        aria-hidden={!open}
        className="fixed inset-0 z-40 bg-ink-0 md:hidden"
        style={{
          clipPath: open ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)",
          transition: "clip-path 800ms cubic-bezier(0.83,0,0.17,1)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div className="flex h-full flex-col justify-between overflow-y-auto px-[var(--spacing-gutter)] pb-[max(2rem,env(safe-area-inset-bottom))] pt-28">
          <nav className="flex flex-col border-t border-line">
            {LINKS.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={(e) => goTo(e, l.href)}
                className="flex items-baseline gap-5 overflow-hidden border-b border-line py-5 text-paper"
              >
                <span
                  className="flex items-baseline gap-5 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    transform: open ? "translateY(0)" : "translateY(120%)",
                    transitionDelay: `${180 + i * 70}ms`,
                  }}
                >
                  <span className="index">0{i + 1}</span>
                  <span className="wordmark text-[2.75rem]">{l.label}</span>
                </span>
              </Link>
            ))}
          </nav>

          <div
            className="mt-10 transition-opacity duration-700"
            style={{ opacity: open ? 1 : 0, transitionDelay: open ? "480ms" : "0ms" }}
          >
            <Link
              href="/#contact"
              onClick={(e) => goTo(e, "/#contact")}
              className="btn btn-solid w-full justify-between"
            >
              <span>Start a transformation</span>
              <span className="btn-arrow">→</span>
            </Link>
            <div className="mt-6 flex flex-col gap-1">
              {email && (
                <a href={`mailto:${email}`} className="text-paper-60">
                  {email}
                </a>
              )}
              {phone && (
                <a href={`tel:${phone.replace(/s/g, "")}`} className="text-paper-60">
                  {phone}
                </a>
              )}
              <span className="kicker mt-4">Sagvora Innovations · Colombo</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
