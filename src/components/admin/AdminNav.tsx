"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/admin/actions";
import type { AdminUser } from "@/lib/types";

const SECTIONS: { heading: string; items: { href: string; label: string; badge?: boolean }[] }[] = [
  {
    heading: "Overview",
    items: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    heading: "Content",
    items: [
      { href: "/admin/capabilities", label: "Capabilities" },
      { href: "/admin/work", label: "Work" },
      { href: "/admin/stages", label: "Ladder stages" },
      { href: "/admin/testimonials", label: "Testimonials" },
    ],
  },
  {
    heading: "Site",
    items: [
      { href: "/admin/settings", label: "Settings & copy" },
      { href: "/admin/media", label: "Media" },
      { href: "/admin/inbox", label: "Inbox", badge: true },
    ],
  },
  {
    heading: "You",
    items: [{ href: "/admin/account", label: "Account" }],
  },
];

export default function AdminNav({ user, unread }: { user: AdminUser; unread: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile bar */}
      <div className="flex items-center justify-between border-b border-line px-6 py-4 lg:hidden">
        <Link href="/admin" className="wordmark text-lg text-paper">
          Sagvora
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="admin-btn"
          aria-expanded={open}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <aside
        className={`${
          open ? "block" : "hidden"
        } shrink-0 border-b border-line bg-ink-1 lg:sticky lg:top-0 lg:block lg:h-screen lg:w-64 lg:border-b-0 lg:border-r`}
      >
        <div className="flex h-full flex-col justify-between p-6">
          <div>
            <Link href="/admin" className="hidden lg:block">
              <span className="wordmark block text-xl text-paper">Sagvora</span>
              <span className="kicker mt-2 block">Control room</span>
            </Link>

            <nav className="mt-0 flex flex-col gap-7 lg:mt-10">
              {SECTIONS.map((section) => (
                <div key={section.heading}>
                  <div className="kicker text-[0.5625rem]">{section.heading}</div>
                  <ul className="mt-3 flex flex-col gap-0.5">
                    {section.items.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-between rounded-[3px] px-3 py-2 text-sm transition-colors duration-200"
                            style={{
                              background: active ? "var(--color-ink-3)" : "transparent",
                              color: active ? "var(--color-paper)" : "var(--color-paper-45)",
                            }}
                          >
                            <span className="flex items-center gap-2.5">
                              <span
                                className="h-1 w-1 rounded-full transition-colors duration-200"
                                style={{
                                  background: active
                                    ? "var(--color-signal)"
                                    : "var(--color-line-strong)",
                                }}
                              />
                              {item.label}
                            </span>
                            {item.badge && unread > 0 && (
                              <span className="rounded-full bg-signal px-1.5 py-0.5 font-mono text-[0.5625rem] text-ink-0">
                                {unread}
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div className="mt-8 border-t border-line pt-5">
            <div className="truncate text-sm text-paper-60">{user.name}</div>
            <div className="index truncate">{user.email}</div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/" target="_blank" className="admin-btn text-[0.625rem]">
                View site ↗
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="admin-btn text-[0.625rem]">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
