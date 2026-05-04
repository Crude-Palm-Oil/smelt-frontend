export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_SCAN_URL || "http://localhost:8000";

export const apiFetch = (path: string, options?: RequestInit) => {
  return fetch(`${API_BASE_URL}${path}`, options);
};