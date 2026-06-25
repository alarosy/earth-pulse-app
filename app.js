// ====== CONFIG ======
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// ====== STATE ======
let supabaseClient = null;
let currentUser = null;

// ====== INIT ======
document.addEventListener('DOMContentLoaded', async () => {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    const { data } = await supabaseClient
      .from('profiles')
      .select('*, schools(name)')
      .eq('id', session.user.id)
      .single();
    currentUser = data;
  }

  updateNav();
  initPage();
});

function initPage() {
  const p = window.location.pathname.split('/').pop() || 'index.html';
  if (p === 'index.html' || p === '') initIndex();
  else if (p === 'login.html') initLogin();
  else if (p === 'register.html') initRegister();
  else if (p === 'dashboard.html') initDashboard();
  else if (p === 'upload.html') initUpload();
  else if (p === 'admin.html') initAdmin();
}

// ====== NAV ======
function updateNav() {
  const userNameEl = document.getElementById('userName');
  if (!userNameEl) return;
  const guestLinks = document.querySelectorAll('.guest-link');
  const authLinks = document.querySelectorAll('.auth-link');
  const dashboardLink = document.querySelector('.dashboard-link');
  const adminLink = document.querySelector('.admin-link');

  if (currentUser) {
    guestLinks.forEach(el => el.classList.add('hidden'));
    authLinks.forEach(el => el.classList.remove('hidden'));
    userNameEl.textContent = `أهلاً، ${currentUser.name}`;
    userNameEl.classList.remove('hidden');
    if (currentUser.role === 'ADMIN') {
      if (adminLink) adminLink.classList.remove('hidden');
      if (dashboardLink) dashboardLink.classList.add('hidden');
    } else {
      if (dashboardLink) dashboardLink.classList.remove('hidden');
      if (adminLink) adminLink.classList.add('hidden');
    }
  } else {
    guestLinks.forEach(el => el.classList.remove('hidden'));
    authLinks.forEach(el => el.classList.add('hidden'));
    userNameEl.classList.add('hidden');
  }
}

// ====== LOGOUT ======
document.addEventListener('click', (e) => {
  if (e.target.id === 'logoutLink') {
    e.preventDefault();
    supabaseClient.auth.signOut();
    window.location.href = 'index.html';
  }
});

// ====== AUTH HELPERS ======
async function requireAuth() {
  if (!currentUser) { window.location.href = 'login.html'; return false; }
  return true;
}
async function requireAdmin() {
  if (!await requireAuth()) return false;
  if (currentUser.role !== 'ADMIN') { window.location.href = 'index.html'; return false; }
  return true;
}

// ====== STORAGE ======
async function uploadImage(file, folder) {
  const ext = file.name.split('.').pop();
  const name = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
  const path = `${folder}/${name}`;
  const { error } = await supabaseClient.storage.from('images').upload(path, file);
  if (error) throw error;
  const { data: { publicUrl } } = supabaseClient.storage.from('images').getPublicUrl(path);
  return publicUrl;
}

