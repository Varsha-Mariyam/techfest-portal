const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function api(path, options = {}) {
  const res = await fetch(BASE + path, {
    credentials: 'include', // send the httpOnly cookie
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}
