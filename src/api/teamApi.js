import axios from "axios";
import { ROOT_API } from "./rootApi";
const BASE_URL = `${ROOT_API}`;
const API_URL = `${BASE_URL}/api/teams`;

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const teamApi = {
  // Get program overview
  getProgramOverview: async (token, programId) => {
    const res = await axios.get(`${API_URL}/${programId}/overview`, authHeader(token));
    return res.data;
  },

  // Get teams in program
  getTeamsByProgram: async (token, programId) => {
    const res = await axios.get(`${API_URL}/${programId}/teams`, authHeader(token));
    return res.data;
  },

  // Get mentors for program
  getMentorsForProgram: async (token, programId) => {
    const res = await axios.get(`${API_URL}/${programId}/mentors`, authHeader(token));
    return res.data;
  },

  // Search mentors
  searchMentors: async (token, name) => {
    const res = await axios.get(`${API_URL}/mentors/search`, {
      ...authHeader(token),
      params: { name },
    });
    return res.data;
  },

  // Search mentors in program
  searchMentorsInProgram: async (token, programId, query) => {
    const res = await axios.get(`${API_URL}/${programId}/mentors/search`, {
      ...authHeader(token),
      params: { q: query },
    });
    return res.data;
  },

  // Assign mentor to program
  assignMentorToProgram: async (token, programId, mentorId) => {
    const res = await axios.post(`${API_URL}/assign-mentor`, { programId, mentorId }, authHeader(token));
    return res.data;
  },

  // Search interns
  searchInterns: async (token, name) => {
    const res = await axios.get(`${API_URL}/interns/search`, {
      ...authHeader(token),
      params: { name },
    });
    return res.data;
  },

  // Create team
  createTeam: async (token, teamData) => {
    const res = await axios.post(`${API_URL}/teams/create`, teamData, authHeader(token));
    return res.data;
  },

  // Update team
  updateTeam: async (token, teamId, teamData) => {
    const res = await axios.put(`${API_URL}/teams/${teamId}`, teamData, authHeader(token));
    return res.data;
  },

  // Delete team
  deleteTeam: async (token, teamId) => {
    const res = await axios.delete(`${API_URL}/teams/${teamId}`, authHeader(token));
    return res.data;
  },

  // Remove mentor from program
  removeMentorFromProgram: async (token, programId, mentorId) => {
    const res = await axios.delete(`${API_URL}/${programId}/mentors/${mentorId}`, authHeader(token));
    return res.data;
  },

  // Remove intern from team
  removeInternFromTeam: async (token, teamId, internId) => {
    const res = await axios.delete(`${API_URL}/teams/${teamId}/interns/${internId}`, authHeader(token));
    return res.data;
  },
};

export default teamApi;
