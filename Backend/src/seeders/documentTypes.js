const { DocumentType } = require('../models');

/**
 * Default document types to seed into database
 */
const defaultDocumentTypes = [
    {
        name: 'KTP',
        description: 'Kartu Tanda Penduduk (Indonesian ID Card)',
        active: true,
        fields: [
            { name: 'NIK', required: true },
            { name: 'Nama', required: true },
            { name: 'Tempat Lahir', required: false },
            { name: 'Tanggal Lahir', required: true },
            { name: 'Jenis Kelamin', required: true },
            { name: 'Alamat', required: true },
            { name: 'RT/RW', required: false },
            { name: 'Kelurahan/Desa', required: false },
            { name: 'Kecamatan', required: false },
            { name: 'Agama', required: false },
            { name: 'Status Perkawinan', required: false },
            { name: 'Pekerjaan', required: false },
            { name: 'Kewarganegaraan', required: false },
            { name: 'Berlaku Hingga', required: false }
        ]
    },
    {
        name: 'KK',
        description: 'Kartu Keluarga (Family Card)',
        active: true,
        fields: [
            { name: 'No. KK', required: true },
            { name: 'Nama Kepala Keluarga', required: true },
            { name: 'Alamat', required: true },
            { name: 'RT/RW', required: false },
            { name: 'Kelurahan/Desa', required: false },
            { name: 'Kecamatan', required: false },
            { name: 'Kabupaten/Kota', required: false },
            { name: 'Provinsi', required: false }
        ]
    },
    {
        name: 'SIM',
        description: 'Surat Izin Mengemudi (Driving License)',
        active: true,
        fields: [
            { name: 'No. SIM', required: true },
            { name: 'Nama', required: true },
            { name: 'Tempat Lahir', required: false },
            { name: 'Tanggal Lahir', required: true },
            { name: 'Golongan Darah', required: false },
            { name: 'Jenis Kelamin', required: false },
            { name: 'Alamat', required: true },
            { name: 'Pekerjaan', required: false },
            { name: 'Golongan SIM', required: true },
            { name: 'Berlaku Hingga', required: true }
        ]
    },
    {
        name: 'STNK',
        description: 'Surat Tanda Nomor Kendaraan (Vehicle Registration)',
        active: true,
        fields: [
            { name: 'No. Registrasi', required: true },
            { name: 'Nama Pemilik', required: true },
            { name: 'Alamat', required: true },
            { name: 'Merk', required: true },
            { name: 'Tipe', required: false },
            { name: 'Jenis', required: false },
            { name: 'Model', required: false },
            { name: 'Tahun Pembuatan', required: false },
            { name: 'No. Rangka', required: true },
            { name: 'No. Mesin', required: true },
            { name: 'Warna', required: false },
            { name: 'Bahan Bakar', required: false },
            { name: 'Masa Berlaku', required: true }
        ]
    },
    {
        name: 'BPKB',
        description: 'Buku Pemilik Kendaraan Bermotor (Vehicle Ownership Book)',
        active: true,
        fields: [
            { name: 'No. BPKB', required: true },
            { name: 'No. Registrasi', required: true },
            { name: 'Nama Pemilik', required: true },
            { name: 'Alamat', required: true },
            { name: 'Merk', required: true },
            { name: 'Tipe', required: false },
            { name: 'Jenis', required: false },
            { name: 'Model', required: false },
            { name: 'Tahun Pembuatan', required: false },
            { name: 'No. Rangka', required: true },
            { name: 'No. Mesin', required: true },
            { name: 'Warna', required: false }
        ]
    },
    {
        name: 'Invoice',
        description: 'Invoice / Faktur / Receipt',
        active: true,
        fields: [
            { name: 'No. Invoice', required: true },
            { name: 'Tanggal', required: true },
            { name: 'Nama Perusahaan', required: false },
            { name: 'Alamat Perusahaan', required: false },
            { name: 'Nama Pelanggan', required: false },
            { name: 'Alamat Pelanggan', required: false },
            { name: 'Subtotal', required: false },
            { name: 'Pajak', required: false },
            { name: 'Total', required: true },
            { name: 'Metode Pembayaran', required: false }
        ]
    }
];

/**
 * Seed default document types if none exist
 */
const seedDocumentTypes = async () => {
    try {
        const count = await DocumentType.count();

        if (count === 0) {
            console.log('📝 Seeding default document types...');

            for (const docType of defaultDocumentTypes) {
                await DocumentType.create({
                    name: docType.name,
                    description: docType.description,
                    active: docType.active,
                    fields: docType.fields
                });
            }

            console.log(`✅ Created ${defaultDocumentTypes.length} default document types.`);
        } else {
            console.log(`ℹ️  Found ${count} document types in database (skipping seed).`);
        }
    } catch (error) {
        console.error('❌ Error seeding document types:', error.message);
    }
};

module.exports = { seedDocumentTypes, defaultDocumentTypes };
