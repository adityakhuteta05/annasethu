import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith('/login') || path === '/forgot-password' || path === '/reset-password';
  const isProtectedRoute = 
    path.startsWith('/donor') || 
    path.startsWith('/receiver') || 
    path.startsWith('/ngo') || 
    path.startsWith('/driver') || 
    path.startsWith('/admin') ||
    path.startsWith('/verification');

  function redirectWithCookies(url: URL) {
    const res = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      res.cookies.set(cookie.name, cookie.value, cookie);
    });
    return res;
  }

  // If unauthenticated user tries to access protected route -> redirect to /login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', path);
    return redirectWithCookies(url);
  }

  // If authenticated user
  if (user) {
    // Read authoritative role from user_metadata first, fallback to profiles table
    let role = user.user_metadata?.role;
    let isActive = true;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('id', user.id)
        .single();

      if (profile) {
        role = profile.role || role;
        isActive = profile.is_active ?? true;
      }
    } catch {
      // Fallback to metadata if DB lookup fails
    }

    // Check account active status: deactivated accounts rejected
    if (isActive === false) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('error', 'Account is deactivated. Please contact support.');
      return redirectWithCookies(url);
    }

    // Normalized role string
    const normalizedRole = (role || 'DONOR').toUpperCase();

    // Map role to default destination
    const roleRoutes: Record<string, string> = {
      DONOR: '/donor/dashboard',
      NGO: '/receiver/dashboard',
      RECEIVER: '/receiver/dashboard',
      DRIVER: '/driver/jobs',
      ADMIN: '/admin/dashboard',
    };

    // If logged-in user visits auth pages, redirect to role destination
    if (isAuthRoute && path !== '/reset-password') {
      const dest = roleRoutes[normalizedRole] || '/donor/dashboard';
      const url = request.nextUrl.clone();
      url.pathname = dest;
      return redirectWithCookies(url);
    }

    // Cross-role protection
    if (path.startsWith('/donor') && normalizedRole !== 'DONOR') {
      const url = request.nextUrl.clone();
      url.pathname = roleRoutes[normalizedRole] || '/login';
      return redirectWithCookies(url);
    }

    if ((path.startsWith('/receiver') || path.startsWith('/ngo')) && normalizedRole !== 'NGO' && normalizedRole !== 'RECEIVER') {
      const url = request.nextUrl.clone();
      url.pathname = roleRoutes[normalizedRole] || '/login';
      return redirectWithCookies(url);
    }

    if (path.startsWith('/driver') && normalizedRole !== 'DRIVER') {
      const url = request.nextUrl.clone();
      url.pathname = roleRoutes[normalizedRole] || '/login';
      return redirectWithCookies(url);
    }

    if (path.startsWith('/admin') && normalizedRole !== 'ADMIN') {
      const url = request.nextUrl.clone();
      url.pathname = roleRoutes[normalizedRole] || '/login';
      return redirectWithCookies(url);
    }
  }

  return supabaseResponse;
}
