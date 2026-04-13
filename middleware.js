import { NextResponse } from "next/server";

const AUTH_COOKIE = "bjj_auth";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const authed = request.cookies.get(AUTH_COOKIE)?.value === "1";

  if (pathname === "/login") {
    if (authed) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon|icons/|manifest|bjj-logo|logo|sw.js|workbox-).*)"],
};
