import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Menu, X, Store } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { DEMO } from '../services/api'
export default function Shell() {
  const [open, setOpen] = useState(false); const { user, signOut } = useAuth(); const nav = useNavigate()
  const links = [['/explore','Explore Businesses'],['/explore#categories','Categories']]
  return (<div className="flex min-h-screen flex-col">
    {DEMO && <div className="bg-navy px-4 py-1.5 text-center text-xs text-white">Demo mode: all businesses and products are sample data.</div>}
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3" aria-label="Main">
        <Link to="/" className="flex items-center gap-2 text-lg font-extrabold"><Store className="text-brand" size={22}/>LocalBizHub</Link>
        <div className="hidden items-center gap-6 text-sm font-medium md:flex">
          {links.map(([to,l])=><NavLink key={l} to={to} className="hover:text-brand">{l}</NavLink>)}
          {user ? <><span className="text-slate-500">{user.name}</span><button className="btn-ghost" onClick={()=>{signOut();nav('/')}}>Log out</button></>
            : <><Link to="/login" className="hover:text-brand">Login</Link><Link to="/register" className="btn-primary">Register</Link></>}
        </div>
        <button className="md:hidden" aria-label="Toggle menu" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
      </nav>
      {open && <div className="flex flex-col gap-3 border-t px-4 py-4 text-sm font-medium md:hidden" onClick={()=>setOpen(false)}>
        {links.map(([to,l])=><Link key={l} to={to}>{l}</Link>)}
        {user ? <button className="text-left" onClick={signOut}>Log out</button> : <><Link to="/login">Login</Link><Link to="/register">Register</Link></>}
      </div>}
    </header>
    <main className="flex-1"><Outlet/></main>
    <footer className="bg-navy text-slate-300"><div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm sm:grid-cols-3">
      <div><p className="font-bold text-white">LocalBizHub</p><p className="mt-2">A marketplace for neighbourhood businesses.</p></div>
      <div><p className="font-bold text-white">Browse</p><Link className="mt-2 block hover:text-white" to="/explore">Explore businesses</Link><Link className="block hover:text-white" to="/register">List your business</Link></div>
      <div><p className="font-bold text-white">Contact</p><p className="mt-2">support@localbizhub.example (sample)</p></div>
    </div></footer></div>)
}