// ====== INDEX PAGE ======
async function initIndex() {
  const container = document.getElementById('activitiesContainer');
  if (!container) return;
  try {
    const { data } = await supabaseClient.from('activities').select('*').order('created_at', { ascending: false }).limit(3);
    if (data && data.length > 0) {
      container.innerHTML = data.map(a => `
        <div class="card" style="padding:0;overflow:hidden">
          ${a.image_url ? `<img src="${a.image_url}" alt="${a.title}" style="width:100%;height:200px;object-fit:cover">` : '<div style="width:100%;height:200px;background:#f5f5f5;display:flex;align-items:center;justify-content:center">صورة النشاط</div>'}
          <div style="padding:1.5rem">
            <h3 style="margin-bottom:0.5rem;font-size:1.2rem">${escHtml(a.title)}</h3>
            <p style="color:var(--text-light);font-size:0.9rem;margin-bottom:1rem">${escHtml(a.description)}</p>
            <span style="font-size:0.8rem;color:#aaa">${new Date(a.created_at).toLocaleDateString('ar-EG')}</span>
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<p style="text-align:center;color:var(--text-light);grid-column:1/-1">لم يتم إدراج أنشطة بعد.</p>';
    }
  } catch (err) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-light);grid-column:1/-1">لم يتم إدراج أنشطة بعد.</p>';
  }
}

// ====== LOGIN PAGE ======
function initLogin() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  const params = new URLSearchParams(window.location.search);
  if (params.get('registered') === 'true') {
    const el = document.getElementById('loginSuccess');
    if (el) el.classList.remove('hidden');
  }
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'جاري تسجيل الدخول...';

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      errorEl.textContent = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      errorEl.classList.remove('hidden');
      btn.disabled = false; btn.textContent = 'دخول';
      return;
    }
    const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', data.user.id).single();
    window.location.href = profile?.role === 'ADMIN' ? 'admin.html' : 'dashboard.html';
  });
}

// ====== REGISTER PAGE ======
async function initRegister() {
  const schoolSelect = document.getElementById('schoolSelect');
  const form = document.getElementById('registerForm');
  if (!schoolSelect || !form) return;
  try {
    const { data } = await supabaseClient.from('schools').select('*').order('name');
    if (data) schoolSelect.innerHTML = '<option value="">اختر مدرستك</option>' + data.map(s => `<option value="${s.id}">${escHtml(s.name)}</option>`).join('');
  } catch (err) { schoolSelect.innerHTML = '<option value="">لا توجد مدارس متاحة</option>'; }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const schoolId = schoolSelect.value;
    const errorEl = document.getElementById('regError');
    if (!name || !email || !password || !schoolId) { errorEl.textContent = 'جميع الحقول مطلوبة'; errorEl.classList.remove('hidden'); return; }
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'جاري التسجيل...';
    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if (error) {
      errorEl.textContent = error.message.includes('already') ? 'البريد مستخدم بالفعل' : 'حدث خطأ في الخادم';
      errorEl.classList.remove('hidden');
      btn.disabled = false; btn.textContent = 'تسجيل';
      return;
    }
    await supabaseClient.from('profiles').insert({ id: data.user.id, name, email, school_id: schoolId, role: 'STUDENT', total_points: 0 });
    await supabaseClient.auth.signOut();
    window.location.href = 'login.html?registered=true';
  });
}

// ====== DASHBOARD PAGE ======
async function initDashboard() {
  if (!await requireAuth()) return;
  const container = document.getElementById('submissionsContainer');
  const pointsEl = document.getElementById('totalPoints');
  if (!container) return;

  document.getElementById('userPointsDisplay').textContent = currentUser.total_points || 0;

  try {
    const { data } = await supabaseClient.from('submissions').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false });
    if (data && data.length > 0) {
      container.innerHTML = data.map(s => `
        <div class="card" style="padding:0;overflow:hidden;border:1px solid #eee;border-radius:12px">
          <div style="position:relative">
            <img src="${s.image_url}" alt="نبتة" style="width:100%;height:250px;object-fit:cover">
            <span class="badge ${s.status === 'READ' ? 'badge-read' : 'badge-unread'}" style="position:absolute;top:10px;left:10px">
              ${s.status === 'READ' ? 'مقيم: ' + s.admin_score + '/10' : 'قيد المراجعة'}
            </span>
          </div>
          <div style="padding:1.5rem">
            <div class="flex justify-between items-center" style="margin-bottom:1rem;border-bottom:1px solid #f5f5f5;padding-bottom:0.5rem">
              <span style="font-weight:bold;color:var(--primary-dark)">ملاحظتك:</span>
              <span style="font-size:0.8rem;color:var(--text-light)">${new Date(s.created_at).toLocaleDateString('ar-EG')}</span>
            </div>
            <p style="margin-bottom:1.5rem;line-height:1.6">${escHtml(s.description)}</p>
            ${s.admin_comment ? `<div class="admin-comment"><p style="font-size:0.85rem;font-weight:bold;color:var(--primary-green);margin-bottom:0.3rem">تعليق الإدارة:</p><p style="font-size:0.9rem;color:#333">${escHtml(s.admin_comment)}</p></div>` : ''}
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-light);margin-top:2rem">لا يوجد مشاركات حتى الآن. ابدأ برفع أول صورة لشتلتك!</p>';
    }
  } catch (err) {
    container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-light)">حدث خطأ في تحميل المشاركات</p>';
  }
}

// ====== UPLOAD PAGE ======
function initUpload() {
  requireAuth();
  const form = document.getElementById('uploadForm');
  const fileInput = document.getElementById('fileInput');
  const preview = document.getElementById('preview');
  const errorEl = document.getElementById('uploadError');
  if (!form) return;

  fileInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => { preview.innerHTML = `<img src="${ev.target.result}" style="max-width:100%;max-height:300px;border-radius:8px"><p style="margin-top:10px">${file.name}</p>`; };
      reader.readAsDataURL(file);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = fileInput.files[0];
    const desc = document.getElementById('uploadDesc').value.trim();
    if (!file) { errorEl.textContent = 'يرجى اختيار صورة'; errorEl.classList.remove('hidden'); return; }
    if (!desc) { errorEl.textContent = 'يرجى كتابة ملاحظة'; errorEl.classList.remove('hidden'); return; }
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'جاري الرفع...';
    try {
      const url = await uploadImage(file, 'submissions');
      await supabaseClient.from('submissions').insert({ user_id: currentUser.id, image_url: url, description: desc, status: 'UNREAD' });
      window.location.href = 'dashboard.html';
    } catch (err) {
      errorEl.textContent = 'فشل في رفع الصورة';
      errorEl.classList.remove('hidden');
      btn.disabled = false; btn.textContent = 'تأكيد الرفع';
    }
  });
}

