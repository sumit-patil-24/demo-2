import { Routes, Route } from 'react-router-dom'
import Shell from './components/Shell'
import Home from './pages/Home'
import Explore from './pages/Explore'
import BusinessDetail from './pages/BusinessDetail'
import AuthPage from './pages/AuthPage'
import NotFound from './pages/NotFound'
// Dashboards (not built yet) should be wrapped in <Guard roles={[...]}> from ./routes/Guard
export default function App() {
  return (<Routes><Route element={<Shell/>}>
    <Route path="/" element={<Home/>}/><Route path="/explore" element={<Explore/>}/>
    <Route path="/business/:id" element={<BusinessDetail/>}/>
    <Route path="/login" element={<AuthPage mode="login"/>}/><Route path="/register" element={<AuthPage mode="register"/>}/>
    <Route path="*" element={<NotFound/>}/></Route></Routes>)
}
