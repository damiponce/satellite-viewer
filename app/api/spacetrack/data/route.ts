import { NextResponse } from 'next/server';
import { getCookie } from '@/lib/cookieStore';

export async function GET() {
  const dataUrl = `https://www.space-track.org/basicspacedata/query/class/gp_history/
NORAD_CAT_ID/25544/orderby/EPOCH desc/limit/22/format/json`;
  const cookie = getCookie('spacetrack-cookie');

  if (!cookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const dataResponse = await fetch(dataUrl, {
    method: 'GET',
    headers: {
      Cookie: cookie,
    },
  });

  if (!dataResponse.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 },
    );
  }

  const data = await dataResponse.json();
  return NextResponse.json(data);
}
