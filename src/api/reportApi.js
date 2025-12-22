import axios from "axios";
import { ROOT_API } from "./rootApi";
const API_URL_REPORTS = `${ROOT_API}/api/reports`;

const reportApi = {
  getFinalEvaluationReportByProgram: async (token, programId, teamId) => {
    const params = {};
    if (teamId) params.teamId = teamId;

    const res = await axios.get(
      `${API_URL_REPORTS}/program/${programId}/final-evaluations`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params,
      }
    );
    return res.data;
  },

  exportFinalEvaluationReportByProgram: async (token, programId, teamId) => {
    const params = {};
    if (teamId) params.teamId = teamId;

    const res = await axios.get(
      `${API_URL_REPORTS}/program/${programId}/final-evaluations/export`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params,
        responseType: "blob",
      }
    );
    return res.data;
  },

  getFinalEvaluationReportByTeam: async (token, teamId) => {
    const res = await axios.get(
      `${API_URL_REPORTS}/team/${teamId}/final-evaluations`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  },

  exportFinalEvaluationReportByTeam: async (token, teamId) => {
    const res = await axios.get(
      `${API_URL_REPORTS}/team/${teamId}/final-evaluations/export`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      }
    );
    return res.data;
  },
};

export default reportApi;
