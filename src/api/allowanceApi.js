import axios from "axios";
import { ROOT_API } from "./rootApi";
const API_URL = `${ROOT_API}/api/allowances`;

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const allowanceApi = {
  // Get all allowances with pagination
  getAllowances: async (token, page = 0, size = 10, sortBy = null, direction = "asc") => {
    const params = { page, size };
    if (sortBy) {
      params.sortBy = sortBy;
      params.direction = direction;
    }
    const res = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return res.data;
  },

  // Get allowance by ID
  getAllowanceById: async (token, id) => {
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Get allowances by intern ID
  getAllowancesByInternId: async (token, internId, page = 0, size = 10, sortBy = null, direction = "asc") => {
    const params = { page, size };
    if (sortBy) {
      params.sortBy = sortBy;
      params.direction = direction;
    }
    const res = await axios.get(`${API_URL}/intern/${internId}`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return res.data;
  },

  // Create new allowance
  createAllowance: async (token, allowanceData) => {
    const res = await axios.post(API_URL, allowanceData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Update allowance
  updateAllowance: async (token, id, allowanceData) => {
    const res = await axios.put(`${API_URL}/${id}`, allowanceData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Delete allowance
  deleteAllowance: async (token, id) => {
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Filter allowances
  filterAllowances: async (token, filters = {}, page = 0, size = 10) => {
    const params = { page, size };

    // Add filter parameters if provided
    if (filters.internId) params.internId = filters.internId;
    if (filters.type) params.type = filters.type;
    if (filters.minAmount) params.minAmount = filters.minAmount;
    if (filters.maxAmount) params.maxAmount = filters.maxAmount;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    const res = await axios.get(`${API_URL}/filter/search`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return res.data;
  },

  // Get all allowances for export (without pagination)
  getAllAllowancesForExport: async (token, sortBy = "dateApplied", direction = "desc") => {
    const params = { page: 0, size: 10000 };
    if (sortBy) {
      params.sortBy = sortBy;
      params.direction = direction;
    }
    const res = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return res.data;
  },

  // Search interns by name
  searchInternsByName: async (token, name) => {
    const res = await axios.get(`${API_URL}/search/interns`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { name },
    });
    return res.data;
  },
};

export default allowanceApi;
