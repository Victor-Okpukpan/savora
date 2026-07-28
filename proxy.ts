import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const APP_SEGMENT = "/main";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const hostname = host.split(":")[0];
  const { pathname } = request.nextUrl;
  const isAppHost = hostname.startsWith("app.");

  if (isAppHost && !pathname.startsWith(APP_SEGMENT)) {
    const url = request.nextUrl.clone();
    url.pathname = `${APP_SEGMENT}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals and any path that looks like a static file (has a dot),
  // so public/ assets are served as-is on every host without being rewritten.
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
