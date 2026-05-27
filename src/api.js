import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

export const getTransactions = async () => {
  const response = await axios.get(`${API_URL}/transactions`);
  return response.data;
};

export const addTransaction = async (description, amount, category, date) => {
  try {
    console.log("📤 Sending to backend:", { description, amount, category, date });
    const response = await axios.post(`${API_URL}/transactions`, { description, amount, category, date });
    console.log("✅ Backend responded:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error adding transaction:", error);
    throw error;
  }
};

export const deleteTransaction = async (id) => {
  console.log(`Deleting transaction with ID: ${id}`);
  await axios.delete(`${API_URL}/transactions/${id}`);
};
