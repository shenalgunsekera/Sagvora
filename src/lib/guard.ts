import { redirect } from "next/navigation";
import { getCurrentUser } from "./auth";
import type { AdminUser } from "./types";

/**
 * Gate for an admin page. Call it as the **first statement** of the component,
 * before reading anything.
 *
 * Why it cannot be left to the layout: in the App Router a layout and its page
 * render concurrently, and the response streams as it goes. A `redirect()` in
 * the layout therefore sets the 307 status while the page's payload — every
 * value it queried — has already been written into the body. The redirect looks
 * correct in a browser and leaks the whole page to anything reading the
 * response directly.
 *
 * Redirecting from inside the page is what actually prevents the render, so
 * every admin page carries this guard. The layout keeps its own check for the
 * chrome; the route handlers check separately. Three layers, none of them
 * decorative.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}
