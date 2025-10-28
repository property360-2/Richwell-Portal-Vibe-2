const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

async function request(path, { token, ...options } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export function login(credentials) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
}

export function logout(token) {
  return request('/auth/logout', {
    method: 'POST',
    token
  });
}

export function fetchProfile(token) {
  return request('/auth/me', {
    method: 'GET',
    token
  });
}

export function requestPasswordReset(email) {
  return request('/auth/request-reset', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

export function resetPassword(payload) {
  return request('/auth/reset', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
