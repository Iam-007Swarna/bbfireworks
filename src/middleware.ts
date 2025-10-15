import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth.config";

const PROTECTED = [/^\/pos(?:\/.*)?$/, /^\/admin(?:\/.*)?$/];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (PROTECTED.some(rx => rx.test(path))) {
    const session = await auth();
    if (!session) return NextResponse.redirect(new URL("/auth/login", req.url));
    const role = (session.user as any)?.role;
    if (!["admin","member"].includes(role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/pos/:path*", "/admin/:path*"] };
