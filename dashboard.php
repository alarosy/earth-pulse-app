<?php
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';
requireLogin();

$userId = $_SESSION['user_id'];
$db = getDB();

$stmt = $db->prepare("SELECT total_points FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch();
$points = $user['total_points'] ?? 0;

$stmt = $db->prepare("SELECT * FROM submissions WHERE user_id = ? ORDER BY created_at DESC");
$stmt->execute([$userId]);
$submissions = $stmt->fetchAll();
?><!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>لوحة تحكم الطالب</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<?php include __DIR__ . '/nav.php'; ?>

<div class="container" dir="rtl">
  <div class="flex justify-between items-center" style="margin-bottom:2rem">
    <h1>لوحة تحكم الطالب</h1>
    <div class="card" style="padding:1rem 2rem;background:var(--primary-green);color:white">
      <span style="font-size:1.2rem;font-weight:bold">مجموع النقاط: <?=$points?></span>
    </div>
  </div>

  <div class="flex justify-center" style="margin-bottom:3rem">
    <a href="upload.php" class="btn btn-primary" style="padding:20px 40px;font-size:1.2rem">📸 رفع صورة جديدة للشتلة</a>
  </div>

  <h3>مشاركاتك السابقة</h3>
  <div class="grid-3" style="margin-top:1rem">
    <?php if (count($submissions) > 0): ?>
      <?php foreach ($submissions as $sub): ?>
      <div class="card" style="padding:0;overflow:hidden;border:1px solid #eee;border-radius:12px">
        <div style="position:relative">
          <img src="<?=h($sub['image_url'])?>" alt="نبتة" style="width:100%;height:250px;object-fit:cover">
          <span class="badge <?=$sub['status']==='READ'?'badge-read':'badge-unread'?>" style="position:absolute;top:10px;left:10px">
            <?=$sub['status']==='READ'?'مقيم: '.$sub['admin_score'].'/10':'قيد المراجعة'?>
          </span>
        </div>
        <div style="padding:1.5rem">
          <div class="flex justify-between items-center" style="margin-bottom:1rem;border-bottom:1px solid #f5f5f5;padding-bottom:0.5rem">
            <span style="font-weight:bold;color:var(--primary-dark)">ملاحظتك:</span>
            <span style="font-size:0.8rem;color:var(--text-light)"><?= date('Y/m/d', strtotime($sub['created_at'])) ?></span>
          </div>
          <p style="margin-bottom:1.5rem;line-height:1.6"><?=h($sub['description'])?></p>
          <?php if ($sub['admin_comment']): ?>
          <div class="admin-comment">
            <p style="font-size:0.85rem;font-weight:bold;color:var(--primary-green);margin-bottom:0.3rem">تعليق الإدارة:</p>
            <p style="font-size:0.9rem;color:#333"><?=h($sub['admin_comment'])?></p>
          </div>
          <?php endif; ?>
        </div>
      </div>
      <?php endforeach; ?>
    <?php else: ?>
    <p style="grid-column:1/-1;text-align:center;color:var(--text-light)">لا يوجد مشاركات حتى الآن. ابدأ برفع أول صورة لشتلتك!</p>
    <?php endif; ?>
  </div>
</div>
</body>
</html>
