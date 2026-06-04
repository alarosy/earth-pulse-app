'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [students, setStudents] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('submissions')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/data')
      .then(res => res.json())
      .then(data => {
        setStudents(data.students || [])
        setSubmissions(data.unreadSubmissions || [])
        setLoading(false)
      })
      .catch(() => {
        setError('فشل في تحميل البيانات')
        setLoading(false)
      })
  }, [])

  return (
    <div className="container" dir="rtl">
      <h1>لوحة تحكم المشرف</h1>

      {loading && <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>جاري تحميل البيانات...</p>}
      {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', textAlign: 'center', background: '#ffebee', padding: '10px', borderRadius: '8px' }}>{error}</div>}

      {!loading && !error && (<>

      <div className="flex gap-20" style={{ marginBottom: '2rem', borderBottom: '1px solid #ddd' }}>
        <button 
          className={`btn ${activeTab === 'submissions' ? 'btn-primary' : ''}`} 
          onClick={() => setActiveTab('submissions')}
          style={{ borderRadius: '12px 12px 0 0' }}
        >
          مشاركات غير مقروءة ({submissions.length})
        </button>
        <button 
          className={`btn ${activeTab === 'students' ? 'btn-primary' : ''}`} 
          onClick={() => setActiveTab('students')}
          style={{ borderRadius: '12px 12px 0 0' }}
        >
          إدارة الطلاب ({students.length})
        </button>
        <button 
          className={`btn ${activeTab === 'schools' ? 'btn-primary' : ''}`} 
          onClick={() => setActiveTab('schools')}
          style={{ borderRadius: '12px 12px 0 0' }}
        >
          إدارة المدارس
        </button>
        <button 
          className={`btn ${activeTab === 'activities' ? 'btn-primary' : ''}`} 
          onClick={() => setActiveTab('activities')}
          style={{ borderRadius: '12px 12px 0 0' }}
        >
          إدارة النشاطات
        </button>
      </div>

      {activeTab === 'submissions' && (
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {submissions.length > 0 ? (
            submissions.map(sub => (
              <div key={sub.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <img src={sub.imageUrl} alt="شتلة" style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
                <div style={{ padding: '1.5rem' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                    <span style={{ fontWeight: 'bold' }}>{sub.user.name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{sub.user.school.name}</span>
                  </div>
                  <p style={{ marginBottom: '1rem' }}>{sub.description}</p>
                  <ReviewForm submissionId={sub.id} />
                </div>
              </div>
            ))
          ) : (
            <p>لا يوجد مشاركات جديدة بانتظار المراجعة.</p>
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '1rem', textAlign: 'right' }}>الاسم</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>المدرسة</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>النقاط</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem' }}>{student.name}</td>
                  <td style={{ padding: '1rem' }}>{student.school.name}</td>
                  <td style={{ padding: '1rem' }}>{student.totalPoints}</td>
                  <td style={{ padding: '1rem' }}>
                    <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => {
                      const newPoints = prompt('تعديل نقاط الطالب:', student.totalPoints)
                      if (newPoints !== null && !isNaN(parseInt(newPoints))) {
                         // Placeholder for actually sending it to an API.
                         alert('سيتم إضافة مسار التعديل قريباً (حالياً للعرض).')
                      }
                    }}>تعديل</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'schools' && <SchoolManagement />}
      {activeTab === 'activities' && <ActivityManagement />}
      </>)} 
    </div>
  )
}

function ReviewForm({ submissionId }: { submissionId: string }) {
  const [score, setScore] = useState(5)
  const [adminComment, setAdminComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleReview = async () => {
    if (score < 1 || score > 10) {
      setError('التقييم يجب أن يكون بين 1 و 10')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, score, adminComment }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.message || 'فشل في حفظ التقييم')
        setLoading(false)
        return
      }
      window.location.reload()
    } catch {
      setError('فشل الاتصال بالخادم')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-10">
      {error && <div style={{ color: 'var(--error)', fontSize: '0.9rem' }}>{error}</div>}
      <textarea 
        placeholder="اكتب تعليقاً للطالب (اختياري)..." 
        className="input-field" 
        value={adminComment}
        onChange={(e) => setAdminComment(e.target.value)}
        rows={2}
      ></textarea>
      <div className="flex items-center gap-10">
        <label>التقييم:</label>
        <input 
          type="number" 
          min="1" 
          max="10" 
          value={score} 
          onChange={(e) => setScore(parseInt(e.target.value))}
          className="input-field"
          style={{ width: '70px', marginBottom: '0' }}
        />
        <button className="btn btn-primary" onClick={handleReview} disabled={loading}>
          {loading ? '...' : 'تأكيد التقييم'}
        </button>
      </div>
    </div>
  )
}

function SchoolManagement() {
  const [schools, setSchools] = useState<any[]>([])
  const [newSchool, setNewSchool] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchSchools = () => {
    fetch('/api/schools')
      .then(res => res.json())
      .then(data => setSchools(data))
      .catch(() => setError('فشل في تحميل المدارس'))
  }

  useEffect(() => {
    fetchSchools()
  }, [])

  const addSchool = async () => {
    if (!newSchool) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSchool }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.message || 'فشل في إضافة المدرسة')
        setLoading(false)
        return
      }
      setNewSchool('')
      fetchSchools()
    } catch {
      setError('فشل الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h3>إضافة مدرسة جديدة</h3>
      {error && <div style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</div>}
      <div className="flex gap-10" style={{ marginTop: '1rem', marginBottom: '2rem' }}>
        <input 
          type="text" 
          value={newSchool} 
          onChange={(e) => setNewSchool(e.target.value)} 
          className="input-field" 
          style={{ marginBottom: 0 }}
          placeholder="اسم المدرسة"
        />
        <button className="btn btn-primary" onClick={addSchool} disabled={loading}>{loading ? 'جاري الإضافة...' : 'إضافة'}</button>
      </div>

      <h3>المدارس الحالية</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {schools.map(school => (
          <li key={school.id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
            {school.name}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ActivityManagement() {
  const [activities, setActivities] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchActivities = () => {
    fetch('/api/activities')
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(() => setError('فشل في تحميل النشاطات'))
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description) return

    setLoading(true)
    setError('')
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    if (file) formData.append('file', file)

    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.message || 'فشل في إضافة النشاط')
        setLoading(false)
        return
      }
      setTitle('')
      setDescription('')
      setFile(null)
      fetchActivities()
    } catch {
      setError('فشل الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteActivity = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    try {
      const res = await fetch('/api/activities', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.message || 'فشل في حذف النشاط')
        return
      }
      fetchActivities()
    } catch {
      setError('فشل الاتصال بالخادم')
    }
  }

  return (
    <div className="card">
      <h3>إضافة نشاط جديد</h3>
      {error && <div style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</div>}
      <form onSubmit={handleAddActivity} style={{ marginTop: '1rem', marginBottom: '2rem' }}>
        <div className="flex flex-col gap-10">
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="input-field" 
            placeholder="عنوان النشاط"
            required
          />
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            className="input-field" 
            placeholder="وصف النشاط"
            rows={3}
            required
          />
          <input 
            type="file" 
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} 
            className="input-field"
            accept="image/*"
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'جاري الإضافة...' : 'إضافة نشاط'}
          </button>
        </div>
      </form>

      <h3>النشاطات الحالية (آخر 3 نشاطات تظهر بالرئيسية)</h3>
      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        {activities.map(activity => (
          <div key={activity.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {activity.imageUrl && (
              <img src={activity.imageUrl} alt={activity.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
            )}
            <div style={{ padding: '10px', flex: 1 }}>
              <h4 style={{ marginBottom: '5px' }}>{activity.title}</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>{activity.description}</p>
            </div>
            <button onClick={() => handleDeleteActivity(activity.id)} className="btn btn-secondary" style={{ margin: '10px', background: '#fee', color: 'red', border: 'none' }}>
              حذف النشاط
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
