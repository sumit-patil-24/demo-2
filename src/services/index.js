import { api, DEMO } from './api'
import { ENDPOINTS as E } from './endpoints'
import { businesses, products, categories } from '../data/demo'
const wait = (v) => new Promise((r) => setTimeout(() => r(v), 400))
export const businessService = {
  async list({ q = '', category = '', location = '', sort = 'newest', page = 1, pageSize = 6 } = {}) {
    if (DEMO) {
      let r = businesses.filter((b) => (!q || `${b.name} ${b.description} ${b.category}`.toLowerCase().includes(q.toLowerCase()))
        && (!category || b.category === category) && (!location || b.location === location))
      if (sort === 'name') r = [...r].sort((a, b) => a.name.localeCompare(b.name))
      if (sort === 'rating') r = [...r].sort((a, b) => b.rating - a.rating)
      return wait({ items: r.slice((page - 1) * pageSize, page * pageSize), total: r.length })
    }
    return (await api.get(E.businesses, { params: { q, category, location, sort, page, pageSize } })).data
  },
  async get(id) {
    if (DEMO) { const b = businesses.find((x) => x.id === id); if (!b) throw new Error('Business not found.')
      return wait({ ...b, products: products.filter((p) => p.businessId === id) }) }
    return (await api.get(E.business(id))).data
  },
}
export const categoryService = { async list() { return DEMO ? wait(categories) : (await api.get(E.categories)).data } }
export const enquiryService = { async create(p) { if (DEMO) return wait({ ok: true }); return (await api.post(E.enquiries, p)).data } }
export const authService = {
  async login(b) { if (DEMO) return wait({ token: 'demo', user: { name: 'Demo User', email: b.email, role: 'customer' } }); return (await api.post(E.login, b)).data },
  async register(b) { if (DEMO) return wait({ token: 'demo', user: { name: b.name, email: b.email, role: b.role } }); return (await api.post(E.register, b)).data },
}
