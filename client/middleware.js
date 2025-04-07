import { NextResponse } from "next/server";

export function middleware(request) {
  console.log("Middleware is running 🚀");
  const isAuth = request.cookies.get("authToken")?.value; // Check if token exists
  console.log("Auth Token:", isAuth);

  // List of protected routes
  const protectedRoutes = [
    "/dashboard",
    "/order-details",
    "/scan",
    "/customer-details",
    "/admin",
    "/profile",
  ];

  // Check if the user is trying to access a protected route without authentication
  if (
    protectedRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route)
    ) &&
    !isAuth
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next(); // Allow request if authenticated
}

// ✅ Apply middleware to all protected routes (ensuring it works with dynamic paths)
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/order-details/:path*",
    "/scan/:path*",
    "/customer-details/:path*",
    "/admin/:path*",
    "/profile/:path*",
  ],
};
