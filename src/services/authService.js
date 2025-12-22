// src/services/authService.js
import axios from "axios";
import Cookies from "js-cookie";
import { ROOT_API } from "../api/rootApi";
const BASE_URL_ADMIN = `${ROOT_API}/api/admin/users`;
const BASE_URL_AUTH = `${ROOT_API}/api/auth`;

export const authService = {
  // 🔹 Admin: create user manually (with token)
  register: async (formData, roleName) => {
    try {
      const token = Cookies.get("token");

      const res = await axios.post(
        `${BASE_URL_ADMIN}/create?roleName=${roleName}`,
        formData,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        }
      );
      return res.data;
    } catch (error) {
      console.error(error.response?.data || error.message);
      throw error;
    }
  },

  // 🔹 Normal user (intern) registration
  registerIntern: async (formData) => {
    try {
      const res = await axios.post(`${BASE_URL_AUTH}/register`, formData);
      return (
        res.data
      );
    } catch (error) {
      throw error
    }
  },

  // 🔹 Login
  login: async (credentials) => {
    try {
      const res = await axios.post(`${BASE_URL_AUTH}/login`, credentials);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // 🔹 Verify OTP
  verifyOtp: async (email, otp) => {
    try {
      const res = await axios.post(`${BASE_URL_AUTH}/verify-otp`, null, {
        params: { email, otp },
      });
      return res.data;
    } catch (error) {
      throw error
    }
  },

  // 🔹 Resend OTP
  resendOtp: async (email) => {
    try {
      const res = await axios.post(`${BASE_URL_AUTH}/resend-otp`, null, {
        params: { email },
      });
      return res.data;
    } catch (error) {
      throw error
    }
  },

  // Send reset link
    sendResetLink: async (email) => {
      try {
        const res = await axios.post(`${BASE_URL_AUTH}/forgot-password`, null, {
          params: { email },
        });
        return res.data;
      } catch (error) {
        throw error
      }
    },
  // Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const res = await axios.post(`${BASE_URL_AUTH}/reset-password`, null, {
        params: { token, newPassword } // <-- send as query params
      });
      return res.data;
    } catch (error) {
      throw error
    }
  },

  // Resend reset link
    resendResetLink: async (email) => {
      try {
        const res = await axios.post(`${BASE_URL_AUTH}/resend-reset-link`, null, {
          params: { email },
        });
        return res.data;
      } catch (error) {
        throw error
      }
    },

};
