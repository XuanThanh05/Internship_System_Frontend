import axios from "axios";
import { ROOT_API } from "./rootApi";
const BASE_URL = `${ROOT_API}`;
const API_URL = `${BASE_URL}/api/tasks`;
const TASK_MANAGEMENT_URL = `${BASE_URL}/api/task-management`;

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const taskApi = {
  // Get all tasks with pagination
  getAllTasks: async (token, page = 0, size = 10, sortBy = "taskId", direction = "asc") => {
    const params = { page, size, sortBy, direction };
    const res = await axios.get(API_URL, {
      ...authHeader(token),
      params,
    });
    return res.data;
  },

  // Get tasks by mentor ID
  getTasksByMentor: async (token, mentorId, page = 0, size = 10, sortBy = "taskId", direction = "asc") => {
    const params = { page, size, sortBy, direction };
    const res = await axios.get(`${API_URL}/mentor/${mentorId}`, {
      ...authHeader(token),
      params,
    });
    return res.data;
  },

  // Get tasks by program ID
  getTasksByProgram: async (token, programId, page = 0, size = 10, sortBy = "taskId", direction = "asc") => {
    const params = { page, size, sortBy, direction };
    const res = await axios.get(`${API_URL}/program/${programId}`, {
      ...authHeader(token),
      params,
    });
    return res.data;
  },

  // Get tasks by intern ID
  getTasksByIntern: async (token, internId) => {
    const res = await axios.get(`${API_URL}/intern/${internId}`, authHeader(token));
    return res.data;
  },

  // Get task by ID
  getTaskById: async (token, taskId) => {
    const res = await axios.get(`${API_URL}/${taskId}`, authHeader(token));
    return res.data;
  },

  // Create new task
  createTask: async (token, taskData) => {
    const res = await axios.post(API_URL, taskData, authHeader(token));
    return res.data;
  },

  // Update task
  updateTask: async (token, taskId, taskData) => {
    const res = await axios.put(`${API_URL}/${taskId}`, taskData, authHeader(token));
    return res.data;
  },

  // Update task status (PATCH)
  updateTaskStatus: async (token, taskId, status) => {
    const res = await axios.patch(
      `${API_URL}/${taskId}/status`,
      JSON.stringify(status),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  },

  // Delete task
  deleteTask: async (token, taskId) => {
    const res = await axios.delete(`${API_URL}/${taskId}`, authHeader(token));
    return res.data;
  },

  // Filter tasks
  filterTasks: async (token, filters = {}, page = 0, size = 10) => {
    const params = { page, size };

    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.programId) params.programId = filters.programId;
    if (filters.mentorId) params.mentorId = filters.mentorId;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.searchText) params.searchText = filters.searchText;
    if (filters.tagIds && filters.tagIds.length > 0) {
      params.tagIds = filters.tagIds.join(',');
    }

    const res = await axios.get(`${API_URL}/filter/search`, {
      ...authHeader(token),
      params,
    });
    return res.data;
  },

  // ======================================
  // TASK MANAGEMENT ENDPOINTS (TaskManagementController)
  // ======================================

  // Task Progress
  createTaskProgress: async (token, progressData) => {
    const res = await axios.post(`${TASK_MANAGEMENT_URL}/progress`, progressData, authHeader(token));
    return res.data;
  },

  getAllTaskProgress: async (token) => {
    const res = await axios.get(`${TASK_MANAGEMENT_URL}/progress`, authHeader(token));
    return res.data;
  },

  getTaskProgressById: async (token, progressId) => {
    const res = await axios.get(`${TASK_MANAGEMENT_URL}/progress/${progressId}`, authHeader(token));
    return res.data;
  },

  getTaskProgressByTaskId: async (token, taskId) => {
    const res = await axios.get(`${TASK_MANAGEMENT_URL}/progress/task/${taskId}`, authHeader(token));
    return res.data;
  },

  updateTaskProgressById: async (token, progressId, progressData) => {
    const res = await axios.put(`${TASK_MANAGEMENT_URL}/progress/${progressId}`, progressData, authHeader(token));
    return res.data;
  },

  updateProgressPercentage: async (token, progressId, percentage) => {
    const res = await axios.patch(`${TASK_MANAGEMENT_URL}/progress/${progressId}/percentage?percentage=${percentage}`, null, authHeader(token));
    return res.data;
  },

  deleteTaskProgress: async (token, progressId) => {
    const res = await axios.delete(`${TASK_MANAGEMENT_URL}/progress/${progressId}`, authHeader(token));
    return res.data;
  },

  // Task Files
  createTaskFile: async (token, fileData) => {
    const res = await axios.post(`${TASK_MANAGEMENT_URL}/files`, fileData, authHeader(token));
    return res.data;
  },

  getAllTaskFiles: async (token) => {
    const res = await axios.get(`${TASK_MANAGEMENT_URL}/files`, authHeader(token));
    return res.data;
  },

  getTaskFileById: async (token, fileId) => {
    const res = await axios.get(`${TASK_MANAGEMENT_URL}/files/${fileId}`, authHeader(token));
    return res.data;
  },

  getFilesByTaskId: async (token, taskId) => {
    const res = await axios.get(`${TASK_MANAGEMENT_URL}/files/task/${taskId}`, authHeader(token));
    return res.data;
  },

  updateTaskFile: async (token, fileId, fileData) => {
    const res = await axios.put(`${TASK_MANAGEMENT_URL}/files/${fileId}`, fileData, authHeader(token));
    return res.data;
  },

  deleteTaskFileById: async (token, fileId) => {
    const res = await axios.delete(`${TASK_MANAGEMENT_URL}/files/${fileId}`, authHeader(token));
    return res.data;
  },

  // Task Team Assignments
  createTeamAssignment: async (token, assignmentData) => {
    const res = await axios.post(`${TASK_MANAGEMENT_URL}/team-assignments`, assignmentData, authHeader(token));
    return res.data;
  },

  getAllTeamAssignments: async (token) => {
    const res = await axios.get(`${TASK_MANAGEMENT_URL}/team-assignments`, authHeader(token));
    return res.data;
  },

  getTeamAssignmentById: async (token, assignmentId) => {
    const res = await axios.get(`${TASK_MANAGEMENT_URL}/team-assignments/${assignmentId}`, authHeader(token));
    return res.data;
  },

  getAssignmentsByTaskId: async (token, taskId) => {
    const res = await axios.get(`${TASK_MANAGEMENT_URL}/team-assignments/task/${taskId}`, authHeader(token));
    return res.data;
  },

  getAssignmentsByTeamId: async (token, teamId) => {
    const res = await axios.get(`${TASK_MANAGEMENT_URL}/team-assignments/team/${teamId}`, authHeader(token));
    return res.data;
  },

  updateTeamAssignment: async (token, assignmentId, assignmentData) => {
    const res = await axios.put(`${TASK_MANAGEMENT_URL}/team-assignments/${assignmentId}`, assignmentData, authHeader(token));
    return res.data;
  },

  deleteTeamAssignment: async (token, assignmentId) => {
    const res = await axios.delete(`${TASK_MANAGEMENT_URL}/team-assignments/${assignmentId}`, authHeader(token));
    return res.data;
  },
};

export default taskApi;
