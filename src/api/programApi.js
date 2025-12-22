import axios from "axios";
import { ROOT_API } from "./rootApi";
const BASE_URL = `${ROOT_API}`;
const API_URL = `${BASE_URL}/api/programs`;

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const programApi = {
  // Get all programs with pagination
  getAllPrograms: async (token, page = 1, size = 10, sortBy = "name", sortDir = "asc") => {
    const params = { page, size, sortBy, sortDir };
    const res = await axios.get(API_URL, {
      ...authHeader(token),
      params,
    });
    return res.data;
  },

  // Search programs by name
  searchPrograms: async (token, name) => {
    const res = await axios.get(`${API_URL}/search`, {
      ...authHeader(token),
      params: { name },
    });
    return res.data;
  },

  // Filter programs by department
  filterByDepartment: async (token, department) => {
    const res = await axios.get(`${API_URL}/filter/department`, {
      ...authHeader(token),
      params: { department },
    });
    return res.data;
  },

  // Filter programs by mentor
  filterByMentor: async (token, mentorId) => {
    const res = await axios.get(`${API_URL}/filter/mentor`, {
      ...authHeader(token),
      params: { mentorId },
    });
    return res.data;
  },

  // Get all departments
  getDepartments: async (token) => {
    const res = await axios.get(`${API_URL}/department`, authHeader(token));
    return res.data;
  },

  // Get assigned mentors for dropdown
  getAssignedMentors: async (token) => {
    const res = await axios.get(`${API_URL}/mentor-assigned`, authHeader(token));
    return res.data;
  },

  // Create program
  createProgram: async (token, programData) => {
    const res = await axios.post(`${API_URL}/create`, programData, authHeader(token));
    return res.data;
  },

  // Update program
  updateProgram: async (token, programId, programData) => {
    const res = await axios.put(`${API_URL}/${programId}`, programData, authHeader(token));
    return res.data;
  },

  // Delete program
  deleteProgram: async (token, programId) => {
    const res = await axios.delete(`${API_URL}/${programId}`, authHeader(token));
    return res.data;
  },

  // Get clone template
  getCloneTemplate: async (token, programId) => {
    const res = await axios.get(`${API_URL}/${programId}/clone-template`, authHeader(token));
    return res.data;
  },

  // Clone program
  cloneProgram: async (token, programData) => {
    const res = await axios.post(`${API_URL}/clone`, programData, authHeader(token));
    return res.data;
  },

  // Assign mentor to program
  assignMentor: async (token, programId, mentorId) => {
    const res = await axios.post(`${API_URL}/${programId}/assign-mentor/${mentorId}`, null, authHeader(token));
    return res.data;
  },

  // Get mentors for program
  getMentorsForProgram: async (token, programId) => {
    const res = await axios.get(`${API_URL}/${programId}/mentors`, authHeader(token));
    return res.data;
  },

  // Get program and tasks by intern ID
  getProgramByIntern: async (token, internId) => {
    const res = await axios.get(`${API_URL}/intern/${internId}`, authHeader(token));
    return res.data;
  },
};

export default programApi;
