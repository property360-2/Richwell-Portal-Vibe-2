export async function apiGet(path, token) {
  const res = await fetch(`/api${path}`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `GET ${path} failed`);
  return data;
}

export const getMySections = (token) => apiGet(`/professor/sections`, token);
export const getSectionRoster = (token, sectionId) => apiGet(`/professor/sections/${sectionId}/roster`, token);

export async function encodeGrade(token, { enrollmentSubjectId, gradeValue, remarks }) {
  const res = await fetch(`/api/professor/grades`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ enrollmentSubjectId, gradeValue, remarks }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Encode grade failed");
  return data;
}
