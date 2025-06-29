import { useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const useAxios = () => {
  const { token } = useContext(AuthContext);

  const axiosInstance = axios.create({
    baseURL: 'http://localhost:5001/api', // Our API base URL
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export default useAxios;