// ====== ADMIN PAGE ======
async function initAdmin() {
  if (!await requireAdmin()) return;
  setupTabs();
  loadTab('submissions');
}

function setupTabs() {
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('tab-active'));
      tab.classList.add('tab-active');
      loadTab(tab.dataset.tab);
    });
  });
}

async function loadTab(tab) {
  const content = document.getElementById('tabContent');
  content.innerHTML = '<div class="loading"><div class="spinner"></div><p>جاري التحميل...</p></div>';
  if (tab === 'submissions') await loadSubmissionsTab(content);
  else if (tab === 'students') await loadStudentsTab(content);
  else if (tab === 'schools') await loadSchoolsTab(content);
  else if (tab === 'activities') await loadActivitiesTab(content);
}

async function loadSubmissionsTab(container) {
  try {
    const { data: submissions } = await supabaseClient.from('submissions').select('*').eq('status', 'UNREAD').order('created_at', { ascending: false });
    if (!submissions || submissions.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>✅ لا يوجد مشاركات جديدة بانتظار المراجعة.</p></div>';
      return;
    }
    const { data: profiles } = await supabaseClient.from('profiles').select('id, name, schools(name)');
    const profileMap = {};
    if (profiles) profiles.forEach(p => { profileMap[p.id] = p; });
    container.innerHTML = '<div class="grid-3">' + submissions.map(s => {
      const prof = profileMap[s.user_id] || {};
      return `<div class="card" style="padding:0;overflow:hidden">
        <img src="${s.image_url}" alt="شتلة" style="width:100%;height:250px;object-fit:cover">
        <div style="padding:1.5rem">
          <div class="flex justify-between items-center" style="margin-bottom:1rem">
            <span style="font-weight:bold">${escHtml(prof.name || '')}</span>
            <span style="font-size:0.8rem;color:var(--text-light)">${escHtml(prof.schools?.name || '')}</span>
          </div>
          <p style="margin-bottom:1rem">${escHtml(s.description)}</p>
          <form class="review-form" data-id="${s.id}">
            <textarea class="input-field admin-comment-input" placeholder="اكتب تعليقاً للطالب (اختياري)..." rows="2"></textarea>
            <div class="flex items-center gap-10">
              <label>التقييم:</label>
              <input type="number" class="score-input input-field" min="1" max="10" value="5" style="width:70px;margin-bottom:0" required>
              <button type="submit" class="btn btn-primary">تأكيد التقييم</button>
            </div>
          </form>
        </div>
      </div>`;
    }).join('') + '</div>';

    container.querySelectorAll('.review-form').forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = form.dataset.id;
        const score = parseInt(form.querySelector('.score-input').value);
        const comment = form.querySelector('.admin-comment-input').value.trim();
        if (score < 1 || score > 10) { alert('التقييم يجب أن يكون بين 1 و 10'); return; }
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true; btn.textContent = 'جاري...';
        const { data: submission } = await supabaseClient.from('submissions').select('user_id').eq('id', id).single();
        await supabaseClient.from('submissions').update({ status: 'READ', admin_score: score, admin_comment: comment || null }).eq('id', id);
        const { data: profile } = await supabaseClient.from('profiles').select('total_points').eq('id', submission.user_id).single();
        if (profile) await supabaseClient.from('profiles').update({ total_points: (profile.total_points || 0) + score }).eq('id', submission.user_id);
        loadTab('submissions');
      });
    });
  } catch (err) {
    container.innerHTML = '<div class="error-msg">حدث خطأ في تحميل المشاركات</div>';
  }
}

async function loadStudentsTab(container) {
  try {
    const { data } = await supabaseClient.from('profiles').select('*, schools(name)').eq('role', 'STUDENT').order('total_points', { ascending: false });
    if (!data || data.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>لا يوجد طلاب بعد.</p></div>';
      return;
    }
    container.innerHTML = `<div class="card"><table><thead><tr><th>الاسم</th><th>المدرسة</th><th>النقاط</th></tr></thead><tbody>
      ${data.map(s => `<tr><td>${escHtml(s.name)}</td><td>${escHtml(s.schools?.name || '')}</td><td>${s.total_points}</td></tr>`).join('')}
    </tbody></table></div>`;
  } catch (err) {
    container.innerHTML = '<div class="error-msg">حدث خطأ</div>';
  }
}

