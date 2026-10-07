import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "sagvora_session";

/**
 * First gate for /admin.
 *
 * Runs on the edge, where the content store is unreachable, so it can only
 * verify that the cookie carries our signature. That is deliberately *not*
 * treated as proof of a live session — a token signed before a password change
 * still passes here. The real check happens in the admin layout, which can read
 * the database and compare the token version.
 *
 * Note what this does NOT do: bounce an already-signed-in visitor away from the
 * login page. That would deadlock against the layout's redirect, because a
 * revoked-but-signed cookie would ping-pong between the two forever. The login
 * page performs that courtesy itself, using the authoritative check.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/admin/login";
  const token = req.cookies.get(SESSION_COOKIE)?.value;

  let signed = false;
  if (token) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET ?? ""));
      signed = true;
    } catch {
      signed = false;
    }
  }

  if (!signed && !isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  // Pass the path down so the layout can tell the login route apart from a
  // protected one without guessing.
  const headers = new Headers(req.headers);
  headers.set("x-sagvora-path", pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/admin/:path*"],
};
