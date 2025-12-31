import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parse } from 'cookie';
import { checkServerSession } from './lib/api/serverApi';

const privateRoutes = ['/profile', '/notes'];
const publicRoutes = ['/sign-in', '/sign-up'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieStore = await cookies();

  let accessToken = cookieStore.get('accessToken')?.value;
  let refreshToken = cookieStore.get('refreshToken')?.value;

  const isPrivateRoute = privateRoutes.some(route =>
    pathname.startsWith(route)
  );
  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Silent auth
  if (!accessToken && refreshToken) {
    try {
      const res = await checkServerSession();
      const setCookie = res.headers['set-cookie'];

      if (setCookie) {
        const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie];

        for (const cookieStr of cookieArray) {
          const parsed = parse(cookieStr);
          const options = {
            path: parsed.Path,
            maxAge: Number(parsed['Max-Age']),
            expires: parsed.Expires ? new Date(parsed.Expires) : undefined,
          };

          if (parsed.accessToken) {
            cookieStore.set('accessToken', parsed.accessToken, options);
            accessToken = parsed.accessToken;
          }

          if (parsed.refreshToken) {
            cookieStore.set('refreshToken', parsed.refreshToken, options);
            refreshToken = parsed.refreshToken;
          }
        }
      }
    } catch {
      // якщо refresh не вдався — ігноруємо
    }
  }

  // приватний маршрут
  if (isPrivateRoute && !accessToken) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // публічний маршрут для авторизованих
  if (isPublicRoute && accessToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
};
