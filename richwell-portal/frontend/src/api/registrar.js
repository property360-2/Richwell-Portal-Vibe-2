export async function apiGet(path, token) {
  const res = await fetch(`/api${path}`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `GET ${path} failed`);
  return data;
}

export async function apiPut(path, token, body) {
  const res = await fetch(`/api${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `PUT ${path} failed`);
  return data;
}

export const getEnrollmentSummary = (token) => apiGet(`/registrar/enrollment-summary`, token);
export const approveGrade = (token, gradeId) => apiPut(`/registrar/approve-grade`, token, { gradeId });
export const listPendingGrades = (token) => apiGet(`/registrar/pending-grades`, token);
