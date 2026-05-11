'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email: formData.email,
      password: formData.password,
      redirect: false,
    })

    if (result?.error) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="container flex justify-center items-center" style={{ minHeight: '80vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }} dir="rtl">
        <h2 style={{ textAlign: 'center' }}>تسجيل الدخول</h2>
        
        {registered && (
          <div style={{ color: 'var(--success)', marginBottom: '1rem', textAlign: 'center', background: '#e8f5e9', padding: '10px', borderRadius: '8px' }}>
            تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول.
          </div>
        )}

        {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="gap-20 flex flex-col">
            <div>
              <label>البريد الإلكتروني</label>
              <input
                type="email"
                className="input-field"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@mail.com"
              />
            </div>
            <div>
              <label>كلمة المرور</label>
              <input
                type="password"
                className="input-field"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="********"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
              {loading ? 'جاري الدخول...' : 'دخول'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <span>ليس لديك حساب؟ </span>
          <Link href="/register" style={{ color: 'var(--primary-green)', fontWeight: 'bold' }}>أنشئ حساباً جديداً</Link>
        </div>
      </div>
    </div>
  )
}
