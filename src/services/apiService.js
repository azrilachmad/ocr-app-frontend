// File: src/services/apiService.js
import axios from 'axios';

// Ambil base URL dari environment variables. Pastikan ini menunjuk ke prefix /api/ocr
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/ocr';

/**
 * Fungsi untuk mengunggah dan memproses satu atau beberapa dokumen.
 * @param {File[]} files - Array berisi file-file yang akan diunggah.
 * @returns {Promise<object>} - Objek data dari respons API, berisi { document_type, content }.
 */
export const processDocuments = async (files) => {
    if (!files || files.length === 0) {
        throw new Error('Tidak ada file yang dipilih untuk diproses.');
    }

    const formData = new FormData();
    // Loop melalui semua file dan tambahkan ke FormData dengan key yang sama
    files.forEach(file => {
        // 'documentFiles' harus sama dengan key di backend: upload.array('documentFiles', ...)
        formData.append('documentFiles', file);
    });

    try {
        const response = await axios.post(`${API_BASE_URL}/process`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        // Mengembalikan bagian 'data' dari respons API, yang berisi {document_type, content}
        return response.data.data;
    } catch (err) {
        // Melempar kembali error agar bisa ditangani oleh komponen UI yang memanggil
        throw new Error(err.response?.data?.message || err.message || 'Terjadi kesalahan pada server saat memproses dokumen.');
    }
};

/**
 * Fungsi untuk menyimpan data yang sudah diverifikasi ke database.
 * @param {object} dataToSubmit - Objek berisi { document_type, content }.
 * @returns {Promise<object>} - Objek data dari record yang baru dibuat di database.
 */
export const submitProcessedData = async (submissionPayload) => {
    const { document_type, content, userDefinedFilename, documentFiles } = submissionPayload;
    if (!document_type || !content || !userDefinedFilename || !documentFiles || documentFiles.length === 0) {
        throw new Error('Data untuk disimpan tidak lengkap.');
    }

    const formData = new FormData();
    formData.append('document_type', document_type);
    formData.append('content', JSON.stringify(content)); // Kirim JSON sebagai string
    formData.append('userDefinedFilename', userDefinedFilename);

    // Tambahkan semua file (atau file pertama jika hanya butuh satu)
    documentFiles.forEach(file => {
        formData.append('documentFiles', file);
    });
    
    try {
        const response = await axios.post(`${API_BASE_URL}/submit`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Gagal menyimpan data.');
    }
};

export const getAllInvoices = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/invoices`);
        return response.data.data; // Backend mengembalikan data di dalam 'data'
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Gagal mengambil daftar invoice.');
    }
};

export const getInvoiceById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/invoices/${id}`);
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Gagal mengambil detail invoice.');
    }
};

/**
 * Mengambil daftar semua STNK.
 */
export const getAllStnks = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/stnks`);
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Gagal mengambil daftar STNK.');
    }
};

export const getStnkById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/stnks/${id}`);
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Gagal mengambil detail STNK.');
    }
};

/**
 * Mengambil daftar semua BPKB.
 */
export const getAllBpkbs = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/bpkbs`);
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Gagal mengambil daftar BPKB.');
    }
};

export const getBpkbById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/bpkbs/${id}`);
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Gagal mengambil detail BPKB.');
    }
};

export const getAllKtp = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/ktp`);
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Gagal mengambil daftar KTP.');
    }
};

export const getKtpById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/ktp/${id}`);
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Gagal mengambil detail KTP.');
    }
};

