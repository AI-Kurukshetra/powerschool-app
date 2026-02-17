import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { readSupabaseEnv } from "@/lib/supabase/env";

function createSupabaseMiddlewareClient(
  request: NextRequest,
  response: NextResponse,
) {
  const { url, anonKey } = readSupabaseEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach((cookie) => {
          response.cookies.set(cookie);
        });
      },
    },
  });
}

function isPublicRoute(pathname: string): boolean {
  return pathname === "/" || pathname === "/login";
}

function isParentBlockedRoute(pathname: string): boolean {
  return pathname.startsWith("/dashboard/students") || pathname.startsWith("/reports");
}

export async function middleware(request: NextRequest) {
  if (isPublicRoute(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const supabase = createSupabaseMiddlewareClient(request, response);

  try {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      console.info("[auth] Middleware redirect to /login");
      response.cookies.set("redirect_to", request.nextUrl.pathname, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
      });
      return NextResponse.redirect(new URL("/login", request.url), {
        headers: response.headers,
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("[auth] Middleware profile lookup failed", profileError.message);
      return response;
    }

    if (profile?.role === "parent" && isParentBlockedRoute(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url), {
        headers: response.headers,
      });
    }
  } catch (error) {
    console.error("[auth] Middleware auth check failed", error);
    response.cookies.set("redirect_to", request.nextUrl.pathname, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
    return NextResponse.redirect(new URL("/login", request.url), {
      headers: response.headers,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
