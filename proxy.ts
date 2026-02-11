import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login']
const VALID_ROLES = ['admin', 'supervisor']
const INACTIVITY_LIMIT = 5 * 60 * 1000

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const isPublic = PUBLIC_ROUTES.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  // Token inválido en ruta protegida → limpiar y al login
  if (error && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const response = NextResponse.redirect(url)
    response.cookies.delete('user_role')
    response.cookies.delete('last_activity')
    return response
  }

  // 1. Inactividad
  if (user) {
    const lastActivity = request.cookies.get('last_activity')?.value
    const now = Date.now()

    if (lastActivity && now - parseInt(lastActivity) > INACTIVITY_LIMIT) {
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      const response = NextResponse.redirect(url)
      response.cookies.delete('last_activity')
      response.cookies.delete('user_role')
      return response
    }

    supabaseResponse.cookies.set('last_activity', now.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: INACTIVITY_LIMIT / 1000,
    })
  }

  // 2. No logueado → login
  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 3. Ya logueado → dashboard
  if (user && isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // 4. Logueado pero sin rol válido → cerrar sesión
  if (user && !isPublic) {
    const role = request.cookies.get('user_role')?.value

    if (!role || !VALID_ROLES.includes(role)) {
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      const response = NextResponse.redirect(url)
      response.cookies.delete('user_role')
      return response
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.ico$|api).*)',
  ],
}