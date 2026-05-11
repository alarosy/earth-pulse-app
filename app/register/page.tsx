'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [schools, setSchools] = useState<{id: string, name: string}[]>([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    schoolId: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/schools')
      .then(res => res.json())
      .then(data => setSchools(data))
      .catch(err => console.error('Failed to fetch schools', err))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        router.push('/login?registered=true')
      } else {
        const data = await res.json()
        setError(data.message || 'حدث خطأ ما أثناء التسجيل')
      }
    } catch (err) {
      setError('فشل الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex justify-center items-center" style={{ minHeight: '80vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px' }} dir="rtl">
        <h2 style={{ textAlign: 'center' }}>🌱 إنشاء حساب جديد</h2>
        <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-light)' }}>
          انضم لمبادرة الشتلة الرقمية ووثق رحلة نمو شتلتك
        </p>

        {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="gap-20 flex flex-col">
            <div>
              <label>الاسم الكامل</label>
              <input
                type="text"
                className="input-field"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="أدخل اسمك الكامل"
              />
            </div>
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
              <label>المدرسة</label>
              <select
                className="input-field"
                required
                value={formData.schoolId}
                onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
              >
                <option value="">اختر مدرستك</option>
                {schools.map(school => (
                  <option key={school.id} value={school.id}>{school.name}</option>
                ))}
              </select>
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
              {loading ? 'جاري التسجيل...' : 'تسجيل'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <span>لديك حساب بالفعل؟ </span>
          <Link href="/login" style={{ color: 'var(--primary-green)', fontWeight: 'bold' }}>سجل دخولك هنا</Link>
        </div>
      </div>
    </div>
  )
}
