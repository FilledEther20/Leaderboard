import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL ||'http://localhost:8080'; 

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export default client;