'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Dashboard() {
  const { data: session } = useSession()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [points, setPoints] = useState(0)

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/submissions/user/${session.user.id}`)
        .then(res => res.json())
        .then(data => {
          setSubmissions(data.submissions || [])
          setPoints(data.points || 0)
        })
    }
  }, [session])

  return (
    <div className="container" dir="rtl">
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <h1>لوحة تحكم الطالب</h1>
        <div className="card" style={{ padding: '1rem 2rem', background: 'var(--primary-green)', color: 'white' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>مجموع النقاط: {points}</span>
        </div>
      </div>

      <div className="flex justify-center" style={{ marginBottom: '3rem' }}>
        <Link href="/dashboard/upload" className="btn btn-primary" style={{ padding: '20px 40px', fontSize: '1.2rem' }}>
          📸 رفع صورة جديدة للشتلة
        </Link>
      </div>

      <h3>مشاركاتك السابقة</h3>
      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', marginTop: '1rem' }}>
        {submissions.length > 0 ? (
          submissions.map((sub) => (
            <div key={sub.id} className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #eee', borderRadius: '12px' }}>
              <div style={{ position: 'relative' }}>
                <img src={sub.imageUrl} alt="نبتة" style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
                <span style={{ 
                  position: 'absolute', 
                  top: '10px', 
                  left: '10px', 
                  padding: '5px 10px', 
                  borderRadius: '20px', 
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  background: sub.status === 'READ' ? '#4caf50' : '#ff9800',
                  color: 'white',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}>
                  {sub.status === 'READ' ? `مقيم: ${sub.adminScore}/10` : 'قيد المراجعة'}
                </span>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '1rem', borderBottom: '1px solid #f5f5f5', paddingBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary-dark)' }}>ملاحظتك:</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                    {new Date(sub.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>{sub.description}</p>
                
                {sub.adminComment && (
                  <div style={{ background: '#f0f9f0', padding: '1rem', borderRadius: '8px', borderRight: '4px solid var(--primary-green)' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-green)', marginBottom: '0.3rem' }}>تعليق الإدارة:</p>
                    <p style={{ fontSize: '0.9rem', color: '#333' }}>{sub.adminComment}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-light)' }}>لا يوجد مشاركات حتى الآن. ابدأ برفع أول صورة لشتلتك!</p>
        )}
      </div>
    </div>
  )
}
