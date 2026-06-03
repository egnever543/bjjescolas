import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as { role?: string } | undefined)?.role;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isApiAuth = pathname.startsWith("/api/auth");

  if (isApiAuth) return NextResponse.next();

  if (isAuthPage) {
    if (isLoggedIn) {
      if (role === "STUDENT") {
        return NextResponse.redirect(new URL("/minha-area", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // STUDENT trying to access dashboard routes
  if (role === "STUDENT") {
    const dashboardPaths = ["/dashboard", "/alunos", "/filiais", "/professores", "/aulas", "/checkin", "/academias"];
    if (dashboardPaths.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/minha-area", req.url));
    }
  }

  // Non-STUDENT trying to access student area
  if (role !== "STUDENT" && pathname.startsWith("/minha-area")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
