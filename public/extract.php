<?php
$zipFile = 'build.zip';
$extractPath = __DIR__;
$nuxtDir = $extractPath . '/_nuxt';
$fontDir = $extractPath . '/_fonts';

// recursive delete folder
function deleteFolder($dir)
{
    if (!is_dir($dir)) return;

    foreach (scandir($dir) as $file) {
        if ($file != '.' && $file != '..') {
            $path = "$dir/$file";
            is_dir($path) ? deleteFolder($path) : unlink($path);
        }
    }
    rmdir($dir);
}

if (!file_exists($zipFile)) {
    die('ZIP not found');
}

// 🔥 hapus folder _nuxt lama saja
if (is_dir($nuxtDir)) {
    deleteFolder($nuxtDir);
    echo "_nuxt lama dihapus\n";
}

// 🔥 hapus folder _fonts lama saja
if (is_dir($fontDir)) {
    deleteFolder($fontDir);
    echo "_fonts lama dihapus\n";
}

$zip = new ZipArchive;

if ($zip->open($zipFile) === TRUE) {
    $zip->extractTo($extractPath);
    $zip->close();

    unlink($zipFile); // hapus zip setelah extract

    echo 'SUCCESS';
} else {
    echo 'FAILED';
}
