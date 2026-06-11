import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000, // 2 min for AI generation
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('token')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  signup: (data: { username: string; email: string; password: string }) =>
    api.post('/api/auth/signup', data),

  login: (email: string, password: string) => {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)
    return api.post('/api/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },

  me: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
}

// ─── Scripts ───────────────────────────────────────────────────────────────
export interface ScriptRequest {
  title: string
  user_request: string
  os_type: string
  stack: string
  output_type: string
  security_mode: boolean
  minimal_install: boolean
  full_dev_setup: boolean
}

export const scriptsAPI = {
  generate: (data: ScriptRequest) => api.post('/api/generate-script', data),
  analyze:  (user_request: string) => api.post('/api/analyze-request', { user_request }),
  validate: (script_content: string) => api.post('/api/validate-script', { script_content }),
  download: (id: number) => api.get(`/api/download-script/${id}`),
}

// ─── History ───────────────────────────────────────────────────────────────
export const historyAPI = {
  list:   (page = 1, limit = 10) => api.get(`/api/history?page=${page}&limit=${limit}`),
  detail: (id: number) => api.get(`/api/history/${id}`),
  delete: (id: number) => api.delete(`/api/history/${id}`),
}

// ─── Admin ─────────────────────────────────────────────────────────────────
export const adminAPI = {
  stats:   () => api.get('/api/admin/stats'),
  users:   () => api.get('/api/admin/users'),
  scripts: () => api.get('/api/admin/scripts'),
}
