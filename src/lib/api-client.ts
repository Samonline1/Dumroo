export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const userId = typeof window !== "undefined" ? localStorage.getItem("demo_user_id") : null;

  const headers = new Headers(options.headers || {});
  if (userId) {
    headers.set("x-demo-user-id", userId);
  }
  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
