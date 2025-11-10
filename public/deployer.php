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
    echo "<!DOCTYPE html>
<html>
<head>
    <title>Deployment Script - Access Denied</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; }
        .error { color: #dc3545; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; }
        .info { color: #004085; background-color: #cce5ff; border: 1px solid #b8daff; padding: 15px; border-radius: 5px; margin-top: 20px; }
        .hint { color: #6c757d; font-size: 14px; margin-top: 15px; }
        code { background-color: #f8f9fa; padding: 2px 5px; border-radius: 3px; font-family: monospace; }
    </style>
</head>
<body>
    <h1>🔒 Access Denied</h1>
    <div class='error'>
        <strong>Authentication Required</strong><br>
        Invalid or missing secret key.
    </div>

    <div class='info'>
        <h3>🔑 How to Access:</h3>
        <p>Add the secret key as a GET parameter:</p>
        <p><code>?key=TODAY_DATE</code></p>
        <p>Where <strong>TODAY_DATE</strong> is today's date in <strong>DDMMYY</strong> format.</p>
    </div>

    <div class='hint'>
        <p><strong>Example:</strong></p>
        <p>If today is November 10, 2025, use: <code>?key=101125</code></p>
        <p><em>(Format: Day-Month-Year with 2 digits each)</em></p>
    </div>

    <p><a href='javascript:history.back()'>← Go Back</a></p>
</body>
</html>";
    exit(1);
}

// Get current directory
$currentDir = __DIR__;
$zipFile = $currentDir . '/build.zip';
$extractDir = $currentDir;

echo "<h1>Deployment Script</h1>";
echo "<p>Current Directory: <strong>" . htmlspecialchars($currentDir) . "</strong></p>";
echo "<p>Looking for build.zip in: <strong>" . htmlspecialchars($zipFile) . "</strong></p>";

// Check if zip file exists
if (!file_exists($zipFile)) {
    echo "<p style='color: red;'>L Error: build.zip file not found!</p>";
    echo "<p>Please make sure build.zip is in the same directory as deployer.php</p>";
    exit(1);
}

// Check if zip file is readable
if (!is_readable($zipFile)) {
    echo "<p style='color: red;'>L Error: build.zip file is not readable!</p>";
    exit(1);
}

// Get zip file size
$fileSize = filesize($zipFile);
echo "<p>File size: <strong>" . number_format($fileSize) . "</strong> bytes</p>";

// Check if ZipArchive class is available
if (!class_exists('ZipArchive')) {
    echo "<p style='color: red;'>L Error: ZipArchive class not available!</p>";
    echo "<p>Please install PHP ZIP extension</p>";
    exit(1);
}

// Create ZipArchive instance
$zip = new ZipArchive();

// Open zip file
echo "<p>Opening build.zip...</p>";
$openResult = $zip->open($zipFile);

if ($openResult !== true) {
    echo "<p style='color: red;'>L Error: Failed to open build.zip!</p>";
    echo "<p>Error code: " . $openResult . "</p>";

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
        echo "<p>Error meaning: " . $errorMessages[$openResult] . "</p>";
    }

    exit(1);
}

// Get file count in zip
$numFiles = $zip->numFiles;
echo "<p>Files in archive: <strong>" . $numFiles . "</strong></p>";

// Extract files
echo "<p>Extracting files to: <strong>" . htmlspecialchars($extractDir) . "</strong></p>";
echo "<div style='background-color: #f0f0f0; padding: 10px; margin: 10px 0;'>";

$extractResult = $zip->extractTo($extractDir);

if ($extractResult === true) {
    echo "<p style='color: green;'> Successfully extracted all files!</p>";

    // Show extracted files (limit to first 20 for performance)
    echo "<h3>Extracted Files:</h3>";
    echo "<ul style='max-height: 300px; overflow-y: auto; font-family: monospace; font-size: 12px;'>";

    for ($i = 0; $i < min($numFiles, 20); $i++) {
        $fileInfo = $zip->statIndex($i);
        echo "<li>" . htmlspecialchars($fileInfo['name']) . "</li>";
    }

    if ($numFiles > 20) {
        echo "<li>... and " . ($numFiles - 20) . " more files</li>";
    }

    echo "</ul>";

} else {
    echo "<p style='color: red;'>L Failed to extract files!</p>";
}

echo "</div>";

// Close zip file
$zip->close();

// Check for common deployment files
$commonFiles = ['.htaccess', 'index.html', 'manifest.json', 'sw.js'];
echo "<h3>Checking deployment files:</h3>";
echo "<ul>";

foreach ($commonFiles as $file) {
    $filePath = $extractDir . '/' . $file;
    if (file_exists($filePath)) {
        echo "<li style='color: green;'> " . htmlspecialchars($file) . " - Found</li>";
    } else {
        echo "<li style='color: orange;'>� " . htmlspecialchars($file) . " - Not found</li>";
    }
}

echo "</ul>";

// Clean up - ask if user wants to delete the zip file
echo "<h3>Cleanup:</h3>";
echo "<p>Build.zip has been extracted. You may want to delete it to save space.</p>";
echo "<form method='post'>";
echo "<input type='hidden' name='cleanup' value='1'>";
echo "<button type='submit' style='background-color: #dc3545; color: white; padding: 10px 20px; border: none; cursor: pointer;'>Delete build.zip</button>";
echo "</form>";

// Handle cleanup
if ($_POST['cleanup'] == '1') {
    if (unlink($zipFile)) {
        echo "<p style='color: green;'> build.zip has been deleted successfully!</p>";
    } else {
        echo "<p style='color: red;'>L Failed to delete build.zip!</p>";
    }
}

// Add refresh link
echo "<hr>";
echo "<p><a href='" . htmlspecialchars($_SERVER['PHP_SELF']) . "'>Refresh this page</a></p>";

// Display completion message
if ($extractResult === true) {
    echo "<div style='background-color: #d4edda; color: #155724; padding: 15px; margin: 10px 0; border-radius: 5px;'>";
    echo "<h2><� Deployment Complete!</h2>";
    echo "<p>Your files have been extracted successfully. You can now access your application.</p>";
    echo "</div>";
}

?>