<?php
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';
session_start();

$error = '';
$registered = isset($_GET['registered']);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($email && $password) {
        $stmt = getDB()->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_role'] = $user['role'];
            redirect($user['role'] === 'ADMIN' ? 'admin.php' : 'dashboard.php');
        } else {
            $error = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
        }
    } else {
        $error = 'يرجى ملء جميع الحقول';
    }
}
?><!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تسجيل الدخول - <?=SITE_NAME?></title>
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
  <div class="card" style="width:100%;max-width:400px" dir="rtl">
    <h2 style="text-align:center">تسجيل الدخول</h2>

    <?php if ($registered): ?>
    <div class="success-msg">تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول.</div>
    <?php endif; ?>

    <?php if ($error): ?>
    <div class="error-msg"><?=h($error)?></div>
    <?php endif; ?>

    <form method="post">
      <div class="gap-20 flex flex-col">
        <div>
          <label>البريد الإلكتروني</label>
          <input type="email" name="email" class="input-field" required placeholder="example@mail.com">
        </div>
        <div>
          <label>كلمة المرور</label>
          <input type="password" name="password" class="input-field" required placeholder="********">
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;margin-top:1rem">دخول</button>
      </div>
    </form>

    <div style="margin-top:1.5rem;text-align:center">
      <span>ليس لديك حساب؟ </span>
      <a href="register.php" style="color:var(--primary-green);font-weight:bold">أنشئ حساباً جديداً</a>
    </div>
  </div>
</div>
</body>
</html>
