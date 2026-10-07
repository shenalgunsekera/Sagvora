import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { getCurrentUser } from "@/lib/auth";
import { countNewMessages } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Control room", template: "%s · Sagvora Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = (await headers()).get("x-sagvora-path") ?? "";
  const isLogin = path === "/admin/login";

  // Authoritative session check: unlike the middleware this can reach the
  // database, so it also rejects a correctly-signed token whose version has
  // been superseded by a password change.
  const user = await getCurrentUser();

  // The login route is the one page allowed to render without a session.
  if (isLogin) return <>{children}</>;

  // Anything else without a live session goes back to the door. This is what
  // stops a revoked-but-signed cookie from reading admin pages after the
  // middleware has waved it through.
  if (!user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminNav user={user} unread={countNewMessages()} />
      <main className="min-w-0 flex-1 px-6 py-10 md:px-10 lg:px-12">{children}</main>
    </div>
  );
}
