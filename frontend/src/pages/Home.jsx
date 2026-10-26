import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { businessService, categoryService } from '../services'
import { errorMessage } from '../services/api'
import BusinessCard from '../components/BusinessCard'
import { Skeletons, Notice } from '../components/States'
export default function Home() {
  const [q, setQ] = useState(''); const [cats, setCats] = useState([]); const [items, setItems] = useState(null); const [err, setErr] = useState('')
  const nav = useNavigate()
  useEffect(() => { categoryService.list().then(setCats).catch(()=>{}); businessService.list({ sort:'rating', pageSize:3 }).then(r=>setItems(r.items)).catch(e=>setErr(errorMessage(e))) }, [])
  return (<>
    <section className="bg-white"><div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
      <h1 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">Discover local businesses. Support your community.</h1>
      <p className="mt-4 max-w-xl text-slate-600">Find cafés, makers, tutors and trades within your own neighbourhood.</p>
      <form role="search" className="mt-8 flex max-w-2xl gap-2" onSubmit={(e)=>{e.preventDefault();nav(`/explore?q=${encodeURIComponent(q)}`)}}>
        <label htmlFor="s" className="sr-only">Search businesses, products or locations</label>
        <input id="s" className="input" placeholder="Search businesses, products or locations" value={q} onChange={e=>setQ(e.target.value)}/>
        <button className="btn-primary"><Search size={16}/>Search</button></form></div></section>
    <section className="mx-auto max-w-6xl px-4 py-12"><h2 className="text-xl font-bold">Popular categories</h2>
      <div className="mt-4 flex flex-wrap gap-2">{cats.map(c=><Link key={c} to={`/explore?category=${encodeURIComponent(c)}`} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:border-brand hover:text-brand">{c}</Link>)}</div></section>
    <section className="mx-auto max-w-6xl px-4 pb-16"><h2 className="mb-4 text-xl font-bold">Featured businesses</h2>
      {err ? <Notice title="Couldn't load businesses" text={err}/> : !items ? <Skeletons n={3}/> :
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map(b=><BusinessCard key={b.id} b={b}/>)}</div>}</section>
    <section className="bg-brand-soft"><div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-12 sm:flex-row sm:items-center">
      <div><h2 className="text-2xl font-bold">Run a local business?</h2><p className="text-slate-600">Create a profile, list your products and receive enquiries.</p></div>
      <Link to="/register" className="btn-primary">List your business</Link></div></section></>)
}
