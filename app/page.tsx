'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function Home() {
  const { data: session } = useSession()
  const [activities, setActivities] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/activities')
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(err => console.error("Failed to fetch activities", err))
  }, [])

  return (
    <div className="container" dir="rtl">
      {/* 1. Header & Hero Image */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center',
        padding: '3rem 0',
        borderBottom: '1px solid #eee'
      }}>
        {/* Hero Image placeholder (User will provide hero.jpg) */}
        <img src="/hero.jpg" alt="واجهة منظمة نبض الأرض" style={{ width: '100%', maxWidth: '900px', height: 'auto', maxHeight: '500px', objectFit: 'contain', marginBottom: '2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} 
             onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/900x400?text=صورة+الواجهة+(hero.jpg)'; }} />
             
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'var(--primary-dark)' }}>منظمة نبض الأرض</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '800px', marginBottom: '2.5rem', color: 'var(--text-light)' }}>
          للتوعية البيئية والمحافظة على الطبيعة.
        </p>
        
        {!session && (
          <div className="flex gap-20">
            <Link href="/register" className="btn btn-primary" style={{ padding: '15px 40px', fontSize: '1.1rem' }}>
              انضم إلينا
            </Link>
            <Link href="/login" className="btn btn-secondary" style={{ padding: '15px 40px', fontSize: '1.1rem' }}>
              تسجيل الدخول
            </Link>
          </div>
        )}
      </div>

      {/* 2. About Us & Goals */}
      <div style={{ padding: '4rem 0', borderBottom: '1px solid #eee' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>من نحن وما أهدافنا؟</h2>
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="card">
            <h3 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>أهداف المنظمة</h3>
            <ul style={{ color: 'var(--text-light)', paddingRight: '20px', lineHeight: '1.8' }}>
              <li>تعزيز ثقافة الإستدامة البيئية بين الأطفال والمجتمع المحلي</li>
              <li>المساهمة في الحد من اثار التغير المناخي عبر حلول عملية ومبتكرة</li>
              <li>بناء شراكات مجتمعية قوية بين المدارس، البلديات، الأسر لدعم البيئة</li>
              <li>نشر الوعي البيئي والصحي للحد من الأمراض المرتبطة بالتصحر والغبار</li>
              <li>غرس قيم العمل الجماعي والمسؤولية المجتمعية في نفوس الأطفال</li>
              <li>تحويل المدارس إلى بيئة تعليمية صحية وآمنة تشجع على التعلم والإبداع</li>
              <li>دعم مشاركة الفئات الأقل حظاً في الأنشطة البيئية بشكل متساوٍ</li>
            </ul>
          </div>
          <div className="card">
            <h3 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>وسائل تحقيق الأهداف</h3>
            <ul style={{ color: 'var(--text-light)', paddingRight: '20px', lineHeight: '1.8' }}>
              <li>تنظيم حملات زراعة بذور وتشجير مدرسي بمشاركة الأطفال والمعلمين</li>
              <li>إعداد برنامج تدريبي للطلاب لورش عمل عملية</li>
              <li>تنفيذ حملات توعوية مجتمعية يقودها الأطفال بمساندة الفريق الإعلامي</li>
              <li>بناء شراكات مع البلديات والشركات المحلية كضمان للدعم النفسي واللوجستي</li>
              <li>تطوير برنامج رقمي تفاعلي لتحفيز الأطفال عبر تحديات ونقاط</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Founders Section */}
      <div style={{ padding: '4rem 0', borderBottom: '1px solid #eee', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '2rem' }}>الأعضاء المؤسسون</h2>
        
        {/* Top 3 Founders */}
        <div className="grid" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
          {[
            { name: "فاطمة أمين", role: "أمين الصندوق - طبرق", img: "founder-2.jpg" },
            { name: "ضياء تامر", role: "رئيس مجلس الإدارة - وادي الحياة", img: "founder-1.jpg", highlight: true },
            { name: "حسام آبته", role: "رئيس اللجنة العمومية - جرمة", img: "founder-3.jpg" },
          ].map((founder, idx) => (
            <div key={idx} className="card" style={{ padding: '2rem 1rem', width: '280px', transform: founder.highlight ? 'scale(1.05)' : 'none', border: founder.highlight ? '2px solid var(--primary-green)' : 'none' }}>
              <img src={`/${founder.img}`} alt={founder.name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem auto', display: 'block', background: '#eee' }} onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/100?text='+founder.name.split(' ')[0]; }} />
              <h3 style={{ marginBottom: '0.5rem', color: founder.highlight ? 'var(--primary-dark)' : 'inherit' }}>{founder.name}</h3>
              <p style={{ color: 'var(--primary-green)', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{founder.role}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '1rem' }}>عضو مؤسس</p>
            </div>
          ))}
        </div>

        {/* Bottom 5 Founders */}
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          {[
            { name: "شذى إبراهيم", role: "طرابلس", img: "founder-4.jpg" },
            { name: "عادل نصر", role: "الجفرة", img: "founder-5.jpg" },
            { name: "عيسى سيدى", role: "الكفرة", img: "founder-6.jpg" },
            { name: "جهاد عبدو", role: "شحات", img: "founder-7.jpg" },
            { name: "سليم حاجي", role: "زوارة", img: "founder-8.jpg" },
          ].map((founder, idx) => (
            <div key={idx} className="card" style={{ padding: '1.5rem 1rem' }}>
              <img src={`/${founder.img}`} alt={founder.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem auto', display: 'block', background: '#eee' }} onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/80?text='+founder.name.split(' ')[0]; }} />
              <h4 style={{ marginBottom: '0.5rem' }}>{founder.name}</h4>
              <p style={{ color: 'var(--primary-green)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{founder.role}</p>
              <p style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>عضو مؤسس</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Latest Activities Section */}
      <div style={{ padding: '4rem 0', borderBottom: '1px solid #eee' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>أحدث الأنشطة</h2>
        {activities.length > 0 ? (
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {activities.map(activity => (
              <div key={activity.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                {activity.imageUrl ? (
                  <img src={activity.imageUrl} alt={activity.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '200px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    صورة النشاط
                  </div>
                )}
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>{activity.title}</h3>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1rem' }}>{activity.description}</p>
                  <span style={{ fontSize: '0.8rem', color: '#aaa' }}>
                    {new Date(activity.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>لم يتم إدراج أنشطة بعد.</p>
        )}
      </div>

      {/* 5. Footer */}
      <footer style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-light)' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h4>تواصل معنا</h4>
          <p dir="ltr" style={{ margin: '0.5rem 0' }}>📞 0919896075</p>
          <p dir="ltr">✉️ earthpulse100@gmail.com</p>
        </div>
        <p style={{ fontSize: '0.9rem', marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
          &copy; {new Date().getFullYear()} منظمة نبض الأرض. جميع الحقوق محفوظة. <br/>
          تطوير وإشراف: <a href="https://www.facebook.com/lyalrwsy.112528" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-green)', fontWeight: 'bold', textDecoration: 'none' }}>علي العروسي</a>
        </p>
      </footer>
    </div>
  )
}
