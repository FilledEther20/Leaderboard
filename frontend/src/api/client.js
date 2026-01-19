import axios from 'axios';

// ⚠️ REPLACE '192.168.1.X' with your laptop's local IP address.
// Do NOT use 'localhost' if testing on a physical phone.
// If using Android Emulator, you can use '10.0.2.2'.
const API_URL = 'http://localhost:8080'; 

const client = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

export default client;