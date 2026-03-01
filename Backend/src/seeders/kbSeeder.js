/**
 * KB Data Seeder
 * Seeds initial categories, articles, and file records for the Knowledge Base platform.
 * Run: node src/seeders/kbSeeder.js
 */
const { KBCategory, KBArticle, KBFile, sequelize } = require('../models');

const CATEGORIES = [
    { name: 'Laporan Operasional', slug: 'laporan-operasional', description: 'Laporan unit cagar budaya, museum, dan galeri nasional', icon: 'Assessment', color: '#6366F1', order: 1 },
    { name: 'Laporan Keuangan', slug: 'laporan-keuangan', description: 'Data keuangan, anggaran, realisasi, dan audit', icon: 'TrendingUp', color: '#0EA5E9', order: 2 },
    { name: 'Policy & Regulasi', slug: 'policy-regulasi', description: 'Kebijakan, peraturan, dan panduan organisasi', icon: 'Gavel', color: '#F59E0B', order: 3 },
    { name: 'Museum & Cagar Budaya', slug: 'museum-cagar-budaya', description: 'Informasi museum, artefak, dan situs warisan budaya', icon: 'AccountBalance', color: '#10B981', order: 4 },
    { name: 'Rencana Strategi Bisnis', slug: 'rencana-strategi-bisnis', description: 'RSB, roadmap digitalisasi, dan visi misi IHA', icon: 'Lightbulb', color: '#8B5CF6', order: 5 },
    { name: 'Pendidikan & Pelatihan', slug: 'pendidikan-pelatihan', description: 'Materi pelatihan, SOP, dan panduan kerja lapangan', icon: 'School', color: '#EC4899', order: 6 },
];

