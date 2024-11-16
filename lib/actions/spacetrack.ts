'use server';
import { isCookieExpired } from '../utils';

const LOGIN_URL = 'https://www.space-track.org/ajaxauth/login';

async function loginToSpaceTrack(): Promise<string | undefined> {
  const credentials = new URLSearchParams({
    identity: process.env.SPACE_TRACK_IDENTITY!,
    password: process.env.SPACE_TRACK_PASSWORD!,
  });

  const loginResponse = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: credentials.toString(),
  });

  if (!loginResponse.ok) return undefined;

  const cookie = loginResponse.headers.get('set-cookie');
  if (cookie) {
    process.env.SPACE_TRACK_COOKIE = cookie;
    return cookie;
  }

  return undefined;
}

export async function fetchDataWithLogin(dataUrl: string) {
  let cookie = process.env.SPACE_TRACK_COOKIE;
  console.log('AAAAA', cookie);

  if (!cookie || isCookieExpired(cookie)) {
    console.log('BBBBB', cookie);
    cookie = await loginToSpaceTrack();
    if (!cookie) {
      throw new Error('Failed to login to Space Track');
    }
  }

  console.log('CCCCC', cookie);
  const dataResponse = await fetch(dataUrl, {
    method: 'GET',
    headers: {
      Cookie: cookie,
    },
    cache: 'no-store',
  });

  console.log('DDDDD', dataResponse.json());

  if (!dataResponse.ok) {
    throw new Error('Failed to fetch data from Space Track');
  }

  return dataResponse.json();
}
