import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  // Courtesy redirect for someone already signed in. Done here rather than in
  // the middleware because only this layer can tell a live session from a
  // merely well-signed one.
  if (await getCurrentUser()) redirect("/admin");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      {/* Quiet ambient field so the sign-in still feels like the brand */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(244,244,240,0.09) 1px, transparent 0)",
          backgroundSize: "34px 34px",
          maskImage: "radial-gradient(60% 55% at 50% 45%, #000, transparent)",
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-10">
          <span className="wordmark block text-[1.9rem] text-paper">Sagvora</span>
          <span className="kicker mt-3 block">Control room</span>
        </div>

        <LoginForm next={next} />

        <p className="index mt-10 leading-relaxed">
          Sessions last seven days. Change the seeded password from Account once you are in.
        </p>
      </div>
    </div>
  );
}
