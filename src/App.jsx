import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Settings from './pages/Settings'
import AuthGate from './components/AuthGate'
import './App.css'

export default function App() {
  const [page, setPage] = useState('Dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return <AuthGate><div className="app-shell">
    <Sidebar page={page} setPage={setPage} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(value => !value)} />
    <div className="main-area">
      <Header page={page} />
      <main className="content">{page === 'Dashboard' ? <Dashboard setPage={setPage} /> : page === 'Orders' ? <Orders /> : <Settings />}</main>
    </div>
  </div></AuthGate>
}
