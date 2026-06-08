<?php
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';
session_start();

$activities = [];
try {
    $stmt = getDB()->query("SELECT * FROM activities ORDER BY created_at DESC LIMIT 3");
    $activities = $stmt->fetchAll();
} catch (Exception $e) {}
?><!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>منظمة نبض الأرض</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<nav class="navbar">
  <div class="container flex justify-between items-center">
    <a href="index.php" class="logo flex items-center gap-10" style="display:flex;align-items:center;gap:10px">
      <img src="/logo.jpg" alt="شعار" style="width:40px;height:40px;border-radius:50%;object-fit:cover" onerror="this.style.display='none'">
      <span>منظمة نبض الأرض</span>
    </a>
    <div class="nav-links flex gap-20 items-center">
      <?php if (isset($_SESSION['user_id'])): ?>
        <span>أهلاً، <?=h($_SESSION['user_name'])?></span>
        <a href="<?= $_SESSION['user_role'] === 'ADMIN' ? 'admin.php' : 'dashboard.php' ?>">لوحة التحكم</a>
        <a href="logout.php" class="btn btn-secondary">تسجيل الخروج</a>
      <?php else: ?>
        <a href="login.php">تسجيل الدخول</a>
        <a href="register.php" class="btn btn-primary">حساب جديد</a>
      <?php endif; ?>
    </div>
  </div>
</nav>

