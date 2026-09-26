import axios from 'axios';

const API_BASE = '/api/deviations';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000, // 2 min timeout for AI calls
});

/**
 * Extract deviation fields from pasted text
 */
export const extractFromText = async (text) => {
  const response = await api.post('/extract', { text });
  return response.data;
};

/**
 * Extract deviation fields from uploaded file
 */
export const extractFromFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/extract-file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Save a deviation record
 */
export const saveDeviation = async (deviationData) => {
  const response = await api.post('/', deviationData);
  return response.data;
};

/**
 * List deviations with search filter
 */
export const listDeviations = async (skip = 0, limit = 50, search = '') => {
  const response = await api.get('/', { params: { skip, limit, search } });
  return response.data;
};

/**
 * Get single deviation by ID
 */
export const getDeviation = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

/**
 * Update deviation
 */
export const updateDeviation = async (id, data) => {
  const response = await api.put(`/${id}`, data);
  return response.data;
};

/**
 * Delete deviation
 */
export const deleteDeviation = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};

/**
 * Get deviation summary statistics
 */
export const getDeviationStats = async () => {
  const response = await api.get('/stats/summary');
  return response.data;
};

/**
 * Chat with the AI assistant
 */
export const chatWithAI = async (message, context = null) => {
  const response = await api.post('/chat', { message, context });
  return response.data;
};

export default api;
