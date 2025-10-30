export async function apiGet(path, token) {
  const res = await fetch(`/api${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `GET ${path} failed`);
  return data;
}

export const getAdmissionDashboard = (token) => apiGet(`/admission/dashboard`, token);
export const listApplicants = (token) => apiGet(`/admission/applicants`, token);

