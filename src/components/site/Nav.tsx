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

export default function Nav() {
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
                className="link-wipe kicker transition-colors duration-500 hover:text-paper"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/#contact" className="btn py-3">
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
        <div className="flex h-full flex-col justify-between px-[var(--spacing-gutter)] pb-14 pt-32">
          <nav className="flex flex-col gap-2">
            {LINKS.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                className="display-md wordmark overflow-hidden py-2 text-paper"
              >
                <span
                  className="inline-block transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    transform: open ? "translateY(0)" : "translateY(110%)",
                    transitionDelay: `${180 + i * 70}ms`,
                  }}
                >
                  {l.label}
                </span>
              </Link>
            ))}
          </nav>
          <div className="kicker">Sagvora Innovations · Colombo</div>
        </div>
      </div>
    </>
  );
}
