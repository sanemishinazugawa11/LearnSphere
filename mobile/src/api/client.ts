import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Find your IP using 'ipconfig' (Win) or 'ifconfig' (Mac)
const BASE_URL = 'http://localhost:8080/api'; 

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Matches auth_middleware.go
  }
  return config;
});

export default api;