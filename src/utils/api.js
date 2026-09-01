const rawBase = import.meta.env.VITE_API_BASE_URL || '/api'
const API_BASE = rawBase.replace(/\/+$/, '')

function getToken() {
  return localStorage.getItem('naj_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || 'Request failed')
  }

  return data
}

export const api = {
  signup: (data) =>
    request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

  login: (data) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  getMe: () => request('/auth/me'),

  verify: () => request('/auth/verify'),

  getQuotations: () => request('/quotations'),

  getQuotation: (id) => request(`/quotations/${id}`),

  createQuotation: (data) =>
    request('/quotations', { method: 'POST', body: JSON.stringify(data) }),

  updateQuotation: (id, data) =>
    request(`/quotations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteQuotation: (id) =>
    request(`/quotations/${id}`, { method: 'DELETE' }),

  savePdf: (id, pdfBase64, fileName) =>
    request(`/quotations/${id}/pdf`, {
      method: 'POST',
      body: JSON.stringify({ pdfBase64, fileName }),
    }),

  getPdfDownloadUrl: (id) => `${API_BASE}/quotations/${id}/pdf`,

  fetchPdfBlob: async (id) => {
    const token = getToken()
    const res = await fetch(`${API_BASE}/quotations/${id}/pdf`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}))
      throw new Error(errJson.error || 'Failed to fetch PDF')
    }
    return res.blob()
  },

  // Invoice APIs
  getInvoices: () => request('/invoices'),

  getInvoice: (id) => request(`/invoices/${id}`),

  createInvoice: (data) =>
    request('/invoices', { method: 'POST', body: JSON.stringify(data) }),

  updateInvoice: (id, data) =>
    request(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteInvoice: (id) =>
    request(`/invoices/${id}`, { method: 'DELETE' }),

  saveInvoicePdf: (id, pdfBase64, fileName) =>
    request(`/invoices/${id}/pdf`, {
      method: 'POST',
      body: JSON.stringify({ pdfBase64, fileName }),
    }),

  getInvoiceDownloadUrl: (id) => `${API_BASE}/invoices/${id}/pdf`,

  fetchInvoicePdfBlob: async (id) => {
    const token = getToken()
    const res = await fetch(`${API_BASE}/invoices/${id}/pdf`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}))
      throw new Error(errJson.error || 'Failed to fetch Invoice PDF')
    }
    return res.blob()
  },
}

export function setToken(token) {
  localStorage.setItem('naj_token', token)
}

export function clearToken() {
  localStorage.removeItem('naj_token')
}

export function isLoggedIn() {
  return !!getToken()
}
