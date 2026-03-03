/**
 * KB Data Seeder — Enriched with IHA Document Data
 * Seeds categories, articles, and file records for the Knowledge Base platform.
 */
const { KBCategory, KBArticle, KBFile, sequelize } = require('../models');

const CATEGORIES = [
    { name: 'Laporan Operasional', slug: 'laporan-operasional', description: 'Laporan unit cagar budaya, museum, dan galeri nasional', icon: 'Assessment', color: '#6366F1', order: 1 },
    { name: 'Laporan Keuangan', slug: 'laporan-keuangan', description: 'Data keuangan, anggaran, realisasi, dan audit organisasi', icon: 'TrendingUp', color: '#0EA5E9', order: 2 },
    { name: 'Policy & Regulasi', slug: 'policy-regulasi', description: 'Kebijakan, peraturan, dan panduan organisasi', icon: 'Gavel', color: '#F59E0B', order: 3 },
    { name: 'Museum & Galeri', slug: 'museum-galeri', description: 'Informasi museum, galeri, artefak, dan koleksi warisan budaya', icon: 'AccountBalance', color: '#10B981', order: 4 },
    { name: 'Cagar Budaya', slug: 'cagar-budaya', description: 'Pelestarian, inventarisasi, dan pemeliharaan situs cagar budaya', icon: 'FolderOpen', color: '#8B5CF6', order: 5 },
    { name: 'Rencana Strategi Bisnis', slug: 'rencana-strategi-bisnis', description: 'RSB, roadmap digitalisasi, dan visi misi IHA-NDI', icon: 'Lightbulb', color: '#EC4899', order: 6 },
    { name: 'Konservasi & Laboratorium', slug: 'konservasi-laboratorium', description: 'Kegiatan konservasi, restorasi, dan laboratorium pelestarian', icon: 'School', color: '#14B8A6', order: 7 },
    { name: 'Data & Informasi', slug: 'data-informasi', description: 'Tim data, sistem informasi, dan pengelolaan database', icon: 'Assessment', color: '#F97316', order: 8 },
    { name: 'Hukum & Advokasi', slug: 'hukum-advokasi', description: 'Aspek hukum, advokasi, dan perlindungan cagar budaya', icon: 'Gavel', color: '#EF4444', order: 9 },
    { name: 'Pemasaran & Pemanfaatan Aset', slug: 'pemasaran-aset', description: 'Pengembangan bisnis, pemasaran, dan pemanfaatan aset MCB', icon: 'TrendingUp', color: '#84CC16', order: 10 },
];

