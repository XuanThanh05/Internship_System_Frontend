// src/api/contractApi.js
import axios from "axios";
import { ROOT_API } from "./rootApi";
// Thay đổi URL này nếu cần
const API_BASE_URL = `${ROOT_API}/api`;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

export const getInternContracts = async (token, internId) => {
  try {
    const response = await axiosInstance.get(`/contracts/intern/${internId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Luôn trả về mảng
    if (response.data) {
      return Array.isArray(response.data) ? response.data : [response.data];
    }
    return [];
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return [];
  }
};

export const confirmContractApi = async (token, contractId) => {
  try {
    // QUAN TRỌNG: Truyền status=APPROVED trên URL
    const response = await axiosInstance.patch(
      `/contracts/${contractId}/confirm-status?status=APPROVED`,
      {}, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error confirming contract:", error);
    throw error;
  }
};