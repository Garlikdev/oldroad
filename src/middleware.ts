import { auth } from "@/lib/auth"

export default auth((req) => {
  const isAuth = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith('/login')
  const isApiRoute = req.nextUrl.pathname.startsWith('/api')
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

  if (isApiRoute) {
    return null
  }

  if (isAuthPage) {
    if (isAuth) {
      return Response.redirect(new URL('/', req.nextUrl))
    }
    return null
  }

  if (!isAuth) {
    let from = req.nextUrl.pathname
    if (req.nextUrl.search) {
      from += req.nextUrl.search
    }

    return Response.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, req.nextUrl)
    )
  }

  // Check admin routes - only ADMIN role can access
  if (isAdminRoute) {
    const userRole = req.auth?.user?.role
    if (userRole !== 'ADMIN') {
      return Response.redirect(new URL('/', req.nextUrl))
    }
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