const ARTICLES = [
    // ============ MUSEUM & GALERI ============
    {
        categorySlug: 'museum-galeri',
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

## Koleksi & Digitalisasi
- Total koleksi: 1,770+ karya seni rupa
- Koleksi terdigitalisasi: 68%
- Fokus: Seni rupa modern dan kontemporer Indonesia

## Catatan Penting
Galeri Nasional Indonesia terus berupaya meningkatkan aksesibilitas dan kualitas layanan publik melalui digitalisasi koleksi dan program virtual.`,
        tags: 'galeri nasional,seni rupa,pameran,edukasi,2025',
        status: 'published'
    },
    {
        categorySlug: 'museum-galeri',
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
        categorySlug: 'museum-galeri',
        title: 'Laporan Museum Nasional Indonesia 2025',
        slug: 'laporan-museum-nasional-indonesia-2025',
        summary: 'Laporan komprehensif Museum Nasional Indonesia (Museum Gajah) tahun 2025, mencakup pengelolaan koleksi, pameran, dan layanan publik.',
        content: `# Laporan Museum Nasional Indonesia 2025

## Profil Museum
Museum Nasional Indonesia, dikenal juga sebagai Museum Gajah, merupakan museum tertua dan terbesar di Indonesia. Museum ini menyimpan koleksi arkeologi, sejarah, etnografi, dan geografi.

## Pencapaian 2025
- **Koleksi Terkelola**: 141,000+ artefak dan benda bersejarah
- **Digitalisasi Koleksi**: 32,000+ item berhasil difoto dan dikatalogkan secara digital
- **Pengunjung Tahunan**: 285,000 pengunjung (naik 12% dari 2024)
- **Pameran Temporer**: 8 pameran tematik diselenggarakan

## Program Unggulan
1. **Museum Goes Digital** — Platform virtual tour dan katalog online
2. **Night at the Museum** — Program kunjungan malam untuk masyarakat umum
3. **Heritage Edu** — Program edukasi untuk 450+ sekolah se-Jabodetabek
4. **Konservasi Preventif** — Monitoring kondisi koleksi berbasis IoT

## Status Renovasi
Proyek renovasi Gedung A Museum Nasional pasca kebakaran terus berlanjut dengan target penyelesaian akhir 2026.`,
        tags: 'museum nasional,museum gajah,arkeologi,etnografi,koleksi,2025',
        status: 'published'
    },
    {
        categorySlug: 'museum-galeri',
        title: 'Museum Kepresidenan RI Balai Kirti — Program Kerja 2025-2026',
        slug: 'museum-kepresidenan-balai-kirti-2025',
        summary: 'Laporan program kerja Museum Kepresidenan Republik Indonesia Balai Kirti, Bogor, untuk periode 2025-2026.',
        content: `# Museum Kepresidenan RI Balai Kirti
## Program Kerja 2025-2026

## Tentang Museum
Museum Kepresidenan Balai Kirti berlokasi di dalam kompleks Istana Kepresidenan Bogor. Museum ini menyajikan sejarah kepresidenan Indonesia dari Presiden pertama hingga saat ini.

## Program Prioritas
### 1. Pengelolaan Koleksi
- Inventarisasi ulang seluruh artefak kepresidenan
- Konservasi preventif koleksi benda bersejarah
- Digitalisasi dokumen dan foto kepresidenan

### 2. Pameran & Edukasi
- Pameran tetap: Sejarah 7 Presiden RI
- Program "Mengenal Presidenmu" untuk pelajar
- Virtual tour untuk masyarakat di luar Bogor

### 3. Pengembangan Fasilitas
- Peningkatan sistem keamanan dan CCTV
- Renovasi ruang pameran interaktif
- Pengembangan audio guide multilingual

## Target KPI
| Indikator | Target 2025 | Target 2026 |
|-----------|-------------|-------------|
| Pengunjung | 120,000 | 150,000 |
| Koleksi terdigitalisasi | 75% | 95% |
| Program edukasi | 24 sesi | 36 sesi |
| Kepuasan pengunjung | 85% | 90% |`,
        tags: 'museum kepresidenan,balai kirti,bogor,presiden,sejarah,2025',
        status: 'published'
    },
    {
        categorySlug: 'museum-galeri',
        title: 'Museum Semedo — Laporan November 2025',
        slug: 'museum-semedo-november-2025',
        summary: 'Laporan bulanan Museum Semedo November 2025, meliputi temuan arkeologi dan program pelestarian situs prasejarah.',
        content: `# Museum Semedo — November 2025

## Profil Situs
Museum Semedo terletak di Kabupaten Tegal, Jawa Tengah. Situs ini dikenal sebagai lokasi penemuan fosil dan artefak prasejarah yang signifikan.

## Kegiatan November 2025
- **Ekskavasi Lanjutan**: Penggalian area sektor B menghasilkan 23 temuan artefak baru
- **Identifikasi Fosil**: 8 sampel fosil dikirim ke laboratorium untuk analisis karbon
- **Edukasi Publik**: 6 kelompok sekolah (240 siswa) mengunjungi museum
- **Konservasi In-Situ**: Perawatan area temuan untuk mencegah erosi

## Temuan Penting
- Fragmen alat batu berusia estimasi 700,000 tahun
- Fosil hewan vertebrata yang belum teridentifikasi
- Struktur tanah yang mengindikasikan pemukiman purba

## Kolaborasi
- Universitas Gadjah Mada — Analisis geologi
- BRIN — Penentuan usia karbon
- Pemerintah Kabupaten Tegal — Pendanaan operasional`,
        tags: 'museum semedo,tegal,prasejarah,fosil,arkeologi,november 2025',
        status: 'published'
    },
    {
        categorySlug: 'museum-galeri',
        title: 'Museum Song Terus — Laporan MCB Unit Museum November 2025',
        slug: 'song-terus-mcb-november-2025',
        summary: 'Laporan MCB Unit Museum Song Terus November 2025, situs gua prasejarah di Pacitan dengan temuan arkeologi signifikan.',
        content: `# Song Terus — MCB Unit Museum November 2025

## Tentang Situs
Song Terus adalah situs gua prasejarah yang terletak di Pacitan, Jawa Timur. Situs ini merupakan salah satu lokasi paling penting untuk studi kehidupan manusia purba di Asia Tenggara.

## Aktivitas November 2025
### Penelitian
- Ekskavasi lapisan stratigrafi kedalaman 4-6 meter
- Ditemukan 45 artefak alat batu (flakes, core, scraper)
- Sampling sedimen untuk analisis paleoenvironmental

### Museum & Pameran
- Pengunjung museum: 1,850 orang
- Pameran temporer: "Jejak Manusia Purba Pacitan"
- Workshop edukasi untuk 3 sekolah lokal

### Konservasi
- Monitoring kelembaban gua: stabil di 78-82%
- Pemasangan sensor temperatur di 6 titik
- Perawatan jalur pengunjung untuk minimalisir dampak

## Koleksi Utama
| Jenis Temuan | Jumlah | Periode Estimasi |
|---|---|---|
| Alat batu | 2,340+ | 60,000-500,000 BP |
| Fragmen tulang | 890+ | Pleistosen |
| Artefak logam | 45 | 2,000-3,000 BP |`,
        tags: 'song terus,pacitan,prasejarah,gua,arkeologi,paleontologi',
        status: 'published'
    },

    // ============ CAGAR BUDAYA ============
    {
        categorySlug: 'cagar-budaya',
        title: 'Laporan Unit CB Sulawesi dan Maluku',
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
        categorySlug: 'cagar-budaya',
        title: 'Cagar Budaya Jawa Timur — November 2025',
        slug: 'cagar-budaya-jawa-timur-nov-2025',
        summary: 'Laporan bulanan pengelolaan cagar budaya di wilayah Jawa Timur bulan November 2025.',
        content: `# Cagar Budaya Jawa Timur — November 2025

## Ringkasan Bulanan
Laporan ini mencakup kegiatan pengelolaan dan pelestarian situs cagar budaya di seluruh wilayah Jawa Timur.

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
- Kunjungan sekolah: 12 kunjungan, 480 siswa
- Sosialisasi pelestarian: 3 kegiatan`,
        tags: 'cagar budaya,jawa timur,trowulan,majapahit,singosari,november 2025',
        status: 'published'
    },
    {
        categorySlug: 'cagar-budaya',
        title: 'CB Sumatera, Banten, dan Jawa Barat — November 2025',
        slug: 'cb-sumatera-banten-jabar-nov-2025',
        summary: 'Laporan kegiatan unit cagar budaya wilayah Sumatera, Banten, dan Jawa Barat periode November 2025.',
        content: `# Cagar Budaya Sumatera, Banten & Jawa Barat — November 2025

## Cakupan Wilayah
Unit ini mengelola situs cagar budaya di tiga wilayah: Sumatera, Banten, dan Jawa Barat, dengan total ratusan situs terdaftar.

## Highlights November 2025

### Sumatera
- Monitoring Benteng Marlborough, Bengkulu
- Dokumentasi Rumah Gadang di Sumatera Barat (34 unit)
- Survei situs megalitik Pagaralam, Sumatera Selatan

### Banten
- Pemeliharaan Situs Banten Lama
- Kerja sama dengan UIN Sultan Maulana Hasanuddin
- Sosialisasi pelestarian CB ke masyarakat lokal

### Jawa Barat
- Inventarisasi situs di wilayah Bandung Raya (58 situs)
- Restorasi Gedung Sate — pendampingan teknis
- Program "Heritage Walk" Kota Lama Cirebon

## Rekapitulasi
| Wilayah | Situs Terdaftar | Inspeksi Bulan Ini | Tindakan |
|---------|----------------|-------------------|----------|
| Sumatera | 156 | 28 | 12 |
| Banten | 67 | 15 | 8 |
| Jawa Barat | 203 | 42 | 18 |`,
        tags: 'cagar budaya,sumatera,banten,jawa barat,pelestarian,november 2025',
        status: 'published'
    },
    {
        categorySlug: 'cagar-budaya',
        title: 'Unit CB Wilayah Jawa Tengah',
        slug: 'unit-cb-jawa-tengah',
        summary: 'Laporan kegiatan pelestarian cagar budaya wilayah Jawa Tengah, mencakup candi, situs, dan program edukasi.',
        content: `# Unit Cagar Budaya Wilayah Jawa Tengah

## Profil Unit
Unit CB Jawa Tengah mengelola beberapa situs warisan budaya paling penting di Indonesia, termasuk situs-situs peninggalan Hindu-Buddha.

## Situs Utama
1. **Candi Borobudur** (koordinasi dengan BKB)
2. **Candi Prambanan** — Kompleks candi Hindu terbesar
3. **Candi Gedong Songo** — 9 candi di lereng Gunung Ungaran
4. **Situs Sangiran** — Situs Warisan Dunia UNESCO
5. **Keraton Surakarta** — Pusat kebudayaan Jawa

## Data Operasional
| Metrik | Jumlah |
|--------|--------|
| Total situs terdaftar | 520+ |
| Situs UNESCO | 3 |
| Juru pelihara aktif | 85 orang |
| Anggaran tahunan | Rp 8.5 Miliar |
| Pengunjung (semua situs) | 4.2 juta/tahun |

## Program Prioritas
- Digitalisasi 3D Candi Prambanan menggunakan LiDAR
- Program "Adopt a Heritage" bersama korporasi
- Pelatihan juru pelihara dengan sertifikasi nasional`,
        tags: 'cagar budaya,jawa tengah,borobudur,prambanan,sangiran,unesco',
        status: 'published'
    },
    {
        categorySlug: 'cagar-budaya',
        title: 'MCB — CB Unit DIY 2025',
        slug: 'mcb-cb-unit-diy-2025',
        summary: 'Laporan Manajemen Cagar Budaya unit Daerah Istimewa Yogyakarta tahun 2025.',
        content: `# MCB — CB Unit DIY 2025

## Wilayah Kerja
Unit CB DIY mengelola situs cagar budaya di seluruh wilayah Daerah Istimewa Yogyakarta, termasuk kawasan Keraton, Taman Sari, dan berbagai situs peninggalan.

## Pencapaian 2025
- **Situs dikelola**: 178 lokasi
- **Restorasi selesai**: 14 situs
- **Digitalisasi**: 67% situs sudah terdokumentasi digital
- **Pelatihan SDM**: 32 personil mendapat sertifikasi

## Situs Prioritas
1. Kompleks Keraton Yogyakarta
2. Taman Sari (Water Castle)
3. Makam Raja-Raja Imogiri
4. Situs Ratu Boko
5. Candi Kalasan

## Kolaborasi
- Pemerintah DIY — Regulasi perlindungan
- UGM & UNY — Penelitian arkeologi
- UNESCO — Monitoring situs warisan dunia
- Komunitas lokal — Program juru pelihara sukarela`,
        tags: 'cagar budaya,diy,yogyakarta,keraton,taman sari,ratu boko',
        status: 'published'
    },
    {
        categorySlug: 'cagar-budaya',
        title: 'MINHA MCB 2025',
        slug: 'minha-mcb-2025',
        summary: 'Laporan Manajemen Indonesian Heritage Agency MCB 2025, overview pengelolaan cagar budaya secara nasional.',
        content: `# MINHA MCB 2025
## Overview Pengelolaan Cagar Budaya Nasional

## Visi
Mewujudkan pengelolaan warisan budaya Indonesia yang terintegrasi, berkelanjutan, dan berbasis teknologi.

## Data Nasional
| Metrik | Jumlah |
|--------|--------|
| Total situs CB terdaftar | 3,200+ |
| Museum di bawah IHA | 12 |
| Juru pelihara nasional | 450+ |
| Unit CB wilayah | 8 unit |
| Anggaran nasional | Rp 85 Miliar |

## Program Strategis 2025
1. **Digitalisasi Nasional** — Target 80% situs terdigitalisasi
2. **Synchro Scan Integration** — OCR untuk arsip dokumen lama
3. **Knowledge Base Platform** — Pusat pengetahuan terintegrasi
4. **Mobile Inspection** — Aplikasi inspeksi lapangan

## Tantangan Nasional
- Distribusi SDM tidak merata antar wilayah
- Ancaman pembangunan di sekitar situs CB
- Perubahan iklim mengancam situs pantai dan gua
- Pendanaan terbatas untuk restorasi menyeluruh`,
        tags: 'minha,mcb,nasional,cagar budaya,iha,2025',
        status: 'published'
    },
    {
        categorySlug: 'cagar-budaya',
        title: 'Wardun Borobudur 2025',
        slug: 'wardun-borobudur-2025',
        summary: 'Laporan Warisan Dunia (Wardun) Borobudur 2025, monitoring dan pelestarian situs UNESCO.',
        content: `# Wardun Borobudur 2025

## Status UNESCO
Candi Borobudur dikukuhkan sebagai Situs Warisan Dunia UNESCO sejak 1991. Pengelolaannya berada di bawah koordinasi BKB dan IHA.

## Monitoring 2025
### Kondisi Struktural
- Inspeksi rutin: 4x per tahun
- Sensor monitoring: 128 titik aktif
- Pertumbuhan lumut: terkendali di 15% permukaan

### Pengunjung
| Bulan | Domestik | Internasional | Total |
|-------|----------|---------------|-------|
| Jan | 125,000 | 28,000 | 153,000 |
| Feb | 98,000 | 32,000 | 130,000 |
| Mar | 145,000 | 35,000 | 180,000 |
| Apr | 168,000 | 41,000 | 209,000 |

## Program Pelestarian
1. **Pembersihan Berkala** — Pembersihan relief dengan teknik khusus
2. **Drainage Improvement** — Perbaikan sistem drainase candi
3. **Visitor Management** — Pembatasan kapasitas 1,200 orang/waktu
4. **Research Program** — Kerja sama dengan 6 universitas internasional

## Rekomendasi UNESCO
- Penguatan buffer zone di sekitar candi
- Peningkatan interpretasi budaya untuk pengunjung
- Pengembangan pusat riset Borobudur`,
        tags: 'borobudur,wardun,unesco,warisan dunia,pelestarian,monitoring',
        status: 'published'
    },

    // ============ LAPORAN OPERASIONAL ============
    {
        categorySlug: 'laporan-operasional',
        title: 'Laporan Komitra 2025',
        slug: 'laporan-komitra-2025',
        summary: 'Laporan kegiatan Komite Mitigasi dan Penanggulangan Risiko (Komitra) IHA tahun 2025.',
        content: `# Laporan Komitra 2025
## Komite Mitigasi dan Penanggulangan Risiko

## Mandat
Komitra bertanggung jawab atas identifikasi, mitigasi, dan penanganan risiko terhadap aset cagar budaya dan museum di bawah pengelolaan IHA.

## Kegiatan 2025
### Identifikasi Risiko
- Pemetaan risiko bencana alam: 320 situs
- Penilaian kerentanan struktural: 45 bangunan cagar budaya
- Audit keamanan museum: 12 museum

### Mitigasi
- Pelatihan tanggap darurat: 8 lokasi, 240 personil
- Simulasi evakuasi koleksi: 4 museum
- Pemasangan sistem deteksi kebakaran: 6 lokasi baru

### Respons Insiden
| Jenis Insiden | Jumlah | Status |
|---|---|---|
| Banjir/longsor | 5 | 4 tertangani |
| Vandalisme | 3 | Semua tertangani |
| Kebakaran | 1 | Tertangani, evaluasi |
| Pencurian artefak | 2 | Dalam investigasi |`,
        tags: 'komitra,mitigasi,risiko,bencana,keamanan,2025',
        status: 'published'
    },
    {
        categorySlug: 'laporan-operasional',
        title: 'Laporan MRB 2025',
        slug: 'laporan-mrb-2025',
        summary: 'Laporan Manajemen Risiko Bisnis (MRB) IHA tahun 2025, mencakup evaluasi risiko operasional dan strategis.',
        content: `# Laporan MRB 2025
## Manajemen Risiko Bisnis

## Tujuan
Mengevaluasi dan mendokumentasikan risiko bisnis yang dihadapi IHA dalam pengelolaan warisan budaya dan operasional organisasi.

## Kategori Risiko
### Risiko Operasional
- Keterbatasan SDM terlatih di 45% unit kerja
- Infrastruktur IT membutuhkan peningkatan di 60% lokasi
- Standarisasi prosedur kerja belum merata

### Risiko Finansial
- Ketergantungan pada anggaran pemerintah: 85%
- Potensi pendapatan mandiri belum teroptimalkan
- Biaya pemeliharaan meningkat 12% per tahun

### Risiko Strategis
- Transformasi digital membutuhkan investasi besar
- Kompetisi dengan pengelola wisata swasta
- Regulasi yang terus berubah

## Rekomendasi
1. Diversifikasi sumber pendapatan
2. Akselerasi digitalisasi operasional
3. Peningkatan kapasitas SDM melalui pelatihan intensif
4. Penguatan kerja sama dengan sektor swasta`,
        tags: 'mrb,manajemen risiko,bisnis,operasional,strategis,2025',
        status: 'published'
    },
    {
        categorySlug: 'laporan-operasional',
        title: 'Laporan Evaluasi serta Rencana MBV',
        slug: 'laporan-evaluasi-rencana-mbv',
        summary: 'Evaluasi dan rencana Museum Benteng Vredeburg Yogyakarta, mencakup program kerja dan target pengembangan.',
        content: `# Laporan Evaluasi serta Rencana MBV
## Museum Benteng Vredeburg Yogyakarta

## Profil Museum
Museum Benteng Vredeburg terletak di Jalan Margo Mulyo, Yogyakarta. Bekas benteng kolonial Belanda ini kini berfungsi sebagai museum perjuangan kemerdekaan.

## Evaluasi 2025
- **Pengunjung**: 385,000 (target 400,000)
- **Kepuasan**: 82% (survei pengunjung)
- **Pendapatan tiket**: Rp 1.2 Miliar
- **Program edukasi**: 48 sesi, 5,600 peserta

## Rencana Pengembangan
### Jangka Pendek (2025-2026)
- Renovasi diorama interaktif
- Implementasi audio guide digital
- Pengembangan area merchandise

### Jangka Menengah (2026-2028)
- Virtual Reality experience sejarah perjuangan
- Amphiteater outdoor untuk pertunjukan budaya
- Digital archive center

## Diorama Utama
1. Periode penjajahan Belanda
2. Pendudukan Jepang
3. Proklamasi kemerdekaan
4. Agresi militer Belanda
5. Pengakuan kedaulatan`,
        tags: 'museum benteng vredeburg,yogyakarta,perjuangan,kemerdekaan,evaluasi',
        status: 'published'
    },

    // ============ KONSERVASI & LABORATORIUM ============
    {
        categorySlug: 'konservasi-laboratorium',
        title: 'Laporan Laboratorium Konservasi 2025',
        slug: 'laporan-laboratorium-konservasi-2025',
        summary: 'Laporan kegiatan Laboratorium Konservasi IHA, mencakup restorasi, analisis material, dan pengembangan teknik pelestarian.',
        content: `# Laporan Laboratorium Konservasi 2025

## Fungsi Laboratorium
Laboratorium Konservasi IHA bertanggung jawab atas analisis material, restorasi artefak, dan pengembangan teknik konservasi untuk seluruh unit kerja.

## Kegiatan Utama
### Analisis Material
- Sampel dianalisis: 234 sampel dari 18 situs
- Metode: XRF, FTIR, mikroskopi digital
- Laporan teknis diterbitkan: 45 dokumen

### Restorasi
- Artefak dalam proses restorasi: 67 item
- Restorasi selesai: 42 item
- Jenis: keramik (40%), logam (30%), batu (20%), tekstil (10%)

### Pelatihan
- Workshop konservasi preventif: 3x, 90 peserta
- Sertifikasi konservator: 12 personil baru

## Fasilitas
| Fasilitas | Status | Kapasitas |
|-----------|--------|-----------|
| Lab kimia | Aktif | 50 sampel/bulan |
| Lab mikroskopi | Aktif | 30 sampel/bulan |
| Ruang restorasi | Aktif | 20 item paralel |
| Storage klimatis | Aktif | 500 item |`,
        tags: 'laboratorium,konservasi,restorasi,analisis material,2025',
        status: 'published'
    },

    // ============ DATA & INFORMASI ============
    {
        categorySlug: 'data-informasi',
        title: 'Laporan Tim Data dan Informasi 2025',
        slug: 'laporan-tim-data-informasi-2025',
        summary: 'Laporan kegiatan Tim Data dan Informasi IHA tahun 2025, mencakup pengelolaan database, sistem informasi, dan digitalisasi.',
        content: `# Laporan Tim Data dan Informasi 2025

## Mandat
Tim Data dan Informasi bertanggung jawab atas pengelolaan seluruh data digital IHA, termasuk database artefak, sistem informasi manajemen, dan infrastruktur IT.

## Pencapaian 2025
### Database & Sistem
- Database artefak nasional: 12,500+ record terintegrasi
- Synchro Scan deployment: 6 unit kerja aktif
- Knowledge Base platform: dalam pengembangan
- Uptime sistem: 97.8%

### Digitalisasi
- Dokumen terdigitalisasi: 8,400+ halaman
- Foto arsip: 45,000+ gambar berkualitas tinggi
- Video dokumentasi: 120+ jam footage

### Infrastruktur
- Server upgrade: migrasi ke cloud hybrid
- Bandwidth peningkatan: 3x lipat
- Backup system: otomatis harian

## Roadmap 2026
1. Full deployment Synchro Scan ke seluruh unit
2. Launch Knowledge Base Platform v1.0
3. Mobile app untuk petugas lapangan
4. Dashboard eksekutif real-time`,
        tags: 'tim data,informasi,database,digitalisasi,synchro scan,2025',
        status: 'published'
    },

    // ============ HUKUM & ADVOKASI ============
    {
        categorySlug: 'hukum-advokasi',
        title: 'Overview Tim Hukum dan Advokasi — November 2025',
        slug: 'overview-tim-hukum-advokasi-2025',
        summary: 'Overview kegiatan Tim Hukum dan Advokasi IHA, mencakup perlindungan hukum cagar budaya dan penanganan kasus.',
        content: `# Overview Tim Hukum dan Advokasi
## November 2025

## Tugas Utama
Tim Hukum dan Advokasi bertugas memberikan dukungan hukum untuk perlindungan cagar budaya, penanganan sengketa, dan advokasi kebijakan.

## Kegiatan
### Perlindungan Hukum
- Pendampingan kasus perusakan CB: 5 kasus aktif
- Mediasi sengketa lahan situs: 3 kasus
- Review MoU dan perjanjian kerja sama: 12 dokumen

### Advokasi Kebijakan
- Input untuk revisi UU Cagar Budaya
- Sosialisasi peraturan baru ke 8 unit kerja
- Koordinasi dengan Kementerian terkait

### Kasus Aktif
| Kasus | Lokasi | Status |
|-------|--------|--------|
| Pembangunan ilegal dekat situs | Jawa Barat | Proses hukum |
| Pencurian artefak | Sulawesi | Investigasi |
| Sengketa batas zona | Bali | Mediasi |
| Vandalisme candi | Jawa Tengah | Selesai, denda |
| Alih fungsi lahan | Sumatera | Kajian hukum |`,
        tags: 'hukum,advokasi,perlindungan,cagar budaya,sengketa,2025',
        status: 'published'
    },

    // ============ PEMASARAN & PEMANFAATAN ASET ============
    {
        categorySlug: 'pemasaran-aset',
        title: 'Laporan Tim Pengembangan Bisnis, Pemasaran, dan Pemanfaatan Aset MCB 2025',
        slug: 'laporan-tim-bisnis-pemasaran-aset-2025',
        summary: 'Update laporan Tim Pengembangan Bisnis dan Pemasaran MCB, strategi monetisasi dan pemanfaatan aset cagar budaya.',
        content: `# Laporan Tim Pengembangan Bisnis, Pemasaran, dan Pemanfaatan Aset MCB
## 2025

## Misi
Mengoptimalkan potensi ekonomi aset cagar budaya dan museum tanpa mengorbankan nilai pelestarian.

## Strategi 2025
### Revenue Streams
1. **Tiket & Admission**: Rp 18.5 Miliar (proyeksi)
2. **Merchandise**: Rp 2.8 Miliar
3. **Event & Venue Rental**: Rp 4.2 Miliar
4. **Licensing & Branding**: Rp 1.5 Miliar
5. **Digital Products**: Rp 800 Juta

### Marketing Channels
- Social media: 2.5 juta followers total
- Website traffic: 1.8 juta visits/bulan
- Email subscribers: 45,000
- Partnership dengan 120+ travel agent

### Program Inovasi
- **Heritage NFT Collection** — Koleksi digital artefak
- **Virtual Premium Tour** — Tur virtual eksklusif
- **Cultural Membership** — Program keanggotaan premium
- **Souvenir E-commerce** — Platform online merchandise

## Target 2026
| Revenue Stream | 2025 | Target 2026 | Growth |
|---|---|---|---|
| Tiket | 18.5B | 22B | +19% |
| Merchandise | 2.8B | 4.5B | +61% |
| Events | 4.2B | 6B | +43% |
| Digital | 0.8B | 2B | +150% |`,
        tags: 'pengembangan bisnis,pemasaran,aset,monetisasi,revenue,mcb',
        status: 'published'
    },

    // ============ RENCANA STRATEGI BISNIS ============
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
- Implementasi Synchro Scan untuk digitalisasi dokumen
- Pembangunan Knowledge Base platform
- Pelatihan SDM inti di seluruh unit
- Standarisasi proses digitalisasi

### Tahun 3-4: Ekspansi
- Integrasi data antar unit kerja
- Dashboard analitik eksekutif
- Mobile access untuk petugas lapangan
- AI-powered insights dan rekomendasi

## Target KPI
| KPI | Target 2025 | Target 2026 | Target 2027 |
|-----|-------------|-------------|-------------|
| Dokumen terdigitalisasi | 5,000 | 15,000 | 40,000 |
| User aktif platform | 50 | 200 | 500 |
| Uptime sistem | 95% | 99% | 99.5% |
| Kepuasan pengguna | 75% | 85% | 90% |`,
        tags: 'RSB,strategi bisnis,digitalisasi,NDI,IHA,transformasi digital',
        status: 'published'
    },
    {
        categorySlug: 'rencana-strategi-bisnis',
        title: 'Wishlist & Pending Matters Storage 2025-2026',
        slug: 'wishlist-pending-matters-2025-2026',
        summary: 'Daftar wishlist dan pending matters untuk pengembangan sistem storage dan infrastruktur IHA periode 2025-2026.',
        content: `# Wishlist & Pending Matters Storage 2025-2026

## Cloud Infrastructure
### Priority High
- Migrasi database ke cloud managed service
- Implementasi CDN untuk distribusi konten
- Backup otomatis dengan retensi 90 hari
- Disaster recovery plan dan testing

### Priority Medium
- Object storage untuk arsip dokumen besar
- Auto-scaling untuk Knowledge Base platform
- Monitoring dan alerting system
- SSL/TLS upgrade ke standar terbaru

## Data Management
### Pending
- Standardisasi format metadata antar unit
- Deduplication dokumen yang sudah terscan
- Data retention policy formal
- Audit trail untuk semua perubahan data

## Hardware
- Upgrade storage server utama: 10TB → 50TB
- Tablet untuk petugas lapangan: 80 unit
- Scanner dokumen grade profesional: 12 unit
- UPS backup untuk 8 lokasi

## Estimasi Budget
| Item | Budget (Juta Rp) | Priority |
|------|------------------|----------|
| Cloud service (1 tahun) | 360 | High |
| CDN + SSL | 48 | High |
| Storage upgrade | 250 | Medium |
| Tablet lapangan | 480 | Medium |
| Scanner | 180 | High |`,
        tags: 'wishlist,storage,infrastruktur,cloud,pending matters,2025-2026',
        status: 'published'
    },

    // ============ POLICY & REGULASI ============
    {
        categorySlug: 'policy-regulasi',
        title: 'Panduan Inventarisasi Artefak Cagar Budaya',
        slug: 'panduan-inventarisasi-artefak',
        summary: 'SOP untuk inventarisasi dan dokumentasi artefak cagar budaya di seluruh unit kerja IHA.',
        content: `# Panduan Inventarisasi Artefak Cagar Budaya

## Tujuan
Dokumen ini menyediakan panduan standar untuk proses inventarisasi artefak cagar budaya.

## Proses Inventarisasi
### 1. Identifikasi Awal
- Verifikasi lokasi temuan
- Dokumentasi foto minimal 4 sisi
- Pencatatan koordinat GPS

### 2. Registrasi
- Pemberian nomor inventaris sesuai standar nasional
- Input ke sistem database pusat (Synchro Scan)
- Klasifikasi jenis artefak

### 3. Dokumentasi Detail
- Pengukuran dimensi (panjang, lebar, tinggi, berat)
- Deskripsi kondisi fisik
- Fotografi profesional untuk arsip digital

### 4. Penyimpanan
- Penempatan di gudang sesuai standar
- Pengendalian suhu dan kelembaban
- Label dan penandaan fisik

## Peralatan Wajib
- GPS handheld | Kamera DSLR | Meteran laser | Form inventarisasi digital`,
        tags: 'SOP,inventarisasi,artefak,cagar budaya,panduan',
        status: 'published'
    },
];

