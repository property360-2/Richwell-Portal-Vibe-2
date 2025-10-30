export async function apiGet(path, token) {
  const res = await fetch(`/api${path}`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `GET ${path} failed`);
  return data;
}

export const getStudentDashboard = (token) => apiGet(`/student/dashboard`, token);
export const getGrades = (token) => apiGet(`/student/grades`, token);

