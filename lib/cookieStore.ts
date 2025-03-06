const cookieStore = new Map<string, string>();

export function setCookie(key: string, value: string) {
  cookieStore.set(key, value);
}

export function getCookie(key: string): string | undefined {
  return cookieStore.get(key);
}

export function deleteCookie(key: string) {
  cookieStore.delete(key);
}