const FILES = [
    { fileName: 'Laporan Galeri Nasional Indonesia 2025.pdf', filePath: 'kb-files/Laporan Galeri Nasional Indonesia 2025_2.pdf', fileSize: '8.7 MB', fileType: 'pdf', categorySlug: 'museum-galeri', description: 'Laporan lengkap kegiatan Galeri Nasional Indonesia tahun 2025' },
    { fileName: 'Laporan Museum Basoeki Abdullah 2025.pdf', filePath: 'kb-files/Laporan Museum Basoeki Abdullah 2025.pdf', fileSize: '9.8 MB', fileType: 'pdf', categorySlug: 'museum-galeri', description: 'Laporan kegiatan Museum Basoeki Abdullah tahun 2025' },
    { fileName: 'Laporan Museum Nasional Indonesia.pdf', filePath: 'kb-files/Laporan Museum Nasional Indonesia.pdf', fileSize: '4.8 MB', fileType: 'pdf', categorySlug: 'museum-galeri', description: 'Laporan Museum Nasional Indonesia (Museum Gajah) 2025' },
    { fileName: 'Museum Kepresidenan RI Balai Kirti Program Kerja 2025-2026.pdf', filePath: 'kb-files/Museum Kepresidenan RI Balai Kirti_Laporan Program Kerja 2025-2026.pdf', fileSize: '10.2 MB', fileType: 'pdf', categorySlug: 'museum-galeri', description: 'Program kerja Museum Kepresidenan RI Balai Kirti 2025-2026' },
    { fileName: 'Museum Semedo November 2025.pdf', filePath: 'kb-files/Museum_Semedo_Nov_2025.pdf', fileSize: '1.7 MB', fileType: 'pdf', categorySlug: 'museum-galeri', description: 'Laporan Museum Semedo November 2025' },
    { fileName: 'Song Terus MCB Unit Museum November 2025.pdf', filePath: 'kb-files/SONG_TERUS_MCB_Unit_Museum_November_Tahun_2025.pdf', fileSize: '10.9 MB', fileType: 'pdf', categorySlug: 'museum-galeri', description: 'Laporan Song Terus MCB Unit Museum November 2025' },
    { fileName: 'LAPORAN UNIT CB SULAWESI DAN MALUKU.pdf', filePath: 'kb-files/LAPORAN UNIT CB SULAWESI DAN MALUKU.pdf', fileSize: '5.3 MB', fileType: 'pdf', categorySlug: 'cagar-budaya', description: 'Laporan unit cagar budaya Sulawesi dan Maluku' },
    { fileName: 'CAGAR BUDAYA JAWA TIMUR Nov 25.pdf', filePath: 'kb-files/CAGAR BUDAYA JAWA TIIMUR nov 25.pdf', fileSize: '1.0 MB', fileType: 'pdf', categorySlug: 'cagar-budaya', description: 'Laporan cagar budaya Jawa Timur November 2025' },
    { fileName: 'CB Sumatera Banten Jawa Barat Nov 2025.pdf', filePath: 'kb-files/CB Sumatera, Banten, Jawa Barat Nov 2025.pdf', fileSize: '29.8 MB', fileType: 'pdf', categorySlug: 'cagar-budaya', description: 'Laporan CB Sumatera, Banten, dan Jawa Barat November 2025' },
    { fileName: 'Unit CB Wilayah Jawa Tengah.pdf', filePath: 'kb-files/Unit CB Wilayah Jawa Tengah.pdf', fileSize: '9.1 MB', fileType: 'pdf', categorySlug: 'cagar-budaya', description: 'Laporan unit cagar budaya wilayah Jawa Tengah' },
    { fileName: 'MCB CB UNIT DIY 2025.pdf', filePath: 'kb-files/MCB - CB UNIT DIY 2025 (Rev).pdf', fileSize: '5.9 MB', fileType: 'pdf', categorySlug: 'cagar-budaya', description: 'Laporan MCB CB Unit DIY 2025' },
    { fileName: 'MINHA MCB 2025.pdf', filePath: 'kb-files/MINHA_MCB_2025.pdf', fileSize: '2.3 MB', fileType: 'pdf', categorySlug: 'cagar-budaya', description: 'Laporan MINHA MCB 2025' },
    { fileName: 'Wardun Borobudur.pdf', filePath: 'kb-files/Wardun Borobudur.pdf', fileSize: '4.4 MB', fileType: 'pdf', categorySlug: 'cagar-budaya', description: 'Laporan Warisan Dunia Borobudur 2025' },
    { fileName: 'Laporan Komitra.pdf', filePath: 'kb-files/Laporan Komitra.pdf', fileSize: '12.5 MB', fileType: 'pdf', categorySlug: 'laporan-operasional', description: 'Laporan Komitra — Mitigasi dan Penanggulangan Risiko 2025' },
    { fileName: 'Laporan MRB 2025.pdf', filePath: 'kb-files/Laporan MRB 2025.pdf', fileSize: '11.9 MB', fileType: 'pdf', categorySlug: 'laporan-operasional', description: 'Laporan Manajemen Risiko Bisnis 2025' },
    { fileName: 'Laporan Evaluasi serta Rencana MBV.pdf', filePath: 'kb-files/laporan evaluasi serta rencana MBV.pdf', fileSize: '1.1 MB', fileType: 'pdf', categorySlug: 'laporan-operasional', description: 'Evaluasi Museum Benteng Vredeburg dan rencana pengembangan' },
    { fileName: 'Laporan Laboratorium Konservasi.pdf', filePath: 'kb-files/Laporan Laboratorium Konservasi.pdf', fileSize: '793 KB', fileType: 'pdf', categorySlug: 'konservasi-laboratorium', description: 'Laporan Laboratorium Konservasi IHA 2025' },
    { fileName: 'Laporan Tim Data dan Informasi 2025.pdf', filePath: 'kb-files/2025 - Laporan Tim Data dan Informasi.pdf', fileSize: '98 KB', fileType: 'pdf', categorySlug: 'data-informasi', description: 'Laporan Tim Data dan Informasi IHA 2025' },
    { fileName: 'Overview Tim Hukum dan Advokasi.pdf', filePath: 'kb-files/Overview Tim Hukum dan Advokasi_071125.pdf', fileSize: '1.0 MB', fileType: 'pdf', categorySlug: 'hukum-advokasi', description: 'Overview Tim Hukum dan Advokasi November 2025' },
    { fileName: 'Laporan Tim Pengembangan Bisnis Pemasaran Aset MCB 2025.pdf', filePath: 'kb-files/UPDATE LAPORAN TIM PENGEMBANGAN BISNIS, PEMASARAN, DAN PEMANFAATAN ASET MCB - 2025 (2).pdf', fileSize: '1.9 MB', fileType: 'pdf', categorySlug: 'pemasaran-aset', description: 'Laporan Tim Pengembangan Bisnis dan Pemasaran Aset MCB 2025' },
    { fileName: 'Wishlist & Pending Matters Storage 2025-2026.pdf', filePath: 'kb-files/Whislist & Pending Matters Storage 2025-2026.pdf', fileSize: '7.5 MB', fileType: 'pdf', categorySlug: 'rencana-strategi-bisnis', description: 'Wishlist dan Pending Matters infrastruktur 2025-2026' },
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
            const { categorySlug, ...artData } = art;
            await KBArticle.findOrCreate({
                where: { slug: art.slug },
                defaults: { ...artData, categoryId }
            });
        }
        console.log(`  ✅ ${ARTICLES.length} articles seeded`);

        // Seed files
        for (const file of FILES) {
            const categoryId = catMap[file.categorySlug] || null;
            const { categorySlug, ...fileData } = file;
            await KBFile.findOrCreate({
                where: { fileName: file.fileName },
                defaults: { ...fileData, categoryId }
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
