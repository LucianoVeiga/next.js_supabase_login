import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login']
const INACTIVITY_LIMIT = 60 * 1000 // 1 minuto

export async function middleware(request: NextRequest) {
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

  const { data: { user } } = await supabase.auth.getUser()

  const isPublic = PUBLIC_ROUTES.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  // 1. Chequeo de inactividad PRIMERO
  if (user) {
    const lastActivity = request.cookies.get('last_activity')?.value
    const now = Date.now()

    if (lastActivity && now - parseInt(lastActivity) > INACTIVITY_LIMIT) {
      await supabase.auth.signOut()

      const url = request.nextUrl.clone()
      url.pathname = '/login'
      const response = NextResponse.redirect(url)
      response.cookies.delete('last_activity')
      return response
    }

    // Actualizar timestamp de actividad
    supabaseResponse.cookies.set('last_activity', now.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: INACTIVITY_LIMIT / 1000,
    })
  }

  // 2. No logueado + ruta protegida → login
  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 3. Logueado + va al login → dashboard
  if (user && isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}