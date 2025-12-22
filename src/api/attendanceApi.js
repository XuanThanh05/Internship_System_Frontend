import axios from "axios";
import { ROOT_API } from "./rootApi";
const API_URL = `${ROOT_API}/api/attendances`;

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const checkIn = async (token, internId) => {
  const res = await axios.post(
    `${API_URL}/check-in/${internId}`,
    {},
    authHeader(token)
  );
  return res.data;
};

export const checkOut = async (token, internId) => {
  const res = await axios.post(
    `${API_URL}/check-out/${internId}`,
    {},
    authHeader(token)
  );
  return res.data;
};

export const getTodayAttendance = async (token, internId) => {
  const res = await axios.get(
    `${API_URL}/today/${internId}`,
    authHeader(token)
  );
  return res.data;
};

export const getAttendanceHistory = async (token, internId) => {
  const res = await axios.get(
    `${API_URL}/intern/${internId}`,
    authHeader(token)
  );
  return res.data;
};

export const getAttendanceByDateRange = async (
  token,
  internId,
  startDate,
  endDate
) => {
  const res = await axios.get(
    `${API_URL}/history/${internId}/range`,
    {
      ...authHeader(token),
      params: { startDate, endDate },
    }
  );
  return res.data;
};

export const getAttendanceStatistics = async (token, internId) => {
  const res = await axios.get(
    `${API_URL}/statistics/${internId}`,
    authHeader(token)
  );
  return res.data;
};

export const getMonthlyStatistics = async (token, internId, year, month) => {
  const res = await axios.get(
    `${API_URL}/statistics/${internId}/monthly`,
    {
      ...authHeader(token),
      params: { year, month },
    }
  );
  return res.data;
};

export const getAllAttendances = async (token) => {
  const res = await axios.get(API_URL, authHeader(token));
  return res.data;
};

export const createAttendance = async (token, attendance) => {
  const res = await axios.post(API_URL, attendance, authHeader(token));
  return res.data;
};

export const updateAttendance = async (token, id, attendance) => {
  const res = await axios.put(
    `${API_URL}/${id}`,
    attendance,
    authHeader(token)
  );
  return res.data;
};

export const deleteAttendance = async (token, id) => {
  await axios.delete(`${API_URL}/${id}`, authHeader(token));
};

export const getDailyAttendanceForHR = async (token, date) => {
  const res = await axios.get(`${API_URL}/hr/daily`, {
    ...authHeader(token),
    params: { date },
  });
  return res.data;
};

export const getMonthlyAttendanceForHR = async (token, year, month) => {
  const res = await axios.get(`${API_URL}/hr/monthly`, {
    ...authHeader(token),
    params: { year, month },
  });
  return res.data;
};