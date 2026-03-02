import { useEffect, useState } from 'react';
import { api } from './api/client'; // Use your client

// Inside your App component
const [chats, setChats] = useState([]);

useEffect(() => {
  const loadData = async () => {
    try {
      // Adjust '/chats' to match the routes in ai.controller.ts
      const response = await api.get('/chats'); 
      setChats(response.data);
    } catch (error) {
      console.error("Backend connection failed", error);
    }
  };
  loadData();
}, []);