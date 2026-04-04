import ftp from "basic-ftp"
import fs from "fs"
import dotenv from "dotenv"
import https from "https"

// load env dari .env.production
dotenv.config({ path: ".env.production" })

async function upload() {
    const client = new ftp.Client()
    client.ftp.verbose = true

    const localFile = ".output/build.zip"
    const remoteFile = "public_html/build.zip"

    // validasi file
    if (!fs.existsSync(localFile)) {
        console.error("❌ build.zip tidak ditemukan di .output/")
        process.exit(1)
    }

    try {
        console.log("🔌 Connecting to FTP...")

        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASS,
            secure: false // biasanya DirectAdmin tidak pakai SSL FTP
        })

        console.log("✅ Connected")

        console.log("📤 Uploading build.zip ...")
        await client.uploadFrom(localFile, remoteFile)

        console.log("🚀 Upload selesai")

        // trigger extract.php
        if (process.env.EXTRACT_URL) {
            console.log("⚙️ Trigger extract.php ...")

            https.get(process.env.EXTRACT_URL, (res) => {
                console.log("✅ Extract response:", res.statusCode)
            }).on("error", (err) => {
                console.error("❌ Gagal trigger extract:", err.message)
            })
        }

    } catch (err) {
        console.error("❌ Upload gagal:", err.message)
        process.exit(1)
    }

    client.close()
}

upload()