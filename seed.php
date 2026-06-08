<?php
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';

try {
    $db = getDB();

    // Create default school
    $stmt = $db->prepare("INSERT IGNORE INTO schools (name) VALUES (?)");
    $stmt->execute(['المدرسة المركزية']);
    $schoolId = $db->lastInsertId();
    if (!$schoolId || $schoolId == 0) {
        $stmt = $db->prepare("SELECT id FROM schools WHERE name = ?");
        $stmt->execute(['المدرسة المركزية']);
        $schoolId = $stmt->fetchColumn();
    }

    // Create admin user
    $hash = password_hash('admin123', PASSWORD_BCRYPT);
    $stmt = $db->prepare("INSERT IGNORE INTO users (name, email, password_hash, school_id, role, total_points) VALUES (?, ?, ?, ?, 'ADMIN', 0)");
    $stmt->execute(['مدير النظام', 'admin@green.com', $hash, $schoolId]);

    echo "✅ تم إنشاء البيانات الأولية بنجاح!\n";
    echo "   - المدرسة: المدرسة المركزية\n";
    echo "   - المشرف: admin@green.com / admin123\n";
} catch (Exception $e) {
    echo "❌ خطأ: " . $e->getMessage() . "\n";
}
