const BASE_URL = "http://localhost:5000";

export const api = async <T>(
  endpoint: string,
  method: string = "GET",
  body?: unknown
): Promise<T> => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw new Error("API Error");
  }

  return res.json();
};