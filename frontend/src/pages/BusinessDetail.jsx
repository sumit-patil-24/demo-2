import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { businessService, enquiryService } from '../services'
import { errorMessage } from '../services/api'
import { Notice } from '../components/States'
export default function BusinessDetail() {
  const { id } = useParams(); const [b, setB] = useState(null); const [err, setErr] = useState('')
  const [form, setForm] = useState({ name:'', email:'', message:'' }); const [errs, setErrs] = useState({}); const [status, setStatus] = useState('')
  useEffect(() => { setB(null); setErr(''); businessService.get(id).then(setB).catch(e=>setErr(errorMessage(e))) }, [id])
  const submit = async (e) => { e.preventDefault(); const v = {}
    if (!form.name.trim()) v.name='Enter your name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) v.email='Enter a valid email address.'
    if (form.message.trim().length < 10) v.message='Write at least 10 characters.'
    setErrs(v); if (Object.keys(v).length) return
    setStatus('sending'); try { await enquiryService.create({ ...form, businessId: id }); setStatus('sent'); setForm({name:'',email:'',message:''}) }
    catch (x) { setStatus(errorMessage(x)) } }
  if (err) return <div className="mx-auto max-w-3xl px-4 py-16"><Notice title="Business unavailable" text={err}/></div>
  if (!b) return <div className="mx-auto max-w-6xl animate-pulse px-4 py-10"><div className="h-64 rounded-xl bg-slate-200"/></div>
  const fld = (k, label, type='text') => <div><label htmlFor={k} className="text-sm font-medium">{label}</label>
    {k==='message' ? <textarea id={k} rows={4} className="input mt-1" value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} aria-invalid={!!errs[k]}/> :
    <input id={k} type={type} className="input mt-1" value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} aria-invalid={!!errs[k]}/>}
    {errs[k] && <p className="mt-1 text-xs text-red-600" role="alert">{errs[k]}</p>}</div>
  return (<div className="mx-auto max-w-6xl px-4 py-8">
    <img src={b.image} alt="" className="h-56 w-full rounded-xl object-cover sm:h-72"/>
    <div className="mt-6 grid gap-8 lg:grid-cols-3"><div className="lg:col-span-2">
      <p className="text-sm font-medium text-brand">{b.category}</p><h1 className="text-3xl font-extrabold">{b.name}</h1>
      <p className="mt-3 text-slate-600">{b.description}</p>
      <ul className="mt-4 space-y-1 text-sm text-slate-600"><li className="flex gap-2"><MapPin size={16}/>{b.location}</li><li className="flex gap-2"><Phone size={16}/>{b.phone}</li><li className="flex gap-2"><Mail size={16}/>{b.email}</li><li className="flex gap-2"><Clock size={16}/>{b.hours}</li></ul>
      <h2 className="mt-8 text-xl font-bold">Products and services</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">{b.products?.map(p=><div key={p.id} className="overflow-hidden rounded-xl border bg-white"><img src={p.image} alt={p.name} loading="lazy" className="h-28 w-full object-cover"/><div className="p-3"><p className="text-sm font-semibold">{p.name}</p><p className="text-sm text-brand">₹{p.price}</p></div></div>)}</div></div>
    <form onSubmit={submit} noValidate className="space-y-3 self-start rounded-xl border bg-white p-5 shadow-sm"><h2 className="font-bold">Send an enquiry</h2>
      {fld('name','Your name')}{fld('email','Email','email')}{fld('message','Message')}
      <button className="btn-primary w-full" disabled={status==='sending'}>{status==='sending'?'Sending…':'Send enquiry'}</button>
      {status==='sent' && <p role="status" className="text-sm text-green-700">Enquiry sent.</p>}
      {status && !['sent','sending'].includes(status) && <p role="alert" className="text-sm text-red-600">{status}</p>}</form></div></div>)
}
