import { API_BASE } from "../constants";

export async function apiRequest(path, options = {}) {
  const { method = "GET", body } = options;
  const headers = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "include",
    });
  } catch (error) {
    throw new Error(
      "Cannot reach the backend. Start the backend server and make sure MongoDB is running."
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(typeof payload === "string" ? payload : payload.error || "Request failed");
  }

  return payload;
}
