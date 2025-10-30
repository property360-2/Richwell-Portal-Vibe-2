export async function apiRequest(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

export function getRecommendations({ studentId, programId, yearLevel, semester, token }) {
  const params = new URLSearchParams();
  if (programId) params.set("programId", String(programId));
  if (yearLevel) params.set("yearLevel", String(yearLevel));
  if (semester) params.set("semester", String(semester));
  const sid = studentId ? `/${studentId}` : "";
  return apiRequest(`/enrollment/recommend${sid}?${params.toString()}`, { token });
}

export function postEnrollNew({ payload, token }) {
  return apiRequest(`/enrollment/new`, { method: "POST", body: payload, token });
}

export function postEnrollOld({ payload, token }) {
  return apiRequest(`/enrollment/old`, { method: "POST", body: payload, token });
}

export function postEnrollTransferee({ payload, token }) {
  return apiRequest(`/enrollment/transferee`, { method: "POST", body: payload, token });
}

export function postGenerateCOR({ enrollmentId, token }) {
  return apiRequest(`/enrollment/cor`, { method: "POST", body: { enrollmentId }, token });
}

export function postExitValidate({ password, token }) {
  return apiRequest(`/enrollment/exit-validate`, { method: "POST", body: { password }, token });
}