async function loadSchoolsTab(container) {
  try {
    const { data } = await supabaseClient.from('schools').select('*').order('name');
    container.innerHTML = `
      <div class="card">
        <h3>إضافة مدرسة جديدة</h3>
        <form id="addSchoolForm" class="flex gap-10" style="margin-top:1rem;margin-bottom:2rem">
          <input type="text" id="schoolNameInput" class="input-field" style="margin-bottom:0" placeholder="اسم المدرسة" required>
          <button type="submit" class="btn btn-primary">إضافة</button>
        </form>
        <h3>المدارس الحالية</h3>
        <ul id="schoolsList" style="list-style:none;padding:0">
          ${(data || []).map(s => `<li style="padding:10px;border-bottom:1px solid #eee">${escHtml(s.name)}</li>`).join('') || '<li style="color:var(--text-light)">لا توجد مدارس بعد</li>'}
        </ul>
      </div>`;
    document.getElementById('addSchoolForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('schoolNameInput').value.trim();
      if (!name) return;
      const btn = e.target.querySelector('button');
      btn.disabled = true; btn.textContent = 'جاري...';
      const { error } = await supabaseClient.from('schools').insert({ name });
      if (error) { alert('المدرسة موجودة بالفعل'); btn.disabled = false; btn.textContent = 'إضافة'; return; }
      loadTab('schools');
    });
  } catch (err) {
    container.innerHTML = '<div class="error-msg">حدث خطأ</div>';
  }
}

async function loadActivitiesTab(container) {
  try {
    const { data } = await supabaseClient.from('activities').select('*').order('created_at', { ascending: false });
    container.innerHTML = `
      <div class="card">
        <h3>إضافة نشاط جديد</h3>
        <form id="addActivityForm" style="margin-top:1rem;margin-bottom:2rem">
          <div class="flex flex-col gap-10">
            <input type="text" id="activityTitle" class="input-field" placeholder="عنوان النشاط" required>
            <textarea id="activityDesc" class="input-field" placeholder="وصف النشاط" rows="3" required></textarea>
            <input type="file" id="activityFile" class="input-field" accept="image/*">
            <button type="submit" class="btn btn-primary">إضافة نشاط</button>
          </div>
        </form>
        <h3>النشاطات الحالية</h3>
        <div id="activitiesList" class="grid-3" style="margin-top:1rem">
          ${(data || []).length > 0 ? data.map(a => `
            <div style="border:1px solid #ddd;border-radius:8px;overflow:hidden;display:flex;flex-direction:column">
              ${a.image_url ? `<img src="${a.image_url}" alt="${escHtml(a.title)}" style="width:100%;height:150px;object-fit:cover">` : ''}
              <div style="padding:10px;flex:1">
                <h4 style="margin-bottom:5px">${escHtml(a.title)}</h4>
                <p style="font-size:0.9rem;color:var(--text-light)">${escHtml(a.description)}</p>
              </div>
              <button class="btn btn-danger btn-sm delete-activity" data-id="${a.id}" style="margin:10px">حذف النشاط</button>
            </div>
          `).join('') : '<p style="grid-column:1/-1;color:var(--text-light)">لا توجد نشاطات بعد</p>'}
        </div>
      </div>`;

    document.getElementById('addActivityForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('activityTitle').value.trim();
      const desc = document.getElementById('activityDesc').value.trim();
      const file = document.getElementById('activityFile').files[0];
      if (!title || !desc) return;
      const btn = e.target.querySelector('button');
      btn.disabled = true; btn.textContent = 'جاري...';
      try {
        let imageUrl = null;
        if (file) imageUrl = await uploadImage(file, 'activities');
        await supabaseClient.from('activities').insert({ title, description: desc, image_url: imageUrl });
        loadTab('activities');
      } catch (err) { alert('حدث خطأ'); btn.disabled = false; btn.textContent = 'إضافة نشاط'; }
    });

    document.querySelectorAll('.delete-activity').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('هل أنت متأكد من الحذف؟')) return;
        await supabaseClient.from('activities').delete().eq('id', btn.dataset.id);
        loadTab('activities');
      });
    });
  } catch (err) {
    container.innerHTML = '<div class="error-msg">حدث خطأ</div>';
  }
}

// ====== UTILITY ======
function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
