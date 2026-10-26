import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { authService } from '../services'
import { errorMessage } from '../services/api'
import { useAuth } from '../context/AuthContext'
export default function AuthPage({ mode }) {
  const reg = mode === 'register'; const nav = useNavigate(); const { signIn } = useAuth()
  const [f, setF] = useState({ name:'', email:'', password:'', role:'customer' }); const [show, setShow] = useState(false)
  const [errs, setErrs] = useState({}); const [busy, setBusy] = useState(false); const [apiErr, setApiErr] = useState('')
  const submit = async (e) => { e.preventDefault(); const v = {}
    if (reg && !f.name.trim()) v.name='Enter your name.'
    if (!/^\S+@\S+\.\S+$/.test(f.email)) v.email='Enter a valid email address.'
    if (f.password.length < 8) v.password='Use at least 8 characters.'
    setErrs(v); if (Object.keys(v).length) return
    setBusy(true); setApiErr('')
    try { signIn(await (reg ? authService.register(f) : authService.login(f))); nav('/') } catch (x) { setApiErr(errorMessage(x)) } finally { setBusy(false) } }
  const inp = (k,l,t='text') => <div><label htmlFor={k} className="text-sm font-medium">{l}</label>
    <input id={k} type={t} className="input mt-1" value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})} aria-invalid={!!errs[k]}/>
    {errs[k] && <p role="alert" className="mt-1 text-xs text-red-600">{errs[k]}</p>}</div>
  return (<div className="mx-auto max-w-md px-4 py-14"><form onSubmit={submit} noValidate className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
    <h1 className="text-2xl font-extrabold">{reg ? 'Create your account' : 'Welcome back'}</h1>
    {reg && inp('name','Full name')}{inp('email','Email','email')}
    <div className="relative">{inp('password','Password',show?'text':'password')}
      <button type="button" aria-label={show?'Hide password':'Show password'} className="absolute right-3 top-9" onClick={()=>setShow(!show)}>{show?<EyeOff size={16}/>:<Eye size={16}/>}</button></div>
    {reg && <fieldset><legend className="text-sm font-medium">I am a</legend><div className="mt-1 flex gap-4 text-sm">{[['customer','Customer'],['owner','Business Owner']].map(([v,l])=><label key={v} className="flex gap-2"><input type="radio" name="role" checked={f.role===v} onChange={()=>setF({...f,role:v})}/>{l}</label>)}</div></fieldset>}
    {apiErr && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{apiErr}</p>}
    <button className="btn-primary w-full" disabled={busy}>{busy?'Please wait…':reg?'Create account':'Log in'}</button>
    <p className="text-center text-sm text-slate-600">{reg?'Already registered?':'New here?'} <Link className="font-semibold text-brand" to={reg?'/login':'/register'}>{reg?'Log in':'Create an account'}</Link></p></form></div>)
}
