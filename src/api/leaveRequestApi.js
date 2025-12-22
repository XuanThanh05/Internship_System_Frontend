import axios from 'axios';
import { ROOT_API } from "./rootApi";
const API_BASE_URL = `${ROOT_API}`;

export const createLeaveRequest = async (token, internId, data) => {
 try {
   const response = await axios.post(
     `${API_BASE_URL}/api/leave-requests?internId=${internId}`,
     data,
     {
       headers: {
         Authorization: `Bearer ${token}`,
         'Content-Type': 'application/json',
       },
     }
   );
   return response.data;
 } catch (error) {
   throw error.response?.data || error;
 }
};

export const getMyLeaveRequests = async (token, internId) => {
 try {
   const response = await axios.get(
     `${API_BASE_URL}/api/leave-requests/my-requests?internId=${internId}`,
     {
       headers: {
         Authorization: `Bearer ${token}`,
       },
     }
   );
   return response.data;
 } catch (error) {
   throw error.response?.data || error;
 }
};

export const getLeaveRequestById = async (token, leaveId, internId) => {
 try {
   const response = await axios.get(
     `${API_BASE_URL}/api/leave-requests/${leaveId}?internId=${internId}`,
     {
       headers: {
         Authorization: `Bearer ${token}`,
       },
     }
   );
   return response.data;
 } catch (error) {
   throw error.response?.data || error;
 }
};

export const cancelLeaveRequest = async (token, leaveId, internId) => {
 try {
   const response = await axios.delete(
     `${API_BASE_URL}/api/leave-requests/${leaveId}?internId=${internId}`,
     {
       headers: {
         Authorization: `Bearer ${token}`,
       },
     }
   );
   return response.data;
 } catch (error) {
   throw error.response?.data || error;
 }
};

export const getAllLeaveRequestsForHR = async (token, status) => {
  try {
    const params = new URLSearchParams();
    if (status) {
      params.append('status', status);
    }

    const queryString = params.toString();
    const url = queryString
      ? `${API_BASE_URL}/api/leave-requests/all?${queryString}`
      : `${API_BASE_URL}/api/leave-requests/all`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getDailyLeaveForHR = async (token, date, status) => {
  try {
    const params = new URLSearchParams();
    if (date) {
      params.append('date', date);
    }
    if (status) {
      params.append('status', status);
    }

    const response = await axios.get(
      `${API_BASE_URL}/api/leave-requests/hr/daily?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getMonthlyLeaveForHR = async (token, year, month, status) => {
  try {
    const params = new URLSearchParams();
    if (year) {
      params.append('year', year);
    }
    if (month) {
      params.append('month', month);
    }
    if (status) {
      params.append('status', status);
    }

    const response = await axios.get(
      `${API_BASE_URL}/api/leave-requests/hr/monthly?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const approveLeaveRequestByHR = async (token, leaveId, hrId) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/leave-requests/${leaveId}/approve?hrId=${hrId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const rejectLeaveRequestByHR = async (
  token,
  leaveId,
  hrId,
  rejectionReason
) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/leave-requests/${leaveId}/reject?hrId=${hrId}&rejectionReason=${encodeURIComponent(
        rejectionReason
      )}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getLeaveRequestsByInternForHR = async (token, internId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/leave-requests/intern/${internId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
