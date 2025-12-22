import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { authService } from "../services/authService";
import axios from "axios";
import { ROOT_API } from "../api/rootApi";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const cookieToken = Cookies.get("token");
    return cookieToken;
  });

  const [userStatus,setUserStatus] = useState(null);
  const [internStatus,setInternStatus] = useState(null);
  const [internConfirmStatus,setInternConfirmStatus] = useState(null);

  const [loading, setLoading] = useState(true);

  // Cookie configuration for secure storage
  const cookieOptions = {
    expires: 1, // 1 day
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    path: "/"
  };

  useEffect(() => {
    // Check cookies for token and user data
    const cookieToken = Cookies.get("token");
    const storedUser = Cookies.get("user");

    const storedUserStatus = Cookies.get("userStatus");
    const storedInternStatus = Cookies.get("internStatus");
    const storedInternConfirmStatus = Cookies.get("internConfirmStatus");

    console.log("Checking for stored credentials:", {
      hasToken: !!cookieToken,
      hasUser: !!storedUser
    });

    if (cookieToken && storedUser) {
      try {
        const payload = jwtDecode(cookieToken);
        // Check token expiration
        if (payload.exp * 1000 < Date.now()) {
          console.warn("Token expired");
          Cookies.remove("token");
          Cookies.remove("user");
          Cookies.remove("userId");
          Cookies.remove("role");
          Cookies.remove("internId");
          Cookies.remove("userStatus");
          Cookies.remove("internStatus");
          Cookies.remove("internConfirmStatus");
        } else {
          // Parse stored user data from cookie
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setToken(cookieToken);

          setUserStatus(storedUserStatus);
          setInternStatus(storedInternStatus);
          setInternConfirmStatus(storedInternConfirmStatus);

          console.log("Credentials restored from cookies:", {
            email: userData.email,
            userId: userData.userId,
            internId: userData.internId,
            role: userData.role
          });
        }
      } catch (err) {
        console.error("Invalid token or user data", err);
        Cookies.remove("token");
        Cookies.remove("user");
        Cookies.remove("userId");
        Cookies.remove("role");
        Cookies.remove("internId");

        Cookies.remove("userStatus");
        Cookies.remove("internStatus");
        Cookies.remove("internConfirmStatus");
      }
    } else {
      console.log("No stored credentials found");
    }
    setLoading(false);
  }, []);


  // Login and store all sensitive data in secure cookies
  const login = async (email, password) => {
    try {
      console.log("Attempting login for:", email);
      const res = await authService.login({ email, password });
      console.log("Login response:", res);

      // Handle different token formats
      let jwt = res.token;
      if (typeof jwt === "string") {
        jwt = jwt.replace("Bearer ", ""); // Remove "Bearer " prefix if present
      }

      if (!jwt) {
        throw new Error("No token received from server");
      }

      console.log("Token to store:", jwt.substring(0, 20) + "...");

      // Prepare user data
      let userData = {
        email: res.email,
        role: res.role,
        userId: res.userId,
        fullName: res.fullName || res["fullName:"],
        internId: res.internId, // internId from login response (may be undefined)
        userStatus: res.userStatus,              // NEW
        internStatus: res.internStatus,          // NEW
        internConfirmStatus: res.internConfirmStatus
      };

      // If user is INTERN and internId is not in login response, fetch it from API
      if (userData.role === "INTERN" && !userData.internId) {
        try {
          const internResponse = await axios.get(
            `${ROOT_API}/api/interns/user/${userData.userId}`,
            { headers: { Authorization: `Bearer ${jwt}` } }
          );
          // Handle different response structures
          if (internResponse.data?.internProfile?.internId) {
            userData.internId = internResponse.data.internProfile.internId;
            console.log("Fetched internId from internProfile:", userData.internId);
          } else if (internResponse.data?.internId) {
            userData.internId = internResponse.data.internId;
            console.log("Fetched internId from root:", userData.internId);
          } else if (internResponse.data?.id) {
            userData.internId = internResponse.data.id;
            console.log("Fetched internId (as id) from API:", userData.internId);
          }
        } catch (err) {
          console.warn("Could not fetch internId from API:", err.message);
        }
      }

      // Store all sensitive data in secure cookies
      Cookies.set("token", jwt, cookieOptions);
      Cookies.set("user", JSON.stringify(userData), cookieOptions);
      Cookies.set("userId", String(userData.userId), cookieOptions);
      Cookies.set("role", userData.role, cookieOptions);
      
      if (userData.internId) {
        Cookies.set("internId", String(userData.internId), cookieOptions);
      }

       // NEW: Store statuses also in cookies (optional, convenient for frontend)
      Cookies.set("userStatus", userData.userStatus ?? "", cookieOptions);
      Cookies.set("internStatus", userData.internStatus ?? "", cookieOptions);
      Cookies.set("internConfirmStatus", userData.internConfirmStatus ?? "", cookieOptions);

      console.log("All credentials stored in secure cookies");
      console.log("User data:", userData);

      setUser(userData);
      setToken(jwt);
      return userData;
    } catch (err) {
      console.error("Login error:", err);
      // Clear any partial storage on error
      Cookies.remove("token");
      Cookies.remove("user");
      Cookies.remove("userId");
      Cookies.remove("role");
      Cookies.remove("internId");

      Cookies.remove("userStatus");
      Cookies.remove("internStatus");
      Cookies.remove("internConfirmStatus");

      throw err;
    }
  };

  const logout = () => {
    // Clear all sensitive data from cookies
    Cookies.remove("token");
    Cookies.remove("user");
    Cookies.remove("userId");
    Cookies.remove("role");
    Cookies.remove("internId");
    Cookies.remove("userStatus");
    Cookies.remove("internStatus");
    Cookies.remove("internConfirmStatus");
    
    // Clear any remaining localStorage data
    localStorage.removeItem("lastRoute");
    
    setUser(null);
    setToken(null);
    setUserStatus(null);
    setInternStatus(null);
    setInternConfirmStatus(null);
    console.log("User logged out, all credentials cleared");
  };

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      res => res,
      err => {
        const originalRequest = err.config;
        // Skip redirect if it's the login request
        if (err.response && err.response.status === 401 && !originalRequest.url.includes("/login")) {
          logout();
          window.location.href = "/login";
        }
        return Promise.reject(err);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);
  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser, setUserStatus, setInternStatus, setInternConfirmStatus, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
