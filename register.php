<?php
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';

$error = '';
$schools = [];

try {
    $stmt = getDB()->query("SELECT * FROM schools ORDER BY name ASC");
    $schools = $stmt->fetchAll();
} catch (Exception $e) {}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $schoolId = (int)($_POST['school_id'] ?? 0);

    if (!$name || !$email || !$password || !$schoolId) {
        $error = 'جميع الحقول مطلوبة';
    } else {
        try {
            $db = getDB();
            $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                $error = 'البريد الإلكتروني مستخدم بالفعل';
            } else {
                $hash = password_hash($password, PASSWORD_BCRYPT);
                $stmt = $db->prepare("INSERT INTO users (name, email, password_hash, school_id, role, total_points) VALUES (?, ?, ?, ?, 'STUDENT', 0)");
                $stmt->execute([$name, $email, $hash, $schoolId]);
                redirect('login.php?registered=true');
            }
        } catch (Exception $e) {
            $error = 'حدث خطأ في الخادم';
        }
    }
}
?><!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>إنشاء حساب - <?=SITE_NAME?></title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<nav class="navbar">
  <div class="container flex justify-between items-center">
    <a href="index.php" class="logo">منظمة نبض الأرض</a>
    <div class="nav-links flex gap-20 items-center">
      <a href="login.php">تسجيل الدخول</a>
      <a href="register.php" class="btn btn-primary">حساب جديد</a>
    </div>
  </div>
</nav>

<div class="container flex justify-center items-center" style="min-height:80vh">
  <div class="card" style="width:100%;max-width:450px" dir="rtl">
    <h2 style="text-align:center">🌱 إنشاء حساب جديد</h2>
    <p style="text-align:center;margin-bottom:2rem;color:var(--text-light)">انضم لمبادرة الشتلة الرقمية ووثق رحلة نمو شتلتك</p>

    <?php if ($error): ?>
    <div class="error-msg"><?=h($error)?></div>
    <?php endif; ?>

    <form method="post">
      <div class="gap-20 flex flex-col">
        <div>
          <label>الاسم الكامل</label>
          <input type="text" name="name" class="input-field" required placeholder="أدخل اسمك الكامل">
        </div>
        <div>
          <label>البريد الإلكتروني</label>
          <input type="email" name="email" class="input-field" required placeholder="example@mail.com">
        </div>
        <div>
          <label>المدرسة</label>
          <select name="school_id" class="input-field" required>
            <option value="">اختر مدرستك</option>
            <?php foreach ($schools as $s): ?>
            <option value="<?=$s['id']?>"><?=h($s['name'])?></option>
            <?php endforeach; ?>
          </select>
        </div>
        <div>
          <label>كلمة المرور</label>
          <input type="password" name="password" class="input-field" required placeholder="********">
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;margin-top:1rem">تسجيل</button>
      </div>
    </form>

    <div style="margin-top:1.5rem;text-align:center">
      <span>لديك حساب بالفعل؟ </span>
      <a href="login.php" style="color:var(--primary-green);font-weight:bold">سجل دخولك هنا</a>
    </div>
  </div>
</div>
</body>
</html>
