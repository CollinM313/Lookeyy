import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const ROLE_PREFIXES: Record<string, "CLIENT" | "AGENT" | "ADMIN"> = {
  "/dashboard/client": "CLIENT",
  "/dashboard/agent": "AGENT",
  "/dashboard/admin": "ADMIN",
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const match = Object.entries(ROLE_PREFIXES).find(([prefix]) => pathname.startsWith(prefix));
  if (!match) return NextResponse.next();

  const requiredRole = match[1];
  const session = req.auth;

  if (!session?.user) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (session.user.role !== requiredRole && session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