<div class="container" dir="rtl">
  <div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding:3rem 0;border-bottom:1px solid #eee">
    <img src="/hero.jpg" alt="واجهة منظمة نبض الأرض" style="width:100%;max-width:900px;height:auto;max-height:500px;object-fit:contain;margin-bottom:2rem;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.1)" onerror="this.src='https://via.placeholder.com/900x400?text=صورة+الواجهة+(hero.jpg)'">
    <h1 style="font-size:3.5rem;margin-bottom:1rem;color:var(--primary-dark)">منظمة نبض الأرض</h1>
    <p style="font-size:1.2rem;max-width:800px;margin-bottom:2.5rem;color:var(--text-light)">للتوعية البيئية والمحافظة على الطبيعة.</p>
    <?php if (!isset($_SESSION['user_id'])): ?>
    <div class="flex gap-20">
      <a href="register.php" class="btn btn-primary" style="padding:15px 40px;font-size:1.1rem">انضم إلينا</a>
      <a href="login.php" class="btn btn-secondary" style="padding:15px 40px;font-size:1.1rem">تسجيل الدخول</a>
    </div>
    <?php endif; ?>
  </div>

  <div style="padding:4rem 0;border-bottom:1px solid #eee">
    <h2 style="text-align:center;margin-bottom:2rem">من نحن وما أهدافنا؟</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:2rem">
      <div class="card">
        <h3 style="color:var(--primary-green);margin-bottom:1rem">أهداف المنظمة</h3>
        <ul style="color:var(--text-light);padding-right:20px;line-height:1.8">
          <li>تعزيز ثقافة الإستدامة البيئية بين الأطفال والمجتمع المحلي</li>
          <li>المساهمة في الحد من اثار التغير المناخي عبر حلول عملية ومبتكرة</li>
          <li>بناء شراكات مجتمعية قوية بين المدارس، البلديات، الأسر لدعم البيئة</li>
          <li>نشر الوعي البيئي والصحي للحد من الأمراض المرتبطة بالتصحر والغبار</li>
          <li>غرس قيم العمل الجماعي والمسؤولية المجتمعية في نفوس الأطفال</li>
          <li>تحويل المدارس إلى بيئة تعليمية صحية وآمنة تشجع على التعلم والإبداع</li>
          <li>دعم مشاركة الفئات الأقل حظاً في الأنشطة البيئية بشكل متساوٍ</li>
        </ul>
      </div>
      <div class="card">
        <h3 style="color:var(--primary-green);margin-bottom:1rem">وسائل تحقيق الأهداف</h3>
        <ul style="color:var(--text-light);padding-right:20px;line-height:1.8">
          <li>تنظيم حملات زراعة بذور وتشجير مدرسي بمشاركة الأطفال والمعلمين</li>
          <li>إعداد برنامج تدريبي للطلاب لورش عمل عملية</li>
          <li>تنفيذ حملات توعوية مجتمعية يقودها الأطفال بمساندة الفريق الإعلامي</li>
          <li>بناء شراكات مع البلديات والشركات المحلية كضمان للدعم النفسي واللوجستي</li>
          <li>تطوير برنامج رقمي تفاعلي لتحفيز الأطفال عبر تحديات ونقاط</li>
        </ul>
      </div>
    </div>
  </div>

  <div style="padding:4rem 0;border-bottom:1px solid #eee;text-align:center">
    <h2 style="margin-bottom:2rem">الأعضاء المؤسسون</h2>
    <div style="display:flex;justify-content:center;gap:2rem;flex-wrap:wrap;margin-bottom:3rem">
      <?php
      $top = [
        ['name'=>'فاطمة أمين','role'=>'أمين الصندوق - طبرق','img'=>'founder-2.jpg'],
        ['name'=>'ضياء تامر','role'=>'رئيس مجلس الإدارة - وادي الحياة','img'=>'founder-1.jpg','highlight'=>true],
        ['name'=>'حسام آبته','role'=>'رئيس اللجنة العمومية - جرمة','img'=>'founder-3.jpg'],
      ];
      foreach ($top as $f):
      ?>
      <div class="card" style="padding:2rem 1rem;width:280px;<?=!empty($f['highlight'])?'transform:scale(1.05);border:2px solid var(--primary-green)':''?>">
        <img src="/<?=h($f['img'])?>" alt="<?=h($f['name'])?>" style="width:100px;height:100px;border-radius:50%;object-fit:cover;margin:0 auto 1rem auto;display:block;background:#eee" onerror="this.src='https://via.placeholder.com/100?text=<?=urlencode(mb_substr($f['name'],0,2,'UTF-8'))?>'">
        <h3 style="margin-bottom:0.5rem;color:<?=!empty($f['highlight'])?'var(--primary-dark)':'inherit'?>"><?=h($f['name'])?></h3>
        <p style="color:var(--primary-green);font-weight:bold;font-size:0.9rem;margin-bottom:0.2rem"><?=h($f['role'])?></p>
        <p style="font-size:0.8rem;color:var(--text-light);margin-bottom:1rem">عضو مؤسس</p>
      </div>
      <?php endforeach; ?>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2rem">
      <?php
      $bottom = [
        ['name'=>'شذى إبراهيم','role'=>'طرابلس','img'=>'founder-4.jpg'],
        ['name'=>'عادل نصر','role'=>'الجفرة','img'=>'founder-5.jpg'],
        ['name'=>'عيسى سيدى','role'=>'الكفرة','img'=>'founder-6.jpg'],
        ['name'=>'جهاد عبدو','role'=>'شحات','img'=>'founder-7.jpg'],
        ['name'=>'سليم حاجي','role'=>'زوارة','img'=>'founder-8.jpg'],
      ];
      foreach ($bottom as $f):
      ?>
      <div class="card" style="padding:1.5rem 1rem">
        <img src="/<?=h($f['img'])?>" alt="<?=h($f['name'])?>" style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin:0 auto 1rem auto;display:block;background:#eee" onerror="this.src='https://via.placeholder.com/80?text=<?=urlencode(mb_substr($f['name'],0,2,'UTF-8'))?>'">
        <h4 style="margin-bottom:0.5rem"><?=h($f['name'])?></h4>
        <p style="color:var(--primary-green);font-size:0.9rem;margin-bottom:0.2rem"><?=h($f['role'])?></p>
        <p style="color:var(--text-light);font-size:0.8rem">عضو مؤسس</p>
      </div>
      <?php endforeach; ?>
    </div>
  </div>

  <div style="padding:4rem 0;border-bottom:1px solid #eee">
    <h2 style="text-align:center;margin-bottom:3rem">أحدث الأنشطة</h2>
    <?php if (count($activities) > 0): ?>
    <div class="grid-3">
      <?php foreach ($activities as $a): ?>
      <div class="card" style="padding:0;overflow:hidden">
        <?php if ($a['image_url']): ?>
        <img src="<?=h($a['image_url'])?>" alt="<?=h($a['title'])?>" style="width:100%;height:200px;object-fit:cover">
        <?php else: ?>
        <div style="width:100%;height:200px;background:#f5f5f5;display:flex;align-items:center;justify-content:center">صورة النشاط</div>
        <?php endif; ?>
        <div style="padding:1.5rem">
          <h3 style="margin-bottom:0.5rem;font-size:1.2rem"><?=h($a['title'])?></h3>
          <p style="color:var(--text-light);font-size:0.9rem;margin-bottom:1rem"><?=h($a['description'])?></p>
          <span style="font-size:0.8rem;color:#aaa"><?= date('Y/m/d', strtotime($a['created_at'])) ?></span>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
    <?php else: ?>
    <p style="text-align:center;color:var(--text-light)">لم يتم إدراج أنشطة بعد.</p>
    <?php endif; ?>
  </div>

  <footer style="padding:3rem 0;text-align:center;color:var(--text-light)">
    <div style="margin-bottom:1.5rem">
      <h4>تواصل معنا</h4>
      <p dir="ltr" style="margin:0.5rem 0">📞 0919896075</p>
      <p dir="ltr">✉️ earthpulse100@gmail.com</p>
    </div>
    <p style="font-size:0.9rem;margin-top:2rem;border-top:1px solid #eee;padding-top:1rem">
      &copy; <?=date('Y')?> منظمة نبض الأرض. جميع الحقوق محفوظة.<br>
      تطوير وإشراف: <a href="https://www.facebook.com/lyalrwsy.112528" target="_blank" rel="noreferrer" style="color:var(--primary-green);font-weight:bold;text-decoration:none">علي العروسي</a>
    </p>
  </footer>
</div>
</body>
</html>
