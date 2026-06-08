<?php
if (session_status() === PHP_SESSION_NONE) session_start();
?>
<nav class="navbar">
  <div class="container flex justify-between items-center">
    <a href="index.php" class="logo flex items-center gap-10" style="display:flex;align-items:center;gap:10px">
      <img src="/logo.jpg" alt="شعار" style="width:40px;height:40px;border-radius:50%;object-fit:cover" onerror="this.style.display='none'">
      <span>منظمة نبض الأرض</span>
    </a>
    <div class="nav-links flex gap-20 items-center">
      <?php if (isset($_SESSION['user_id'])): ?>
        <span>أهلاً، <?=h($_SESSION['user_name'] ?? '')?></span>
        <a href="<?= ($_SESSION['user_role'] ?? '') === 'ADMIN' ? 'admin.php' : 'dashboard.php' ?>">لوحة التحكم</a>
        <a href="logout.php" class="btn btn-secondary">تسجيل الخروج</a>
      <?php else: ?>
        <a href="login.php">تسجيل الدخول</a>
        <a href="register.php" class="btn btn-primary">حساب جديد</a>
      <?php endif; ?>
    </div>
  </div>
</nav>
