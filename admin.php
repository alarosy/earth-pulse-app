<?php
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/cloudinary.php';
requireAdmin();

$db = getDB();
$activeTab = $_GET['tab'] ?? 'submissions';
$error = '';
$success = '';

// Handle review submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'review' && isset($_POST['submission_id'])) {
        $subId = (int)$_POST['submission_id'];
        $score = (int)($_POST['score'] ?? 0);
        $comment = trim($_POST['admin_comment'] ?? '');

        if ($score < 1 || $score > 10) {
            $error = 'التقييم يجب أن يكون بين 1 و 10';
        } else {
            $stmt = $db->prepare("SELECT user_id FROM submissions WHERE id = ?");
            $stmt->execute([$subId]);
            $sub = $stmt->fetch();
            if ($sub) {
                $db->beginTransaction();
                $stmt = $db->prepare("UPDATE submissions SET status='READ', admin_score=?, admin_comment=? WHERE id=?");
                $stmt->execute([$score, $comment ?: null, $subId]);
                $stmt = $db->prepare("UPDATE users SET total_points = total_points + ? WHERE id = ?");
                $stmt->execute([$score, $sub['user_id']]);
                $db->commit();
                $success = 'تم تقييم المشاركة بنجاح';
            }
        }
    } elseif ($_POST['action'] === 'add_school') {
        $name = trim($_POST['name'] ?? '');
        if ($name) {
            try {
                $stmt = $db->prepare("INSERT INTO schools (name) VALUES (?)");
                $stmt->execute([$name]);
                $success = 'تم إضافة المدرسة بنجاح';
            } catch (Exception $e) {
                $error = 'المدرسة موجودة بالفعل';
            }
        }
    } elseif ($_POST['action'] === 'add_activity') {
        $title = trim($_POST['title'] ?? '');
        $description = trim($_POST['description'] ?? '');
        if ($title && $description) {
            $imageUrl = null;
            if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
                $imageUrl = cloudinaryUpload($_FILES['file']['tmp_name'], 'earth-pulse/activities');
            }
            $stmt = $db->prepare("INSERT INTO activities (title, description, image_url) VALUES (?, ?, ?)");
            $stmt->execute([$title, $description, $imageUrl]);
            $success = 'تم إضافة النشاط بنجاح';
        }
    } elseif ($_POST['action'] === 'delete_activity' && isset($_POST['id'])) {
        $stmt = $db->prepare("DELETE FROM activities WHERE id = ?");
        $stmt->execute([(int)$_POST['id']]);
        $success = 'تم حذف النشاط';
    }
}

// Fetch data
$students = $db->query("SELECT u.*, s.name as school_name FROM users u JOIN schools s ON u.school_id = s.id WHERE u.role='STUDENT' ORDER BY u.total_points DESC")->fetchAll();
$unreadSubmissions = $db->query("SELECT sub.*, u.name as user_name, s.name as school_name FROM submissions sub JOIN users u ON sub.user_id = u.id JOIN schools s ON u.school_id = s.id WHERE sub.status='UNREAD' ORDER BY sub.created_at DESC")->fetchAll();
$schools = $db->query("SELECT * FROM schools ORDER BY name ASC")->fetchAll();
$activities = $db->query("SELECT * FROM activities ORDER BY created_at DESC")->fetchAll();
?><!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>لوحة تحكم المشرف</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<?php include __DIR__ . '/nav.php'; ?>

