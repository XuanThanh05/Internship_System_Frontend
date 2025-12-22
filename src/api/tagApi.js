import axios from "axios";
import { ROOT_API } from "./rootApi";
const BASE_URL = `${ROOT_API}`;
const API_URL = `${BASE_URL}/api/tags`;

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const tagApi = {
  // Get all tags
  getAllTags: async (token) => {
    const res = await axios.get(API_URL, authHeader(token));
    return res.data;
  },

  // Get tags by program ID
  getTagsByProgram: async (token, programId) => {
    const res = await axios.get(`${API_URL}/program/${programId}`, authHeader(token));
    return res.data;
  },

  // Get tag by ID
  getTagById: async (token, tagId) => {
    const res = await axios.get(`${API_URL}/${tagId}`, authHeader(token));
    return res.data;
  },

  // Create new tag
  createTag: async (token, tagData) => {
    const res = await axios.post(API_URL, tagData, authHeader(token));
    return res.data;
  },

  // Update tag
  updateTag: async (token, tagId, tagData) => {
    const res = await axios.put(`${API_URL}/${tagId}`, tagData, authHeader(token));
    return res.data;
  },

  // Delete tag
  deleteTag: async (token, tagId) => {
    const res = await axios.delete(`${API_URL}/${tagId}`, authHeader(token));
    return res.data;
  },

  // Add tag to task
  addTagToTask: async (token, taskId, tagId) => {
    const res = await axios.post(`${API_URL}/task/${taskId}/tag/${tagId}`, null, authHeader(token));
    return res.data;
  },

  // Remove tag from task
  removeTagFromTask: async (token, taskId, tagId) => {
    const res = await axios.delete(`${API_URL}/task/${taskId}/tag/${tagId}`, authHeader(token));
    return res.data;
  },

  // Get tags by task ID
  getTagsByTask: async (token, taskId) => {
    const res = await axios.get(`${API_URL}/task/${taskId}`, authHeader(token));
    return res.data;
  },
};

export default tagApi;
