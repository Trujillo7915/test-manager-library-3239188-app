/**
 * Cliente HTTP API centralizado — Manager Library (React)
 * Se comunica con el backend Laravel en http://localhost:8000/api/v1
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const getAuthToken = () => localStorage.getItem('ml_token');
export const setAuthToken = (token) => localStorage.setItem('ml_token', token);
export const removeAuthToken = () => {
  localStorage.removeItem('ml_token');
  localStorage.removeItem('ml_role');
  localStorage.removeItem('ml_user');
};
export const getAuthRole = () => localStorage.getItem('ml_role');
export const getAuthUser = () => localStorage.getItem('ml_user');

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Accept': 'application/json',
    ...(options.isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && !options.isFormData && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  const text = await res.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!res.ok) {
    if (res.status === 401 && !endpoint.includes('/auth/login')) {
      removeAuthToken();
      window.location.reload();
    }
    const err = new Error(data?.message || 'Error en la petición');
    err.status = res.status;
    err.code = data?.code || 'UNKNOWN_ERROR';
    err.details = data?.details || [];
    throw err;
  }

  return data;
}

// Métodos de acceso rápido
export const api = {
  // Auth
  login: (username, password) => apiRequest('/auth/login', { method: 'POST', body: { username, password } }),
  
  // Categorías
  getCategories: () => apiRequest('/categories'),

  // Libros
  getBooks: (params = '') => apiRequest(`/books${params}`),
  getBook: (id) => apiRequest(`/books/${id}`),
  createBook: (book) => apiRequest('/books', { method: 'POST', body: book }),
  updateBook: (id, book) => apiRequest(`/books/${id}`, { method: 'PUT', body: book }),
  deleteBook: (id) => apiRequest(`/books/${id}`, { method: 'DELETE' }),

  // Socios
  getMembers: (params = '') => apiRequest(`/members${params}`),
  getMember: (id) => apiRequest(`/members/${id}`),
  createMember: (member) => apiRequest('/members', { method: 'POST', body: member }),

  // Préstamos
  createLoan: (payload) => apiRequest('/loans', { method: 'POST', body: payload }),
  getLoans: (params = '') => apiRequest(`/loans${params}`),
  getLoan: (id) => apiRequest(`/loans/${id}`),
  returnItem: (loanId, itemId) => apiRequest(`/loans/${loanId}/items/${itemId}/return`, { method: 'POST' }),
  getOverdue: () => apiRequest('/loans/overdue'),

  // Reportes
  getMostBorrowed: (from, to) => apiRequest(`/reports/most-borrowed?from=${from}&to=${to}`),

  // Usuarios (admin)
  createLibrarian: (payload) => apiRequest('/users', { method: 'POST', body: payload }),
};
