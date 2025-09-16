import { NextRequest, NextResponse } from 'next/server';
import { authApi } from '@/lib/hooks/getAuthApi';

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: 'Refresh token not found' }, { status: 401 });
  }

  try {
    const data = await authApi.refreshToken(refreshToken);
    const { access_token, refresh_token: new_refresh_token } = data;

    const res = NextResponse.json({ message: 'Token refreshed successfully' });

    res.cookies.set('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    });

    if (new_refresh_token) {
      res.cookies.set('refresh_token', new_refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/'
      });
    }

    return res;
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.detail || 'Failed to refresh token';

    const res = NextResponse.json({ message }, { status });
    res.cookies.delete('access_token');
    res.cookies.delete('refresh_token');

    return res;
  }
}