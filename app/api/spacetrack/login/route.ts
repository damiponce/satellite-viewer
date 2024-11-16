import { setCookie } from '@/lib/cookieStore';
import { NextResponse } from 'next/server';

export async function POST() {
  const loginUrl = 'https://www.space-track.org/ajaxauth/login';
  const credentials = new URLSearchParams({
    identity: process.env.SPACE_TRACK_IDENTITY!,
    password: process.env.SPACE_TRACK_PASSWORD!,
  });

  const loginResponse = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: credentials.toString(),
  });

  if (!loginResponse.ok) {
    return NextResponse.json({ error: 'Login failed' }, { status: 401 });
  }

  const cookie = loginResponse.headers.get('set-cookie');
  if (cookie) {
    setCookie('spacetrack-cookie', cookie); // Store cookie securely in memory
  }

  return NextResponse.json({ message: 'Logged in successfully' });
}
