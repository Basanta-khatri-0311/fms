import API from './axiosConfig';

export const login = async (credentials) => {
  const { data } = await API.post('/auth/login', credentials);
  return data; // Return { token, user: { role, name, ... } }
};