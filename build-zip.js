import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pastikan folder .output ada
const outputDir = path.join(__dirname, '.output');
if (!fs.existsSync(outputDir)) {
  console.error('Folder .output tidak ditemukan. Jalankan nuxt generate terlebih dahulu.');
  process.exit(1);
}

// Pastikan folder .output/public ada
const publicDir = path.join(outputDir, 'public');
if (!fs.existsSync(publicDir)) {
  console.error('Folder .output/public tidak ditemukan. Jalankan nuxt generate terlebih dahulu.');
  process.exit(1);
}

// Buat zip file
const zipPath = path.join(outputDir, 'build.zip');
const output = fs.createWriteStream(zipPath);
const archive = archiver('zip', {
  zlib: { level: 9 } // Kompresi maksimal
});

// Event listeners
output.on('close', function() {
  console.log(`✅ Build berhasil dibuat: ${zipPath}`);
  console.log(`📦 Total ukuran: ${archive.pointer()} bytes`);
});

archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('⚠️ Warning:', err.message);
  } else {
    throw err;
  }
});

archive.on('error', function(err) {
  console.error('❌ Error saat membuat zip:', err.message);
  throw err;
});

// Pipe archive data ke file output
archive.pipe(output);

// Tambahkan semua file dari .output/public ke zip
console.log('📁 Menambahkan file dari .output/public...');
archive.directory(publicDir, false);

// Finalisasi archive
archive.finalize();