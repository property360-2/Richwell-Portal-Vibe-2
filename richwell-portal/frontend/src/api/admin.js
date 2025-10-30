export async function apiGet(path, token) {
  const res = await fetch(`/api${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `GET ${path} failed`);
  return data;
}

export const getAdminDashboard = (token) => apiGet(`/admin/dashboard`, token);
export const listPrograms = (token) => apiGet(`/admin/programs`, token);
export const getCurriculum = (token) => apiGet(`/admin/curriculum`, token);
export const getAdminAnalytics = (token) => apiGet(`/admin/analytics`, token);
export const listDepartments = (token) => apiGet(`/admin/departments`, token);
export const listSectors = (token) => apiGet(`/admin/sectors`, token);

export async function createProgram(token, payload) {
  const res = await fetch(`/api/admin/programs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Create program failed");
  return data;
}

export async function updateProgram(token, id, payload) {
  const res = await fetch(`/api/admin/programs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Update program failed");
  return data;
}

export async function deleteProgram(token, id) {
  const res = await fetch(`/api/admin/programs/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || "Delete program failed");
  }
  return { success: true };
}

// Curriculum CRUD
export async function createCurriculum(token, payload) {
  const res = await fetch(`/api/admin/curriculum`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Create curriculum failed");
  return data;
}

export async function updateCurriculum(token, id, payload) {
  const res = await fetch(`/api/admin/curriculum/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Update curriculum failed");
  return data;
}

export async function deleteCurriculum(token, id) {
  const res = await fetch(`/api/admin/curriculum/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || "Delete curriculum failed");
  }
  return { success: true };
}

export async function createDepartment(token, payload) {
  const res = await fetch(`/api/admin/departments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Create department failed");
  return data;
}

export async function createSector(token, payload) {
  const res = await fetch(`/api/admin/sectors`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Create sector failed");
  return data;
}
