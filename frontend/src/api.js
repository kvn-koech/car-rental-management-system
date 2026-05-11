/**
 * Centralised API utility.
 * Reads VITE_API_URL from the environment so the base URL is only defined once.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getAuthHeaders(isFormData = false) {
  const token =
    localStorage.getItem('admin_token') || localStorage.getItem('token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';
  return headers;
}

export async function apiGet(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: getAuthHeaders(),
  });
  return res;
}

export async function apiPost(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  return res;
}

export async function apiPatch(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  return res;
}

export async function apiDelete(path) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res;
}

export async function apiFormPost(path, formData, method = 'POST') {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: getAuthHeaders(true), // no Content-Type so browser sets multipart boundary
    body: formData,
  });
  return res;
}

export async function apiFormPatch(path, formData) {
  return apiFormPost(path, formData, 'PATCH');
}
