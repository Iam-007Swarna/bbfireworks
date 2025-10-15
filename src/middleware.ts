import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED = [/^\/pos(?:\/.*)?$/, /^\/admin(?:\/.*)?$/];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (PROTECTED.some(rx => rx.test(path))) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const role = token.role as string | undefined;
    if (!role || !["admin", "member"].includes(role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ["/pos/:path*", "/admin/:path*"] };
