const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/invoice';

export const uploadInvoice = async (file) => {
  const formData = new FormData();
  formData.append('invoiceImageFile', file);

  try {
    const response = await fetch(`${API_BASE_URL}/process`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.details || data.error || `HTTP error! status: ${response.status}`);
    }
    return data;
  } catch (error) {
    console.error("Error uploading invoice:", error);
    throw error;
  }
};