<?php
require_once __DIR__ . '/config.php';

function cloudinaryUpload(string $filePath, string $folder): ?string {
    $timestamp = time();
    $params = [
        'timestamp' => $timestamp,
        'folder' => $folder,
    ];
    ksort($params);
    $toSign = '';
    foreach ($params as $k => $v) {
        $toSign .= $k . '=' . $v . '&';
    }
    $toSign = rtrim($toSign, '&');
    $signature = sha1($toSign . CLOUDINARY_API_SECRET);

    $url = "https://api.cloudinary.com/v1_1/" . CLOUDINARY_CLOUD_NAME . "/image/upload";

    $post = [
        'file' => new CURLFile($filePath),
        'api_key' => CLOUDINARY_API_KEY,
        'timestamp' => $timestamp,
        'folder' => $folder,
        'signature' => $signature,
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    $res = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) return null;

    $data = json_decode($res, true);
    return $data['secure_url'] ?? null;
}