<div class="container" dir="rtl">
  <h1>لوحة تحكم المشرف</h1>

  <?php if ($error): ?><div class="error-msg"><?=h($error)?></div><?php endif; ?>
  <?php if ($success): ?><div class="success-msg"><?=h($success)?></div><?php endif; ?>

  <div class="flex gap-20" style="margin-bottom:2rem;border-bottom:1px solid #ddd">
    <a href="?tab=submissions" class="btn <?=$activeTab==='submissions'?'btn-primary':''?>" style="border-radius:12px 12px 0 0">مشاركات غير مقروءة (<?=count($unreadSubmissions)?>)</a>
    <a href="?tab=students" class="btn <?=$activeTab==='students'?'btn-primary':''?>" style="border-radius:12px 12px 0 0">إدارة الطلاب (<?=count($students)?>)</a>
    <a href="?tab=schools" class="btn <?=$activeTab==='schools'?'btn-primary':''?>" style="border-radius:12px 12px 0 0">إدارة المدارس</a>
    <a href="?tab=activities" class="btn <?=$activeTab==='activities'?'btn-primary':''?>" style="border-radius:12px 12px 0 0">إدارة النشاطات</a>
  </div>

  <?php if ($activeTab === 'submissions'): ?>
  <div class="grid-3">
    <?php if (count($unreadSubmissions) > 0): ?>
      <?php foreach ($unreadSubmissions as $sub): ?>
      <div class="card" style="padding:0;overflow:hidden">
        <img src="<?=h($sub['image_url'])?>" alt="شتلة" style="width:100%;height:250px;object-fit:cover">
        <div style="padding:1.5rem">
          <div class="flex justify-between items-center" style="margin-bottom:1rem">
            <span style="font-weight:bold"><?=h($sub['user_name'])?></span>
            <span style="font-size:0.8rem;color:var(--text-light)"><?=h($sub['school_name'])?></span>
          </div>
          <p style="margin-bottom:1rem"><?=h($sub['description'])?></p>

          <form method="post">
            <input type="hidden" name="action" value="review">
            <input type="hidden" name="submission_id" value="<?=$sub['id']?>">
            <div class="flex flex-col gap-10">
              <textarea name="admin_comment" class="input-field" placeholder="اكتب تعليقاً للطالب (اختياري)..." rows="2"></textarea>
              <div class="flex items-center gap-10">
                <label>التقييم:</label>
                <input type="number" name="score" min="1" max="10" value="5" class="input-field" style="width:70px;margin-bottom:0" required>
                <button type="submit" class="btn btn-primary">تأكيد التقييم</button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <?php endforeach; ?>
    <?php else: ?>
    <p>لا يوجد مشاركات جديدة بانتظار المراجعة.</p>
    <?php endif; ?>
  </div>

  <?php elseif ($activeTab === 'students'): ?>
  <div class="card">
    <table>
      <thead>
        <tr><th>الاسم</th><th>المدرسة</th><th>النقاط</th></tr>
      </thead>
      <tbody>
        <?php foreach ($students as $s): ?>
        <tr>
          <td><?=h($s['name'])?></td>
          <td><?=h($s['school_name'])?></td>
          <td><?=$s['total_points']?></td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>

  <?php elseif ($activeTab === 'schools'): ?>
  <div class="card">
    <h3>إضافة مدرسة جديدة</h3>
    <form method="post" class="flex gap-10" style="margin-top:1rem;margin-bottom:2rem">
      <input type="hidden" name="action" value="add_school">
      <input type="text" name="name" class="input-field" style="margin-bottom:0" placeholder="اسم المدرسة" required>
      <button type="submit" class="btn btn-primary">إضافة</button>
    </form>
    <h3>المدارس الحالية</h3>
    <ul style="list-style:none;padding:0">
      <?php foreach ($schools as $s): ?>
      <li style="padding:10px;border-bottom:1px solid #eee"><?=h($s['name'])?></li>
      <?php endforeach; ?>
    </ul>
  </div>

  <?php elseif ($activeTab === 'activities'): ?>
  <div class="card">
    <h3>إضافة نشاط جديد</h3>
    <?php if ($error): ?><div class="error-msg"><?=h($error)?></div><?php endif; ?>
    <form method="post" enctype="multipart/form-data" style="margin-top:1rem;margin-bottom:2rem">
      <input type="hidden" name="action" value="add_activity">
      <div class="flex flex-col gap-10">
        <input type="text" name="title" class="input-field" placeholder="عنوان النشاط" required>
        <textarea name="description" class="input-field" placeholder="وصف النشاط" rows="3" required></textarea>
        <input type="file" name="file" class="input-field" accept="image/*">
        <button type="submit" class="btn btn-primary">إضافة نشاط</button>
      </div>
    </form>

    <h3>النشاطات الحالية (آخر 3 نشاطات تظهر بالرئيسية)</h3>
    <div class="grid-3" style="margin-top:1rem">
      <?php foreach ($activities as $a): ?>
      <div style="border:1px solid #ddd;border-radius:8px;overflow:hidden;display:flex;flex-direction:column">
        <?php if ($a['image_url']): ?>
        <img src="<?=h($a['image_url'])?>" alt="<?=h($a['title'])?>" style="width:100%;height:150px;object-fit:cover">
        <?php endif; ?>
        <div style="padding:10px;flex:1">
          <h4 style="margin-bottom:5px"><?=h($a['title'])?></h4>
          <p style="font-size:0.9rem;color:var(--text-light)"><?=h($a['description'])?></p>
        </div>
        <form method="post" style="margin:10px">
          <input type="hidden" name="action" value="delete_activity">
          <input type="hidden" name="id" value="<?=$a['id']?>">
          <button type="submit" class="btn btn-danger btn-sm" style="width:100%" onclick="return confirm('هل أنت متأكد من الحذف؟')">حذف النشاط</button>
        </form>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
  <?php endif; ?>
</div>
</body>
</html>
