<?php

/**
 * Deployment Script
 * Extracts build.zip file in the same directory
 * Requires secret key authentication
 */

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set time limit
set_time_limit(300);

// Generate expected secret key (today's date in dmy format)
$expectedSecretKey = date('dmy');
$providedSecretKey = $_GET['key'] ?? '';

// Verify secret key
if ($providedSecretKey !== $expectedSecretKey) {
    echo "⚠ ERROR: Access Denied - Invalid or missing secret key\n";
    exit(1);
}

echo "=== Deployment Script ===\n\n";

// Get current directory
$currentDir = __DIR__;
$zipFile = $currentDir . '/build.zip';
$extractDir = $currentDir;

echo "👁 Current Directory: {$currentDir}\n";
echo "👁 Looking for build.zip in: {$zipFile}\n\n";

// Check if zip file exists
if (!file_exists($zipFile)) {
    echo "ERROR: build.zip file not found!\n";
    echo "Please make sure build.zip is in the same directory as deployer.php\n";
    exit(1);
}

// Check if zip file is readable
if (!is_readable($zipFile)) {
    echo "❌ ERROR: build.zip file is not readable!\n";
    exit(1);
}

// Get zip file size
$fileSize = filesize($zipFile);
echo "💼 File size: " . number_format($fileSize) . " bytes\n";

// Check if ZipArchive class is available
if (!class_exists('ZipArchive')) {
    echo "❌ ERROR: ZipArchive class not available!\n";
    echo "⚠ Please install PHP ZIP extension\n";
    exit(1);
}

// Create ZipArchive instance
$zip = new ZipArchive();

// Open zip file
echo "📂 Opening build.zip...\n";
$openResult = $zip->open($zipFile);

if ($openResult !== true) {
    echo "❌ ERROR: Failed to open build.zip!\n";
    echo "❌ Error code: {$openResult}\n";

    // Show error meaning
    $errorMessages = [
        ZipArchive::ER_EXISTS => "File already exists",
        ZipArchive::ER_INCONS => "Zip archive inconsistent",
        ZipArchive::ER_INVAL => "Invalid argument",
        ZipArchive::ER_MEMORY => "Malloc failure",
        ZipArchive::ER_NOENT => "No such file",
        ZipArchive::ER_NOZIP => "Not a zip archive",
        ZipArchive::ER_OPEN => "Can't open file",
        ZipArchive::ER_READ => "Read error",
        ZipArchive::ER_SEEK => "Seek error",
    ];

    if (isset($errorMessages[$openResult])) {
        echo "❌ Error meaning: " . $errorMessages[$openResult] . "\n";
    }

    exit(1);
}

// Get file count in zip
$numFiles = $zip->numFiles;
echo "📂 Files in archive: {$numFiles}\n\n";

// Extract files
echo "📂 Extracting files to: {$extractDir}\n";
echo "------------------------\n";

$extractResult = $zip->extractTo($extractDir);

if ($extractResult === true) {
    echo "✅ Successfully extracted all files!\n\n";

    // Show extracted files (limit to first 20 for performance)
    echo "📂 Extracted Files (first 20):\n";
    echo "---------------------------\n";

    for ($i = 0; $i < min($numFiles, 20); $i++) {
        $fileInfo = $zip->statIndex($i);
        echo $fileInfo['name'] . "\n";
    }

    if ($numFiles > 20) {
        echo "... and " . ($numFiles - 20) . " more files\n";
    }
} else {
    echo "❌ ERROR: Failed to extract files!\n";
}

echo "\n";

// Close zip file
$zip->close();

// Check for common deployment files
$commonFiles = ['.htaccess', 'index.html', 'manifest.json', 'sw.js'];
echo "👁 Checking deployment files:\n";
echo "--------------------------\n";

foreach ($commonFiles as $file) {
    $filePath = $extractDir . '/' . $file;
    if (file_exists($filePath)) {
        echo "✔ {$file} - Found\n";
    } else {
        echo "❌ {$file} - Not found\n";
    }
}

echo "\n";

// Extract backend ZIP file
echo "=== Backend Extraction ===\n\n";

$backendDir = __DIR__ . '/../../laravel';
$backendZipFile = $currentDir . '/build.zip';

echo "👁 Backend Directory: {$backendDir}\n";
echo "👁 Looking for build.zip in: {$backendZipFile}\n\n";

// Check if backend zip file exists
if (file_exists($backendZipFile)) {
    echo "📂 Found build.zip, extracting backend files...\n";

    // Check if backend directory exists, create if not
    if (!is_dir($backendDir)) {
        if (mkdir($backendDir, 0755, true)) {
            echo "📁 Created backend directory: {$backendDir}\n";
        } else {
            echo "❌ ERROR: Failed to create backend directory: {$backendDir}\n";
        }
    }

    // Open backend zip file
    $backendZip = new ZipArchive();
    $backendOpenResult = $backendZip->open($backendZipFile);

    if ($backendOpenResult === true) {
        $backendNumFiles = $backendZip->numFiles;
        echo "📂 Backend files in archive: {$backendNumFiles}\n";

        // Extract backend files
        echo "📂 Extracting backend files to: {$backendDir}\n";
        echo "------------------------\n";

        $backendExtractResult = $backendZip->extractTo($backendDir);

        if ($backendExtractResult === true) {
            echo "✅ Successfully extracted all backend files!\n\n";

            // Show extracted backend files (limit to first 20)
            echo "📂 Extracted Backend Files (first 20):\n";
            echo "-----------------------------------\n";

            for ($i = 0; $i < min($backendNumFiles, 20); $i++) {
                $fileInfo = $backendZip->statIndex($i);
                echo $fileInfo['name'] . "\n";
            }

            if ($backendNumFiles > 20) {
                echo "... and " . ($backendNumFiles - 20) . " more files\n";
            }

            echo "\n";

            // Check for common Laravel files
            $laravelFiles = ['artisan', 'composer.json', '.env.example', 'app', 'bootstrap', 'config'];
            echo "👁 Checking Laravel files:\n";
            echo "-------------------------\n";

            foreach ($laravelFiles as $file) {
                $filePath = $backendDir . '/' . $file;
                if (file_exists($filePath)) {
                    echo "✔ {$file} - Found\n";
                } else {
                    echo "❌ {$file} - Not found\n";
                }
            }
        } else {
            echo "❌ ERROR: Failed to extract backend files!\n";
        }

        // Close backend zip file
        $backendZip->close();
    } else {
        echo "❌ ERROR: Failed to open build.zip!\n";
        echo "❌ Error code: {$backendOpenResult}\n";
    }
} else {
    echo "ℹ️  build.zip not found - skipping backend extraction\n";
}

echo "\n";

// Handle cleanup if requested via POST
if (isset($_POST['cleanup']) && $_POST['cleanup'] == '1') {
    if (unlink($zipFile)) {
        echo "✅ build.zip has been deleted successfully!\n";
    }
    if (file_exists($backendZipFile) && unlink($backendZipFile)) {
        echo "✅ build.zip has been deleted successfully!\n";
    }
} else {
    echo "Cleanup: ZIP files have been extracted. You may want to delete them to save space.\n";
}

// Display completion message
if ($extractResult === true) {
    echo "\n=== ✅ Deployment Complete! ===\n";
    echo "Your files have been extracted successfully.\n";
    echo "You can now access your application.\n";
} else {
    echo "\n=== ❌ Deployment Failed! ===\n";
}
