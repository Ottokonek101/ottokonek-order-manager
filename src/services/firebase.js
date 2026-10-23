import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyDdRXko51jjbKPgb44JLVaGSUlRIWVaTnY',
  authDomain: 'ottokonek-order-manager-a7295.firebaseapp.com',
  projectId: 'ottokonek-order-manager-a7295',
  storageBucket: 'ottokonek-order-manager-a7295.firebasestorage.app',
  messagingSenderId: '407761536064',
  appId: '1:407761536064:web:77a3c00ae6488358294ba5'
}

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })
