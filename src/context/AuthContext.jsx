import { createContext, useContext, useState } from 'react'
const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('lbh_user')) } catch { return null } })
  const signIn = ({ token, user }) => { localStorage.setItem('lbh_token', token); localStorage.setItem('lbh_user', JSON.stringify(user)); setUser(user) }
  const signOut = () => { localStorage.removeItem('lbh_token'); localStorage.removeItem('lbh_user'); setUser(null) }
  return <Ctx.Provider value={{ user, signIn, signOut }}>{children}</Ctx.Provider>
}
