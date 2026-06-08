<?php
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/functions.php';
require_once __DIR__ . '/includes/cloudinary.php';
requireLogin();

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $description = trim($_POST['description'] ?? '');

    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        $error = 'يرجى اختيار صورة';
    } elseif (!$description) {
        $error = 'يرجى كتابة ملاحظة';
    } else {
        $uploaded = cloudinaryUpload($_FILES['file']['tmp_name'], 'earth-pulse/submissions');
        if (!$uploaded) {
            $error = 'فشل في رفع الصورة إلى الخادم';
        } else {
            $db = getDB();
            $stmt = $db->prepare("INSERT INTO submissions (user_id, image_url, description, status) VALUES (?, ?, ?, 'UNREAD')");
            $stmt->execute([$_SESSION['user_id'], $uploaded, $description]);
            redirect('dashboard.php');
        }
    }
}
?><!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>رفع صورة - الشتلة الرقمية</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<?php include __DIR__ . '/nav.php'; ?>

<div class="container" dir="rtl">
  <div class="flex justify-center">
    <div class="card" style="width:100%;max-width:600px">
      <h2>📸 رفع صورة للنبتة</h2>
      <p style="margin-bottom:2rem;color:var(--text-light)">قم برفع صورة واضحة لنبتتك واكتب ملاحظة تصف حالتها.</p>
      <?php if ($error): ?>
      <div class="error-msg"><?=h($error)?></div>
      <?php endif; ?>
      <?php if ($success): ?>
      <div class="success-msg"><?=h($success)?></div>
      <?php endif; ?>

      <form method="post" enctype="multipart/form-data">
        <div class="flex flex-col gap-20">
          <div style="border:2px dashed #ddd;padding:2rem;text-align:center;border-radius:var(--border-radius);cursor:pointer;position:relative" id="drop-zone">
            <div id="preview">
              <p style="font-size:3rem">📁</p>
              <p>اضغط هنا أو اسحب الصورة لرفعها</p>
            </div>
            <input type="file" name="file" accept="image/*" required style="position:absolute;top:0;left:0;width:100%;height:100%;opacity:0;cursor:pointer" id="file-input">
          </div>

          <div>
            <label>كتابة الملاحظة</label>
            <textarea name="description" class="input-field" rows="4" required placeholder="اكتب ملاحظتك هنا (مثال: النبتة تنمو بشكل جيد...)"></textarea>
          </div>

          <div class="flex gap-10">
            <button type="submit" class="btn btn-primary" style="flex:1">تأكيد الرفع</button>
            <button type="button" onclick="history.back()" class="btn btn-secondary">إلغاء</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>

<script>
document.getElementById('file-input').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(ev) {
      document.getElementById('preview').innerHTML = '<img src="'+ev.target.result+'" style="max-width:100%;max-height:300px;border-radius:8px"><p style="margin-top:10px">'+file.name+'</p>';
    };
    reader.readAsDataURL(file);
  }
});
</script>
</body>
</html>
