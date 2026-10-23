import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { LogIn, LogOut, ShieldCheck, LoaderCircle } from 'lucide-react'
import { auth, googleProvider } from '../services/firebase'
import './AuthGate.css'

export default function AuthGate({ children }) {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => onAuthStateChanged(auth, current => {
    setUser(current)
    setChecking(false)
  }, err => {
    setError(err.message)
    setChecking(false)
  }), [])

  async function login() {
    setBusy(true)
    setError('')
    try { await signInWithPopup(auth, googleProvider) }
    catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') setError(err.message || 'Google Sign-In failed.')
    } finally { setBusy(false) }
  }

  async function logout() {
    setError('')
    try { await signOut(auth) }
    catch (err) { setError(err.message || 'Sign-out failed.') }
  }

  if (checking) return <div className="auth-page"><div className="auth-card"><LoaderCircle className="auth-spin" size={28}/><p>Checking your Google session…</p></div></div>

  if (!user) return <div className="auth-page"><div className="auth-card">
    <div className="auth-logo">▣</div>
    <div className="auth-eyebrow">CARD INDOGROSIR</div>
    <h1>Ottokonek<span>.</span></h1>
    <p className="auth-subtitle">Order Manager</p>
    <div className="auth-rule"/>
    <ShieldCheck size={27} className="auth-shield"/>
    <h2>Welcome back</h2>
    <p>Sign in with Google to open your order management workspace.</p>
    <button className="auth-button" onClick={login} disabled={busy} type="button"><LogIn size={18}/>{busy ? 'Signing in…' : 'Continue with Google'}</button>
    {error && <div className="auth-error" role="alert">{error}</div>}
    <small>Order data access will require separate backend authorization.</small>
  </div></div>

  return <>
    <div className="auth-session" aria-label="Signed-in account"><span className="auth-session-label">{user.email}</span><button type="button" onClick={logout} title="Sign out of Google"><LogOut size={15}/> Sign out</button></div>
    {children}
  </>
}