const ARTICLES = [
    {
        categorySlug: 'laporan-operasional',
        title: 'Laporan Galeri Nasional Indonesia 2025',
        slug: 'laporan-galeri-nasional-indonesia-2025',
        summary: 'Laporan lengkap kegiatan operasional Galeri Nasional Indonesia sepanjang tahun 2025, mencakup pameran, koleksi, dan program edukasi.',
        content: `# Laporan Galeri Nasional Indonesia 2025

## Ringkasan Eksekutif
Galeri Nasional Indonesia telah menyelenggarakan berbagai program dan kegiatan sepanjang tahun 2025 yang bertujuan untuk melestarikan dan mempromosikan seni rupa Indonesia.

## Program Utama
- **Pameran Tetap**: Koleksi karya seni rupa Indonesia dari berbagai periode
- **Pameran Temporer**: 12 pameran temporer sepanjang tahun 2025
- **Program Edukasi**: Workshop seni untuk masyarakat umum dan pelajar
- **Konservasi**: Perawatan dan restorasi koleksi karya seni

## Statistik Pengunjung
| Bulan | Pengunjung | Pertumbuhan |
|-------|-----------|-------------|
| Jan | 15,200 | - |
| Feb | 14,800 | -2.6% |
| Mar | 18,500 | +25.0% |
| Apr | 20,100 | +8.6% |
| Mei | 22,300 | +10.9% |
| Jun | 19,700 | -11.7% |

## Catatan Penting
Galeri Nasional Indonesia terus berupaya meningkatkan aksesibilitas dan kualitas layanan publik melalui digitalisasi koleksi dan program virtual.`,
        tags: 'galeri nasional,seni rupa,pameran,edukasi,2025',
        status: 'published'
    },
    {
        categorySlug: 'laporan-operasional',
        title: 'Laporan Museum Basoeki Abdullah 2025',
        slug: 'laporan-museum-basoeki-abdullah-2025',
        summary: 'Laporan kegiatan Museum Basoeki Abdullah tahun 2025, meliputi koleksi, pameran, dan program pelestarian karya maestro.',
        content: `# Laporan Museum Basoeki Abdullah 2025

## Tentang Museum
Museum Basoeki Abdullah merupakan museum yang didedikasikan untuk melestarikan karya-karya pelukis maestro Indonesia, Basoeki Abdullah.

## Kegiatan Utama
1. **Pameran Karya Maestro**: Pameran tetap koleksi lukisan Basoeki Abdullah
2. **Residensi Seniman**: Program residensi untuk seniman muda Indonesia
3. **Lokakarya Seni**: Workshop melukis untuk komunitas
4. **Dokumentasi Digital**: Digitalisasi koleksi lukisan untuk arsip digital

## Koleksi
- Total koleksi: 152 karya lukis
- Karya yang telah didigitalisasi: 89 (58.5%)
- Karya dalam proses konservasi: 12

## Anggaran Operasional
| Pos Anggaran | Alokasi (Juta Rp) | Realisasi (Juta Rp) | % |
|---|---|---|---|
| Personil | 450 | 445 | 98.9% |
| Operasional | 280 | 265 | 94.6% |
| Konservasi | 150 | 142 | 94.7% |
| Program Edukasi | 120 | 118 | 98.3% |`,
        tags: 'museum basoeki abdullah,lukisan,maestro,konservasi,2025',
        status: 'published'
    },
    {
        categorySlug: 'laporan-operasional',
        title: 'Laporan Unit Cagar Budaya Sulawesi dan Maluku',
        slug: 'laporan-unit-cb-sulawesi-maluku',
        summary: 'Laporan kegiatan pelestarian cagar budaya di wilayah Sulawesi dan Maluku, termasuk inventarisasi dan pemeliharaan situs.',
        content: `# Laporan Unit Cagar Budaya Sulawesi dan Maluku

## Wilayah Kerja
Unit Cagar Budaya Sulawesi dan Maluku bertanggung jawab atas pelestarian situs-situs warisan budaya di wilayah Indonesia Timur.

## Kegiatan Utama
### Inventarisasi
- Situs yang terdata: 234 lokasi
- Situs baru teridentifikasi tahun ini: 18 lokasi
- Situs dalam kondisi kritis: 27 lokasi

### Pemeliharaan
- Program restorasi aktif: 8 situs
- Anggaran pemeliharaan: Rp 2.4 Miliar
- Realisasi anggaran: 92.5%

### Koordinasi
- Kerja sama dengan pemerintah daerah: 14 kabupaten/kota
- Pelatihan juru pelihara: 45 personil

## Tantangan
1. Aksesibilitas wilayah terpencil
2. Keterbatasan SDM terlatih di lapangan
3. Ancaman kerusakan akibat cuaca dan aktivitas manusia`,
        tags: 'cagar budaya,sulawesi,maluku,pelestarian,inventarisasi',
        status: 'published'
    },
    {
        categorySlug: 'laporan-operasional',
        title: 'Laporan Cagar Budaya Jawa Timur November 2025',
        slug: 'cagar-budaya-jawa-timur-nov-2025',
        summary: 'Laporan bulanan kegiatan pengelolaan cagar budaya di wilayah Jawa Timur bulan November 2025.',
        content: `# Cagar Budaya Jawa Timur — November 2025

## Ringkasan Bulanan
Laporan ini mencakup kegiatan pengelolaan dan pelestarian situs cagar budaya di seluruh wilayah Jawa Timur selama bulan November 2025.

## Situs Utama
- **Trowulan**: Pemeliharaan rutin area situs Majapahit
- **Candi Singosari**: Pembersihan dan dokumentasi periodik
- **Candi Jago**: Monitoring struktural pasca hujan
- **Museum Mpu Tantular**: Program edukasi dan pameran temporer

## Statistik
| Indikator | Nilai |
|-----------|-------|
| Situs diinspeksi | 42 |
| Laporan kondisi dibuat | 38 |
| Temuan kerusakan baru | 7 |
| Tindakan perbaikan | 5 |

## Kegiatan Edukasi
- Kunjungan sekolah ke situs cagar budaya: 12 kunjungan
- Peserta program edukasi: 480 siswa
- Sosialisasi pelestarian: 3 kegiatan`,
        tags: 'cagar budaya,jawa timur,trowulan,majapahit,singosari,november 2025',
        status: 'published'
    },
    {
        categorySlug: 'rencana-strategi-bisnis',
        title: 'Rencana Strategi Bisnis IHA-NDI',
        slug: 'rencana-strategi-bisnis-iha-ndi',
        summary: 'Dokumen Rencana Strategi Bisnis kerjasama Indonesian Heritage Agency dengan NDI untuk transformasi digital.',
        content: `# Rencana Strategi Bisnis IHA-NDI

## Visi
Mewujudkan pengelolaan warisan budaya Indonesia yang modern, efisien, dan berbasis teknologi digital.

## Misi
1. Digitalisasi seluruh aset warisan budaya Indonesia
2. Membangun platform knowledge management terintegrasi
3. Meningkatkan kapasitas SDM melalui pelatihan teknologi
4. Mengembangkan sistem monitoring dan evaluasi berbasis data

## Strategi Utama
### Tahun 1-2: Fondasi Digital
- Implementasi sistem OCR untuk digitalisasi dokumen
- Pembangunan Knowledge Base platform
- Pelatihan SDM inti

### Tahun 3-4: Ekspansi
- Integrasi data antar unit kerja
- Dashboard analitik eksekutif
- Mobile access untuk petugas lapangan

## Target KPI
| KPI | Target 2025 | Target 2026 |
|-----|-------------|-------------|
| Dokumen terdigitalisasi | 5,000 | 15,000 |
| User aktif platform | 50 | 200 |
| Uptime sistem | 95% | 99% |
| Kepuasan pengguna | 75% | 85% |`,
        tags: 'RSB,strategi bisnis,digitalisasi,NDI,IHA,transformasi digital',
        status: 'published'
    },
    {
        categorySlug: 'policy-regulasi',
        title: 'Panduan Inventarisasi Artefak Cagar Budaya',
        slug: 'panduan-inventarisasi-artefak',
        summary: 'Standar Operasional Prosedur (SOP) untuk inventarisasi dan dokumentasi artefak cagar budaya di seluruh unit kerja.',
        content: `# Panduan Inventarisasi Artefak Cagar Budaya

## Tujuan
Dokumen ini menyediakan panduan standar untuk proses inventarisasi artefak cagar budaya yang dilakukan oleh seluruh unit kerja IHA.

## Proses Inventarisasi
### 1. Identifikasi Awal
- Verifikasi lokasi temuan
- Dokumentasi foto minimal 4 sisi
- Pencatatan koordinat GPS

### 2. Registrasi
- Pemberian nomor inventaris sesuai standar nasional
- Input ke sistem database pusat
- Klasifikasi jenis artefak

### 3. Dokumentasi Detail
- Pengukuran dimensi (panjang, lebar, tinggi, berat)
- Deskripsi kondisi fisik
- Fotografi profesional untuk arsip digital

### 4. Penyimpanan
- Penempatan di gudang penyimpanan sesuai standar
- Pengendalian suhu dan kelembaban
- Label dan penandaan fisik

## Peralatan Wajib
- GPS handheld
- Kamera DSLR dengan lensa makro
- Meteran laser
- Form inventarisasi (digital/cetak)
- Alat keamanan diri (sarung tangan, masker)`,
        tags: 'SOP,inventarisasi,artefak,cagar budaya,panduan,dokumentasi',
        status: 'published'
    },
    {
        categorySlug: 'museum-cagar-budaya',
        title: 'Profil Museum dan Cagar Budaya di Bawah IHA',
        slug: 'profil-museum-cagar-budaya-iha',
        summary: 'Daftar lengkap museum dan situs cagar budaya yang berada di bawah pengelolaan Indonesian Heritage Agency.',
        content: `# Profil Museum dan Cagar Budaya di Bawah IHA

## Museum
1. **Galeri Nasional Indonesia** — Jakarta
   - Koleksi: 1,770+ karya seni rupa
   - Fokus: Seni rupa modern dan kontemporer Indonesia

2. **Museum Basoeki Abdullah** — Jakarta
   - Koleksi: 152 karya lukis maestro
   - Fokus: Karya Basoeki Abdullah dan seni rupa klasik

3. **Museum Benteng Vredeburg** — Yogyakarta
   - Koleksi: Diorama dan artefak perjuangan
   - Fokus: Sejarah perjuangan kemerdekaan

## Unit Pelestarian Cagar Budaya
| Unit | Wilayah Kerja | Jumlah Situs |
|------|--------------|-------------|
| BPCB Jawa Timur | Jawa Timur | 340+ |
| BPCB Sulawesi & Maluku | Indonesia Timur | 234 |
| BPCB Jawa Tengah | Jawa Tengah & DIY | 520+ |
| BPCB Bali & NTB | Bali, NTB | 180+ |

## Aset Digital
- Total dokumen terdigitalisasi: 8,400+
- Database artefak: 12,500+ item
- Foto arsip digital: 45,000+ gambar`,
        tags: 'museum,cagar budaya,galeri nasional,basoeki abdullah,vredeburg,profil',
        status: 'published'
    }
];

