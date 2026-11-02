import { NextRequest, NextResponse } from "next/server";
import { MCP_PATH } from "@/lib/oauth/endpoints";
import { isValidSessionToken, SESSION_COOKIE_NAME } from "@/lib/session-token";

const LOGIN_PATH = "/login";

const OAUTH_PUBLIC_PATH_PREFIXES = ["/api/oauth/", "/.well-known/", "/oauth/"];

const isOAuthPublicPath = (pathname: string) =>
  pathname === MCP_PATH || OAUTH_PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export const proxy = async (request: NextRequest) => {
  if (isOAuthPublicPath(request.nextUrl.pathname)) return NextResponse.next();

  const isAuthenticated = await isValidSessionToken(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );
  const isLoginPage = request.nextUrl.pathname === LOGIN_PATH;

  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.nextUrl));
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
