import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const user = request.auth?.user;

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!user.role && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/buyer/:path*", "/supplier/:path*", "/onboarding"],
};