const FILES = [
    { fileName: 'Laporan Galeri Nasional Indonesia 2025.pdf', filePath: 'kb-files/Laporan Galeri Nasional Indonesia 2025.pdf', fileSize: '2.4 MB', fileType: 'pdf', categorySlug: 'laporan-operasional', description: 'Laporan lengkap kegiatan Galeri Nasional Indonesia tahun 2025' },
    { fileName: 'Laporan Museum Basoeki Abdullah 2025.pdf', filePath: 'kb-files/Laporan Museum Basoeki Abdullah 2025.pdf', fileSize: '1.8 MB', fileType: 'pdf', categorySlug: 'laporan-operasional', description: 'Laporan kegiatan Museum Basoeki Abdullah tahun 2025' },
    { fileName: 'LAPORAN UNIT CB SULAWESI DAN MALUKU.pdf', filePath: 'kb-files/LAPORAN UNIT CB SULAWESI DAN MALUKU.pdf', fileSize: '3.1 MB', fileType: 'pdf', categorySlug: 'laporan-operasional', description: 'Laporan unit cagar budaya Sulawesi dan Maluku' },
    { fileName: 'CAGAR BUDAYA JAWA TIMUR nov 25.pdf', filePath: 'kb-files/CAGAR BUDAYA JAWA TIIMUR nov 25.pdf', fileSize: '2.7 MB', fileType: 'pdf', categorySlug: 'laporan-operasional', description: 'Laporan cagar budaya Jawa Timur November 2025' },
    { fileName: 'Rencana Strategi Bisnis IHA_NDI V1.0.pdf', filePath: 'kb-files/Rencana Strategi Bisnis IHA_NDI V1.0.pdf', fileSize: '4.5 MB', fileType: 'pdf', categorySlug: 'rencana-strategi-bisnis', description: 'Dokumen RSB kerjasama IHA-NDI' },
    { fileName: 'IHA - Digitalisasi.pdf', filePath: 'kb-files/IHA - Digitalisasi.pdf', fileSize: '960 KB', fileType: 'pdf', categorySlug: 'rencana-strategi-bisnis', description: 'Dokumen digitalisasi IHA' },
];

