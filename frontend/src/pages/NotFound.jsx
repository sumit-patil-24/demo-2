import { Link } from 'react-router-dom'
export default function NotFound() { return <div className="mx-auto max-w-md px-4 py-24 text-center"><h1 className="text-3xl font-extrabold">Page not found</h1><p className="mt-2 text-slate-600">That address doesn't exist.</p><Link to="/" className="btn-primary mt-6">Back to home</Link></div> }
