import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'cookie';
import { checkServerSession } from './lib/api/serverApi';

const privateRoutes = ['/profile', '/notes'];
const publicRoutes = ['/sign-in', '/sign-up'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPrivateRoute = privateRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const res = NextResponse.next();

  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const parsedCookies = parse(cookieHeader);

    let accessToken = parsedCookies['accessToken'];
    const refreshToken = parsedCookies['refreshToken'];

    if (!accessToken && refreshToken) {
      let sessionData;
      try {
        sessionData = await checkServerSession();
      } catch (err) {
        console.error('checkServerSession failed', err);
        if (isPrivateRoute) return NextResponse.redirect(new URL('/sign-in', request.url));
      }

      if (sessionData) {
        const setCookies = sessionData.headers?.['set-cookie'];
        if (setCookies) {
          const cookieArray = Array.isArray(setCookies) ? setCookies : [setCookies];
          for (const cookieStr of cookieArray) {
            const parsed = parse(cookieStr);
            if (parsed.accessToken) {
              res.cookies.set({
                name: 'accessToken',
                value: parsed.accessToken,
                httpOnly: true,
                path: '/',
              });
              accessToken = parsed.accessToken;
            }
            if (parsed.refreshToken) {
              res.cookies.set({
                name: 'refreshToken',
                value: parsed.refreshToken,
                httpOnly: true,
                path: '/',
              });
            }
          }
        }
      }
    }

    if (accessToken && isPublicRoute) return NextResponse.redirect(new URL('/', request.url));
    if (!accessToken && isPrivateRoute) return NextResponse.redirect(new URL('/sign-in', request.url));

    return res;
  } catch (err) {
    console.error('Middleware error:', err);
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};



