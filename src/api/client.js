const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export async function apiFetch(path, { token, body, method = "GET" } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.message || data.error || "Request failed";
    const details = Array.isArray(data.details) ? data.details : [];
    throw new Error(details.length > 0 ? `${message}: ${details.join(", ")}` : message);
  }

  return data;
}

export { API_BASE_URL };
