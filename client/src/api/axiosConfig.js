import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5500/api', //server url
});

// Automatically add the token to every request if it exists
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;