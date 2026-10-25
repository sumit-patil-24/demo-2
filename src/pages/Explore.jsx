import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { businessService, categoryService } from '../services'
import { errorMessage } from '../services/api'
import { locations } from '../data/demo'
import BusinessCard from '../components/BusinessCard'
import { Skeletons, Notice } from '../components/States'
export default function Explore() {
  const [sp, setSp] = useSearchParams(); const [cats, setCats] = useState([])
  const [data, setData] = useState(null); const [err, setErr] = useState(''); const [page, setPage] = useState(1)
  const f = { q: sp.get('q')||'', category: sp.get('category')||'', location: sp.get('location')||'', sort: sp.get('sort')||'newest' }
  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n); setPage(1) }
  useEffect(() => { categoryService.list().then(setCats).catch(()=>{}) }, [])
  useEffect(() => { setData(null); setErr('')
    businessService.list({ ...f, page }).then(setData).catch(e=>setErr(errorMessage(e))) }, [sp, page])
  return (<div className="mx-auto max-w-6xl px-4 py-10"><h1 className="text-3xl font-extrabold">Explore businesses</h1>
    <div id="categories" className="mt-6 grid gap-3 sm:grid-cols-4">
      <input aria-label="Search" className="input" placeholder="Name or keyword" value={f.q} onChange={e=>set('q',e.target.value)}/>
      <select aria-label="Category" className="input" value={f.category} onChange={e=>set('category',e.target.value)}><option value="">All categories</option>{cats.map(c=><option key={c}>{c}</option>)}</select>
      <select aria-label="Location" className="input" value={f.location} onChange={e=>set('location',e.target.value)}><option value="">All locations</option>{locations.map(c=><option key={c}>{c}</option>)}</select>
      <select aria-label="Sort" className="input" value={f.sort} onChange={e=>set('sort',e.target.value)}><option value="newest">Newest</option><option value="rating">Top rated</option><option value="name">Name A–Z</option></select></div>
    <div className="mt-8">{err ? <Notice title="Couldn't load businesses" text={err}/> : !data ? <Skeletons/> :
      data.items.length === 0 ? <Notice title="No businesses match" text="Try a different keyword or clear the filters." action={<button className="btn-ghost mt-4" onClick={()=>setSp({})}>Clear filters</button>}/> :
      <><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.items.map(b=><BusinessCard key={b.id} b={b}/>)}</div>
        <div className="mt-8 flex items-center justify-center gap-3 text-sm">
          <button className="btn-ghost" disabled={page===1} onClick={()=>setPage(page-1)}>Previous</button>
          <span>Page {page} of {Math.max(1,Math.ceil(data.total/6))}</span>
          <button className="btn-ghost" disabled={page*6>=data.total} onClick={()=>setPage(page+1)}>Next</button></div></>}</div></div>)
}
