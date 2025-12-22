// src/api/axiosClient.js
import axios from "axios";
import { ROOT_API } from "./rootApi";
const axiosClient = axios.create({
  baseURL: `${ROOT_API}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error.response?.data || error.message);
  }
);

export default axiosClient;
