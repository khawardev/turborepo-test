import { NextRequest, NextResponse } from 'next/server';
const API_URL = process.env.API_URL;

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: 'Refresh token not found' }, { status: 401 });
  }

  try {
    const response = await fetch(`${API_URL}/refresh-token?refresh_token=${refreshToken}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${req.cookies.get('access_token')?.value}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: data.detail || 'Failed to refresh token' }, { status: response.status });
    }

    const { access_token, refresh_token: new_refresh_token } = data;

    const res = NextResponse.json({ message: 'Token refreshed' });
    res.cookies.set('access_token', access_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
    if (new_refresh_token) {
      res.cookies.set('refresh_token', new_refresh_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
    }

    return res;
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
