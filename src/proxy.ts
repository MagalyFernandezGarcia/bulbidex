import { NextRequest, NextResponse } from "next/server";
import { isValidSessionToken, SESSION_COOKIE_NAME } from "@/lib/session-token";

const LOGIN_PATH = "/login";

export const proxy = async (request: NextRequest) => {
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
