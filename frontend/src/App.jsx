import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || '/api'

export default function App() {
  const [businesses, setBusinesses] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState('Loading businesses…')
  const [apiHealth, setApiHealth] = useState('checking')

  async function loadBusinesses() {
    setStatus('Loading businesses…')
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    if (location) params.set('location', location)
    try {
      const [healthResponse, businessResponse] = await Promise.all([
        fetch(`${API}/health`),
        fetch(`${API}/businesses?${params.toString()}`)
      ])
      setApiHealth(healthResponse.ok ? 'online' : 'unavailable')
      if (!businessResponse.ok) throw new Error('API returned an error')
      const data = await businessResponse.json()
      setBusinesses(data)
      setStatus(data.length ? '' : 'No approved businesses yet. Register a business and ask an admin to approve it.')
    } catch {
      setApiHealth('unavailable')
      setStatus('Cannot reach the API. Check that the backend and database are running.')
      setBusinesses([])
    }
  }

  useEffect(() => { loadBusinesses() }, [])

  return <div className="page">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-mark">L</span> LocalBizHub</a>
      <span className={`health ${apiHealth}`}><span /> API {apiHealth}</span>
    </header>
    <main>
      <section className="hero">
        <p className="eyebrow">YOUR NEIGHBOURHOOD, DISCOVERED</p>
        <h1>Find great local<br /><em>businesses.</em></h1>
        <p className="intro">Discover independent shops, services, and people doing great work near you.</p>
        <form className="search-panel" onSubmit={e => { e.preventDefault(); loadBusinesses() }}>
          <label>Business or keyword<input value={search} onChange={e => setSearch(e.target.value)} placeholder="e.g. bakery, repairs" /></label>
          <label>Category<input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Food, Services" /></label>
          <label>Location<input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Pune" /></label>
          <button type="submit">Search businesses ↗</button>
        </form>
      </section>
      <section className="results">
        <div className="section-heading"><div><p className="eyebrow">THE LOCAL DIRECTORY</p><h2>Explore businesses</h2></div><span className="count">{businesses.length} listed</span></div>
        {status && <p className="notice">{status}</p>}
        <div className="cards">
          {businesses.map(b => <article className="business-card" key={b.id}>
            <div className="card-art">{(b.category || 'Local').slice(0, 1).toUpperCase()}</div>
            <div className="card-content"><span className="category">{b.category}</span><h3>{b.name}</h3><p>{b.description || 'A local business ready to serve the community.'}</p><span className="location">⌖ {b.location}</span></div>
          </article>)}
        </div>
      </section>
      <section className="owner-cta"><div><p className="eyebrow">OWN A LOCAL BUSINESS?</p><h2>Put your business on the map.</h2><p>Profiles can be created through the API today. The owner dashboard is the next frontend milestone.</p></div><a href={`${API.replace(/\/$/, '')}/docs`} target="_blank" rel="noreferrer">Open API docs ↗</a></section>
    </main>
    <footer><span>LocalBizHub</span><span>Built for local communities · DevOps assignment project</span></footer>
  </div>
}
