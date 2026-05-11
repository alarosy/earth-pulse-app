'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('description', description)

    try {
      const res = await fetch('/api/submissions/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        router.push('/dashboard')
      } else {
        const data = await res.json()
        setError(data.message || 'فشل في رفع الصورة')
      }
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" dir="rtl">
      <div className="flex justify-center">
        <div className="card" style={{ width: '100%', maxWidth: '600px' }}>
          <h2>📸 رفع صورة للنبته</h2>
          <p style={{ marginBottom: '2rem', color: 'var(--text-light)' }}>
            قم برفع صورة واضحة لنبتتك واكتب ملاحظة تصف حالتها.
          </p>

          {error && <div style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-20">
              <div style={{ 
                border: '2px dashed #ddd', 
                padding: '2rem', 
                textAlign: 'center', 
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer',
                position: 'relative'
              }}>
                {file ? (
                  <div>
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt="Preview" 
                      style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} 
                    />
                    <p style={{ marginTop: '10px' }}>{file.name}</p>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '3rem' }}>📁</p>
                    <p>اضغط هنا أو اسحب الصورة لرفعها</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%', 
                    opacity: 0, 
                    cursor: 'pointer' 
                  }}
                  required
                />
              </div>

              <div>
                <label>كتابة الملاحظه</label>
                <textarea 
                  className="input-field" 
                  rows={4} 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب ملاحظتك هنا (مثال: النبتة تنمو بشكل جيد...)"
                ></textarea>
              </div>

              <div className="flex gap-10">
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  {loading ? 'جاري الرفع...' : 'تأكيد الرفع'}
                </button>
                <button type="button" onClick={() => router.back()} className="btn btn-secondary">
                  إلغاء
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
