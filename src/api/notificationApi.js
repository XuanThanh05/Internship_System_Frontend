import axios from "axios";
import { ROOT_API } from "./rootApi";
const NOTIFICATION_API_URL = `${ROOT_API}/api/notifications`;

const notificationApi = {
  // Get all notifications for intern
  getInternNotifications: async (token, internId) => {
    const res = await axios.get(`${NOTIFICATION_API_URL}/intern/${internId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Get unread notifications for intern
  getUnreadNotifications: async (token, internId) => {
    const res = await axios.get(`${NOTIFICATION_API_URL}/intern/${internId}/unread`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Get notification by ID
  getNotificationById: async (token, notificationId) => {
    const res = await axios.get(`${NOTIFICATION_API_URL}/${notificationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Mark notification as read
  markNotificationAsRead: async (token, notificationId) => {
    const res = await axios.put(`${NOTIFICATION_API_URL}/${notificationId}/mark-read`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Delete notification
  deleteNotification: async (token, notificationId) => {
    const res = await axios.delete(`${NOTIFICATION_API_URL}/${notificationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Create notification for intern
  createNotification: async (token, notificationData) => {
    const res = await axios.post(NOTIFICATION_API_URL, notificationData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (token, internId) => {
    const res = await axios.put(`${NOTIFICATION_API_URL}/intern/${internId}/mark-all-read`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};

export default notificationApi;