export async function getStudentById(token, studentId) {
  const res = await fetch(`/api/students/${encodeURIComponent(studentId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Fetch student failed");
  return data;
}

