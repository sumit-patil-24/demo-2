import { Link } from 'react-router-dom'
import { MapPin, Star } from 'lucide-react'
export default function BusinessCard({ b }) {
  return (<article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
    <img src={b.image} alt={`${b.name}`} loading="lazy" className="h-40 w-full object-cover"/>
    <div className="p-4"><div className="flex items-start justify-between gap-2"><h3 className="font-bold">{b.name}</h3>
      <span className="flex items-center gap-1 text-sm"><Star size={14} className="fill-amber-400 text-amber-400"/>{b.rating}</span></div>
      <p className="mt-1 text-xs font-medium text-brand">{b.category}</p>
      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin size={12}/>{b.location}</p>
      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{b.description}</p>
      <Link to={`/business/${b.id}`} className="btn-ghost mt-4 w-full">View Business</Link></div></article>)
}
