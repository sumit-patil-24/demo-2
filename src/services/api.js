import axios from 'axios'
export const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'
export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api', timeout: 10000 })
api.interceptors.request.use((c) => { const t = localStorage.getItem('lbh_token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c })
// Readable errors; failures are never turned into fake successes.
export function errorMessage(e) {
  if (e.response) return e.response.data?.message || `The server returned an error (${e.response.status}).`
  if (e.request) return 'Cannot reach the server. Check that the API is running, or switch on demo mode.'
  return e.message
}