const seedKB = async () => {
    try {
        console.log('🌱 Seeding Knowledge Base data...');

        // Ensure KB tables exist (safety net if main sync missed them)
        await KBCategory.sync();
        await KBArticle.sync();
        await KBFile.sync();

        // Seed categories
        for (const cat of CATEGORIES) {
            await KBCategory.findOrCreate({
                where: { slug: cat.slug },
                defaults: cat
            });
        }
        console.log(`  ✅ ${CATEGORIES.length} categories seeded`);

        // Get category map
        const allCats = await KBCategory.findAll();
        const catMap = {};
        allCats.forEach(c => { catMap[c.slug] = c.id; });

        // Seed articles
        for (const art of ARTICLES) {
            const categoryId = catMap[art.categorySlug];
            if (!categoryId) continue;
            await KBArticle.findOrCreate({
                where: { slug: art.slug },
                defaults: { ...art, categoryId, categorySlug: undefined }
            });
        }
        console.log(`  ✅ ${ARTICLES.length} articles seeded`);

        // Seed files
        for (const file of FILES) {
            const categoryId = catMap[file.categorySlug] || null;
            await KBFile.findOrCreate({
                where: { fileName: file.fileName },
                defaults: { ...file, categoryId, categorySlug: undefined }
            });
        }
        console.log(`  ✅ ${FILES.length} files seeded`);

        console.log('🎉 KB seeding complete!');
    } catch (error) {
        console.error('❌ KB seeding error:', error.message);
    }
};

module.exports = { seedKB };

// Run directly
if (require.main === module) {
    seedKB().then(() => process.exit(0));
}
