import React, { useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { ROOT_API } from "../../api/rootApi";
const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { setUser, setToken, loading } = useContext(AuthContext);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const processOAuthLogin = async () => {
      try {
        // Get token from URL query params
        const token = searchParams.get("token");

        if (!token) {
          console.error("No token in URL");
          navigate("/login");
          return;
        }

        // Decode token to get user info
        const decoded = jwtDecode(token);

        // Create user data object
        let userData = {
          email: decoded.email || decoded.sub,
          role: decoded.role,
          userId: decoded.userId || decoded.id,
          fullName: decoded.fullName || decoded.name,
          // NEW CLAIMS
          userStatus: decoded.userStatus,
          internStatus: decoded.internStatus,
          internConfirmStatus: decoded.internConfirmStatus
        };

        // If user is INTERN, fetch internId
        if (userData.role === "INTERN") {
          try {
            const internResponse = await axios.get(
              `${ROOT_API}/api/interns/user/${userData.userId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (internResponse.data?.internProfile?.internId) {
              userData.internId = internResponse.data.internProfile.internId;
            } else if (internResponse.data?.internId) {
              userData.internId = internResponse.data.internId;
            } else if (internResponse.data?.id) {
              userData.internId = internResponse.data.id;
            }
          } catch (err) {
            console.warn("Could not fetch internId:", err.message);
          }
        }

        // Cookie options
        const cookieOptions = {
          expires: 1,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
          path: "/"
        };

        // Store in cookies
        Cookies.set("token", token, cookieOptions);
        Cookies.set("user", JSON.stringify(userData), cookieOptions);
        Cookies.set("userId", String(userData.userId), cookieOptions);
        Cookies.set("role", userData.role, cookieOptions);

        if (userData.internId) {
          Cookies.set("internId", String(userData.internId), cookieOptions);
        }

        // NEW status cookies (added in AuthContext)
        Cookies.set("userStatus", userData.userStatus ?? "", cookieOptions);
        Cookies.set("internStatus", userData.internStatus ?? "", cookieOptions);
        Cookies.set("internConfirmStatus", userData.internConfirmStatus ?? "", cookieOptions);


        // Update context
        setUser(userData);
        setToken(token);

        console.log("OAuth login successful, redirecting to dashboard");

        // Redirect based on role
        if (userData.role === "INTERN") {
          navigate("/intern/dashboard");
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("OAuth processing error:", error);
        navigate("/login");
      }
    };

    if (!loading) {
      processOAuthLogin();
    }
  }, [loading, searchParams, navigate, setUser, setToken]);

  return (
    <div style={{ textAlign: "center", marginTop: "120px" }}>
      <h2>🎉 Đăng nhập thành công!</h2>
      <p>Đang chuyển hướng đến trang chính...</p>
    </div>
  );
};

export default OAuthSuccess;