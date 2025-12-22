import axios from "axios";
import allowanceApi from "./allowanceApi.js";
import { ROOT_API } from "./rootApi";
const API_URL = `${ROOT_API}/api/hr/interns`;
const API_URL_MENTOR_ASSIGN = `${ROOT_API}/api/hr/mentor-assignments`;
const API_URL_MENTOR = `${ROOT_API}/api/mentors`;
const API_URL_CONTRACTS = `${ROOT_API}/api/hr/contracts`;
const API_URL_PROGRAM = `${ROOT_API}/api/programs`;
const API_URL_TEAMS = `${ROOT_API}/api/teams`;

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});


const hrApi = {
  // Lấy danh sách interns
  AllInterns: async (token, page = 0, size = 10) => {
    const response = await axios.get(API_URL, {
      ...authHeader(token),
      params: { page, size },
    });
    return response.data;
  },

    // --------- PROGRAM METHODS ---------
    getAllPrograms: async (token, { page = 1, size = 10, sortBy = "programId", sortDir = "desc" } = {}) => {
      const res = await axios.get(API_URL_PROGRAM, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, size, sortBy, sortDir },
      });
      return res.data; // returns { data, currentPage, totalItems, totalPages }
    },

    createProgram: async (token, programData) => {
      const res = await axios.post(`${API_URL_PROGRAM}/create`, programData, authHeader(token));
      return res.data;
    },

    updateProgram: async (token, programId, programData) => {
      const res = await axios.put(`${API_URL_PROGRAM}/${programId}`, programData, authHeader(token));
      return res.data;
    },

    deleteProgram: async (token, programId) => {
      const res = await axios.delete(`${API_URL_PROGRAM}/${programId}`, authHeader(token));
      return res.data;
    },

    getCloneTemplate: async (token, programId) => {
      const res = await axios.get(`${API_URL_PROGRAM}/${programId}/clone-template`, authHeader(token));
      return res.data;
    },

    cloneProgram: async (token, cloneData) => {
      const res = await axios.post(`${API_URL_PROGRAM}/clone`, cloneData, authHeader(token));
      return res.data;
    },


    // Program Overview
      getProgramOverview: async (token, programId) => {
        const res = await axios.get(`${API_URL_TEAMS}/${programId}/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return res.data; // returns { totalTeams, totalInterns, totalMentors, mentorNames }
      },

      getTeamsInProgram: async (token, programId) => {
        const res = await axios.get(`${API_URL_TEAMS}/${programId}/teams`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
      },

      getMentorsForProgram: async (token, programId) => {
        const res = await axios.get(`${API_URL_TEAMS}/${programId}/mentors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
      },

      getMentorByTeam: async (token, teamId) => {
          const res = await axios.get(`${API_URL_TEAMS}/${teamId}/mentor`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          return res.data; // returns MentorInfoDTO
        },


      // Search programs by name
      searchPrograms: async (token, name) => {
        const res = await axios.get(`${API_URL_PROGRAM}/search`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { name },
        });
        return res.data;
      },

      // Filter programs by department
      filterProgramsByDepartment: async (token, department) => {
        const res = await axios.get(`${API_URL_PROGRAM}/filter/department`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { department },
        });
        return res.data;
      },

      getDepartments: async (token) => {
        const res = await axios.get(`${API_URL_PROGRAM}/department`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return res.data; // list of strings
      },

      // Filter programs by mentor
      filterProgramsByMentor: async (token, mentorId) => {
        const res = await axios.get(`${API_URL_PROGRAM}/filter/mentor`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { mentorId },
        });
        return res.data;
      },

      // Fetch mentors who are assigned to at least 1 program
      getAssignedMentorsDropdown: async (token) => {
        const res = await axios.get(`${API_URL_PROGRAM}/mentor-assigned`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return res.data; // list of { mentorId, mentorName }
      },

      // hrApi.js
      searchMentors: async (token, name) => {
        const res = await axios.get(`${API_URL_TEAMS}/mentors/search`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { name },
        });
        return res.data; // array of MentorInfoDTO
      },

      assignMentorToTeam: async (token, programId, mentorId) => {
        const res = await axios.post(
          `${API_URL_TEAMS}/assign-mentor`,
          { programId, mentorId },
          authHeader(token)
        );
        return res.data;
      },

      removeMentorFromProgram: async (token, programId, mentorId) => {
        const res = await axios.delete(`${API_URL_TEAMS}/${programId}/mentors/${mentorId}`,
          authHeader(token)
        );
        return res.data;
      },

      assignMentorToProgram: async (token, programId, mentorId) => {
        const res = await axios.post(
          `${API_URL_PROGRAM}/${programId}/assign-mentor/${mentorId}`,
          {},
          authHeader(token)
        );
        return res.data;
      },

      getMentorsAssignedToProgram: async (token, programId) => {
        const res = await axios.get(
          `${API_URL_PROGRAM}/${programId}/mentors`,
          authHeader(token)
        );
        return res.data;
      },

      // Create a team
      createTeam: async (token, createTeamData) => {
        const res = await axios.post(`${API_URL_TEAMS}/teams/create`, createTeamData, authHeader(token));
        return res.data;
      },

      // Update a team
      updateTeam: async (token, teamId, updateTeamData) => {
        const res = await axios.put(`${API_URL_TEAMS}/teams/${teamId}`, updateTeamData, authHeader(token));
        return res.data;
      },

      // Delete a team
      deleteTeam: async (token, teamId) => {
        const res = await axios.delete(`${API_URL_TEAMS}/teams/${teamId}`, authHeader(token));
        return res.data;
      },

      searchMentorsInProgram: async (token, programId, query) => {
        const res = await axios.get(`${API_URL_TEAMS}/${programId}/mentors/search`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { q: query },
        });
        return res.data; // returns array of MentorInfoDTO
      },

      searchAvailableInterns: async (token, keyword) => {
          const res = await axios.get(`${API_URL_TEAMS}/search`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { keyword },
          });
          return res.data; // returns array of InternSearchDTO
      },

      addInternToTeam: async (token, programId, teamId, internId) => {
          const res = await axios.post(
            `${API_URL_TEAMS}/${programId}/${teamId}/add-intern`,
            null, // POST body is empty
            {
              headers: { Authorization: `Bearer ${token}` },
              params: { internId }, // internId in query param
            }
          );
          return res.data; // returns success message
      },

      // Remove intern from team (optional later)
      removeInternFromTeam: async (token, teamId, internId) => {
          const res = await axios.delete(
            `${API_URL_TEAMS}/teams/${teamId}/interns/${internId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          return res.data; // returns success message
      },

      getInternsInTeam: async (token, teamId) => {
        const res = await axios.get(`${API_URL_TEAMS}/${teamId}/interns`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return res.data; // returns array of InternDetailDTO
      },

      // --------- AUTO TEAM METHODS ---------

      // GET /api/programs/{programId}/auto-teams/interns/auto
      getAvailableInternsAuto: async (token, programId) => {
        const res = await axios.get(
          `${API_URL_PROGRAM}/${programId}/auto-teams/interns/auto`,
          authHeader(token)
        );
        return res.data; // --> List<InternAutoDTO>
      },

      // GET /api/programs/{programId}/auto-teams/interns/auto/filter?major=CS
      filterInternsAutoByMajor: async (token, programId, major) => {
        const res = await axios.get(
          `${API_URL_PROGRAM}/${programId}/auto-teams/interns/auto/filter`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { major },
          }
        );
        return res.data; // --> List<InternAutoDTO>
      },

      // POST /api/programs/{programId}/auto-teams/interns/auto/create
      createAutoTeams: async (token, programId, requestBody) => {
        const res = await axios.post(
          `${API_URL_PROGRAM}/${programId}/auto-teams/interns/auto/create`,
          requestBody,
          authHeader(token)
        );
        return res.data; // --> List<AutoTeamResultDTO>
      },
      finishProgram: async (token, programId) => {
        const res = await axios.put(
          `${API_URL_PROGRAM}/${programId}/finish`,
          null, // no body required
          authHeader(token)
        );
        return res.data; // message + updatedInterns
      },


  // Lấy danh sách contracts
  // Accepts either (token, page, size) OR (token, { searchTerm, status, page, size })
  getContracts: async (token, optionsOrPage = 0, size = 10) => {
    const params = {};
    if (typeof optionsOrPage === "object") {
      const { searchTerm, status, page = 0, size: s = 10 } = optionsOrPage || {};
      if (searchTerm) params.searchTerm = searchTerm;
      if (status) params.status = status;
      params.page = page;
      params.size = s;
    } else {
      params.page = optionsOrPage || 0;
      params.size = size || 10;
    }

    const response = await axios.get(API_URL_CONTRACTS, {
      ...authHeader(token),
      params,
    });
    return response.data;
  },

  // Upload a new contract for an intern
  uploadContract: async (token, internId, file, note) => {
    const formData = new FormData();
    formData.append("file", file);
    if (note) formData.append("note", note);

    const res = await axios.post(`${API_URL_CONTRACTS}/${internId}/upload`, formData, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Replace existing contract document
  replaceContract: async (token, documentId, file, note) => {
    const formData = new FormData();
    formData.append("file", file);
    if (note) formData.append("note", note);

    const res = await axios.patch(`${API_URL_CONTRACTS}/${documentId}/replace`, formData, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Update contract note without uploading a new file
  updateContractNote: async (token, documentId, note) => {
    const res = await axios.patch(`${API_URL_CONTRACTS}/${documentId}/note`, { note }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Delete contract
  deleteContract: async (token, documentId) => {
    const res = await axios.delete(`${API_URL_CONTRACTS}/${documentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Download contract file as blob
  downloadContract: async (token, documentId) => {
    const res = await axios.get(`${API_URL_CONTRACTS}/${documentId}/download`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    });
    return res.data; // Blob for file download
  },

  searchInterns: async (token, { searchTerm, major, school, status, page = 0, size = 10 }) => {
    const params = { page, size };
    if (searchTerm) params.searchTerm = searchTerm;
    if (major) params.major = major;
    if (school) params.school = school;
    if (status) params.status = status;

    const res = await axios.get(`${API_URL}/search`, {
      ...authHeader(token),
      params,
    });
    return res.data;
  },

  updateInternStatus: async (token, id, status, rejectionReason = null) => {
    const params = { status };
    if (rejectionReason) params.rejectionReason = rejectionReason;

    const res = await axios.patch(`${API_URL}/${id}/status`, null, {
      ...authHeader(token),
      params,
    });
    return res.data;
  },

  updateInternStatusesBatch: async (token, internIds, status, rejectionReason = null) => {
    const body = { internIds, status };
    if (rejectionReason) body.rejectionReason = rejectionReason;

    const res = await axios.patch(`${API_URL}/status/batch`, body, authHeader(token));
    return res.data;
  },

  createInternProfile: async (token, userId, profileData) => {
    const {
      full_name,
      gender,
      dob,
      major,
      gpa,
      school,
      address,
      phone,
      universityConfirm = null,
      avatar = null,
    } = profileData || {};

    const formData = new FormData();
    formData.append("fullName", full_name);
    formData.append("gender", gender);
    formData.append("dob", dob);
    formData.append("major", major);
    formData.append("gpa", gpa);
    formData.append("school", school);
    formData.append("address", address);

    // Chỉ gửi các field file khi thực sự có giá trị, tránh gửi "null" lên backend
    if (universityConfirm !== null && universityConfirm !== "") {
      formData.append("universityConfirm", universityConfirm);
    }
    if (avatar !== null && avatar !== "") {
      formData.append("avatar", avatar);
    }

    const res = await axios.post(`${API_URL}/${userId}/profile?phone=${phone}`, formData, {
      ...authHeader(token),
    });
    return res.data;
  },

  getAllMajors: async (token) => {
    const res = await axios.get(`${API_URL}/majors`, {
      ...authHeader(token),
    });
    return res.data;
  },

  getAllSchools: async (token) => {
    const res = await axios.get(`${API_URL}/schools`, {
      ...authHeader(token),
    });
    return res.data;
  },

  getInternCandidatesWithoutProfile: async (token, page = 0, size = 10) => {
    const response = await axios.get(`${API_URL}/candidates`, {
      ...authHeader(token),
      params: { page, size },
    });
    return response.data;
  },

  updateInternProfile: async (token, internId, profileData) => {
    try {
      const res = await axios.patch(`${API_URL}/${internId}/profile`, {
        school: profileData.school,
        major: profileData.major,
        dob: profileData.dob,
        address: profileData.address,
        phone: profileData.phone,
        gender: profileData.gender,
        gpa: profileData.gpa,
        universityConfirm: profileData.universityConfirm,
        avatar: profileData.avatar,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  },

  getInternAssignments: async (token, { search = "", filter = "all", mentorId = null } = {}) => {
    const params = {};
    if (search) params.search = search;
    if (filter) params.filter = filter;

    const res = await axios.get(`${API_URL_MENTOR_ASSIGN}/interns`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return res.data;
  },

  assignMentor: async (token, { internId, mentorId }) => {
    const res = await axios.post(`${API_URL_MENTOR_ASSIGN}/assign`, {
      internId, mentorId,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  reassignMentor: async (token, { internId, mentorId }) => {
    const res = await axios.put(`${API_URL_MENTOR_ASSIGN}/reassign`, {
      internId, mentorId,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getAllMentors: async (token) => {
    const res = await axios.get(`${API_URL_MENTOR_ASSIGN}/mentors`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};

// Merge allowance API methods for backward compatibility
const hrApiWithAllowance = {
  ...hrApi,
  ...allowanceApi,
};

export default hrApiWithAllowance;
