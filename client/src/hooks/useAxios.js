import { useContext, useMemo } from 'react'; // 1. Import useMemo
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const useAxios = () => {
  const { token } = useContext(AuthContext);

  // 2. Wrap the instance creation in useMemo
  // This ensures the axiosInstance is only created once, unless the token changes.
  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: 'http://localhost:5001/api',
    });

    // This interceptor adds the auth token to every request
    instance.interceptors.request.use(
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

    return instance;
  }, [token]); // 3. The dependency array ensures this only re-runs if the token changes

  return axiosInstance;
};

export default useAxios;