'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="navbar">
      <div className="container flex justify-between items-center">
        <Link href="/" className="logo flex items-center gap-10" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.jpg" alt="شعار" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <span>منظمة نبض الأرض</span>
        </Link>
        <div className="nav-links flex gap-20 items-center">
          {session ? (
            <>
              <span>أهلاً، {session.user?.name}</span>
              <Link href={session.user?.role === 'ADMIN' ? '/admin' : '/dashboard'}>
                لوحة التحكم
              </Link>
              <button onClick={() => signOut()} className="btn btn-secondary">
                تسجيل الخروج
              </button>
            </>
          ) : (
            <>
              <Link href="/login">تسجيل الدخول</Link>
              <Link href="/register" className="btn btn-primary">
                حساب جديد
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
