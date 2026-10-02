const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const sampleDir = path.join(__dirname, '..', 'sample', 'dokumen-kontrak');

// Ensure directory exists
if (!fs.existsSync(sampleDir)) {
    fs.mkdirSync(sampleDir, { recursive: true });
}

const generatePDF = (filename, title, content) => {
    const doc = new PDFDocument({ margin: 50 });
    const filePath = path.join(sampleDir, filename);
    const writeStream = fs.createWriteStream(filePath);
    
    doc.pipe(writeStream);
    
    // Header
    doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown();
    
    // Content
    doc.fontSize(12).font('Helvetica').text(content, {
        align: 'justify',
        lineGap: 4
    });
    
    // Signatures
    doc.moveDown(4);
    doc.text('Pihak Pertama', 50, doc.y);
    doc.text('Pihak Kedua', 400, doc.y - 14);
    
    doc.moveDown(4);
    doc.text('(_________________)', 50, doc.y);
    doc.text('(_________________)', 400, doc.y - 14);
    
    doc.end();
    
    return new Promise((resolve) => {
        writeStream.on('finish', () => resolve(filePath));
    });
};

const dateStr = (date) => {
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const today = new Date();
const lastYear = new Date(today); lastYear.setFullYear(today.getFullYear() - 1);
const nextYear = new Date(today); nextYear.setFullYear(today.getFullYear() + 1);
const threeYearsAgo = new Date(today); threeYearsAgo.setFullYear(today.getFullYear() - 3);

async function createSamples() {
    console.log('Generating sample documents...');
    
    // 1. NDA Active
    await generatePDF('01_NDA_Aktif.pdf', 'NON-DISCLOSURE AGREEMENT (NDA)',
`Perjanjian Kerahasiaan (Non-Disclosure Agreement) ini ("Perjanjian") dibuat pada tanggal ${dateStr(lastYear)}, oleh dan antara:

1. PT National Data Integrator, sebuah perusahaan yang didirikan berdasarkan hukum Indonesia, berkedudukan di Jakarta ("Pihak Pertama").
2. PT Inovasi Sistem Terpadu, sebuah perusahaan teknologi berbasis di Bandung ("Pihak Kedua").

OBJEK PERJANJIAN:
Pihak Pertama bermaksud untuk membagikan informasi rahasia mengenai arsitektur sistem integrasi data terbaru kepada Pihak Kedua untuk tujuan audit keamanan dan penjajakan integrasi API. Pihak Kedua wajib menjaga kerahasiaan seluruh informasi yang diberikan.

KEWAJIBAN PIHAK KEDUA:
1. Tidak menyebarluaskan, menyalin, atau memberikan informasi rahasia kepada pihak ketiga manapun tanpa izin tertulis.
2. Menggunakan informasi rahasia tersebut semata-mata untuk tujuan audit sistem dan uji coba integrasi.
3. Menghapus seluruh salinan data uji setelah masa perjanjian berakhir.

MASA BERLAKU:
Perjanjian ini mulai berlaku sejak ditandatangani pada ${dateStr(lastYear)} dan akan terus berlaku hingga tanggal ${dateStr(nextYear)} (Tanggal Berakhir). Setelah masa berlaku habis, seluruh kewajiban kerahasiaan tetap melekat selama 5 tahun ke depan.`);

    // 2. Kontrak Expired
    await generatePDF('02_Perjanjian_Kerjasama_Expired.pdf', 'PERJANJIAN KERJASAMA KEMITRAAN (MoU)',
`Perjanjian Kerjasama ini dibuat pada tanggal ${dateStr(threeYearsAgo)}, antara:

1. PT National Data Integrator, sebuah penyedia solusi manajemen data di Jakarta ("Pihak Pertama").
2. PT Solusi Infrastruktur Awan, penyedia layanan cloud hosting di Surabaya ("Pihak Kedua").

OBJEK PERJANJIAN:
Pihak Pertama dan Pihak Kedua sepakat untuk melakukan kerja sama dalam penyediaan infrastruktur server khusus untuk klien pemerintahan.

POIN-POIN PENTING & KEWAJIBAN:
1. Pihak Pertama bertugas mengembangkan perangkat lunak dan dashboard analitik.
2. Pihak Kedua wajib menyediakan server dengan uptime 99.9% dan sistem failover.
3. Segala bentuk kegagalan server yang menyebabkan hilangnya data menjadi tanggung jawab penuh Pihak Kedua.

MASA BERLAKU:
Perjanjian kerjasama ini berlaku selama dua tahun, yang dihitung mulai tanggal ${dateStr(threeYearsAgo)} (Tanggal Mulai) dan telah disepakati akan berakhir pada tanggal ${dateStr(lastYear)} (Tanggal Berakhir). Segala perpanjangan kontrak harus disepakati secara tertulis oleh kedua belah pihak sebelum tanggal berakhir.`);

    // 3. Perpetual Contract
    await generatePDF('03_Lisensi_Software_Perpetual.pdf', 'PERJANJIAN LISENSI PERANGKAT LUNAK',
`Perjanjian Lisensi ini dibuat pada tanggal ${dateStr(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000))}, antara:

1. PT National Data Integrator, berkedudukan di Jakarta ("Pihak Pertama" selaku Pemberi Lisensi).
2. PT Data Analitik Ventura ("Pihak Kedua" selaku Penerima Lisensi).

OBJEK PERJANJIAN:
Pihak Pertama memberikan lisensi penggunaan perangkat lunak "NDI Synchro Engine V3" kepada Pihak Kedua untuk kebutuhan internal perusahaan.

KEWAJIBAN:
1. Pihak Kedua berhak menginstal software pada lingkungan server internal Pihak Kedua.
2. Pihak Kedua dilarang membongkar (reverse engineering), menjual kembali, atau menyewakan perangkat lunak tersebut kepada pihak ketiga.
3. Pihak Pertama akan menyuplai pembaruan keamanan otomatis.

MASA BERLAKU:
Perjanjian lisensi ini mulai berlaku sejak tanggal ${dateStr(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000))}. Lisensi ini diberikan secara permanen (perpetual) dan berlaku selamanya tanpa ada batasan waktu berakhir, selama Pihak Kedua tidak melanggar ketentuan yang telah ditetapkan.`);

    // Hapus file PKWT lama jika ada
    const oldFile = path.join(sampleDir, '02_Kontrak_Kerja_Expired.pdf');
    if (fs.existsSync(oldFile)) {
        fs.unlinkSync(oldFile);
    }


    console.log('Sample documents created successfully in: ' + sampleDir);
}

createSamples().catch(console.error);
