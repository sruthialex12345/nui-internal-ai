import axios from 'axios';

// 1. Get her backend URL (usually http://localhost:3000)
const BACKEND_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: BACKEND_URL,
});

// 2. Helper to fetch chats from her Prisma DB
export const getChats = async () => {
  const response = await api.get('/chats'); // Adjust based on her route
  return response.data;
};