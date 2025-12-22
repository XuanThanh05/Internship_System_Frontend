import axios from "axios";
import { ROOT_API } from "./rootApi";
const API_URL = `${ROOT_API}/api/interns`;
const CLOUDINARY_URL = `${ROOT_API}/api/cloudinary`;

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ====== API ======

// GET /api/interns - Get all intern profiles
export const getAllInterns = async (token) => {
  console.log("Token gửi đi:", token);
  const response = await axios.get(API_URL, authHeader(token));
  return response.data;
};

// GET /api/interns/search - Search interns with filters
export const searchInterns = async (token, { searchTerm, major, status }) => {
  const params = {};
  if (searchTerm) params.searchTerm = searchTerm;
  if (major) params.major = major;
  if (status) params.status = status;

  const res = await axios.get(`${API_URL}/search`, {
    ...authHeader(token),
    params,
  });
  return res.data;
};

// GET /api/interns/majors - Get distinct majors
export const getMajors = async (token) => {
  const res = await axios.get(`${API_URL}/majors`, authHeader(token));
  return res.data;
};

// ===== FEATURE: NEW API =====

// GET /api/interns/{id}
export const getInternById = async (token, id) => {
  const res = await axios.get(`${API_URL}/${id}`, authHeader(token));
  return res.data;
};

// GET /api/interns/user/{userId}
export const getInternByUserId = async (token, userId) => {
  const res = await axios.get(`${API_URL}/user/${userId}`, authHeader(token));
  return res.data;
};

// GET /api/interns/status/{status}
export const getInternsByStatus = async (token, status) => {
  const res = await axios.get(`${API_URL}/status/${status}`, authHeader(token));
  return res.data;
};

// ===== CREATE =====

export const createIntern = async (token, internProfile) => {
  const payload = {
    userId: internProfile.userId,
    school: internProfile.school || "CMC University",
    major: internProfile.major || "Công nghệ thông tin",
    dob: internProfile.dob,
    address: internProfile.address || "Hà Nội",
    gender: internProfile.gender || "FEMALE",
  };

  // Only include GPA if provided
  if (internProfile.gpa) {
    payload.gpa = internProfile.gpa;
  }

  const res = await axios.post(API_URL, payload, authHeader(token));
  return res.data;
};

// ===== UPDATE =====

// PATCH /api/interns/{id} - Full update
export const updateIntern = async (token, id, internProfile) => {
  const payload = {
    userId: internProfile.userId,
    school: internProfile.school || "CMC University",
    major: internProfile.major || "Công nghệ thông tin",
    dob: internProfile.dob || "2000-01-01",
    address:
      internProfile.address?.length >= 5
        ? internProfile.address
        : "Hà Nội",
    status: internProfile.status || "PENDING",
    phoneNumber: internProfile.phoneNumber || "0000000000",
    gpa: internProfile.gpa > 0 ? internProfile.gpa : 1.0,
  };

  const res = await axios.patch(`${API_URL}/${id}`, payload, authHeader(token));
  return res.data;
};

// PATCH /api/interns/{id} - Partial update
export const partialUpdateIntern = async (token, id, internProfile) => {
  const res = await axios.patch(`${API_URL}/${id}`, internProfile, authHeader(token));
  return res.data;
};

// ===== DELETE =====

// DELETE /api/interns/{id}
export const deleteIntern = async (token, id) => {
  await axios.delete(`${API_URL}/${id}`, authHeader(token));
};

// ===== CLOUDINARY API =====

// POST /api/cloudinary/upload/avatar - Upload avatar image
export const uploadAvatar = async (token, file, internId = null) => {
  // Try different field names - backend might expect "file" or "image"
  const tryUpload = async (fieldName, urlPath = false) => {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    if (internId) {
      if (urlPath) {
        // Try internId in URL path
        const url = `${CLOUDINARY_URL}/upload/avatar/${internId}`;
        return await axios.post(url, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Try internId in form data
        formData.append("internId", String(internId));
        return await axios.post(`${CLOUDINARY_URL}/upload/avatar`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } else {
      return await axios.post(`${CLOUDINARY_URL}/upload/avatar`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  };

  // Try "file" field name first (most common)
  try {
    const res = await tryUpload("file", false);
    return res.data;
  } catch (error1) {
    // If "file" fails with validation error, try "image"
    if (error1.response?.status === 400) {
      try {
        const res = await tryUpload("image", false);
        return res.data;
      } catch (error2) {
        // If both fail, try with internId in URL path
        if (internId && error2.response?.status === 400) {
          try {
            const res = await tryUpload("file", true);
            return res.data;
          } catch (error3) {
            // Last attempt: "image" with internId in path
            if (error3.response?.status === 400) {
              const res = await tryUpload("image", true);
              return res.data;
            }
            throw error3;
          }
        }
        throw error2;
      }
    }
    throw error1;
  }
};

// POST /api/cloudinary/upload/cv - Upload CV file
export const uploadCV = async (token, file, internId = null) => {
  const formData = new FormData();
  formData.append("file", file);
  if (internId) {
    formData.append("internId", internId);
  }

  // Don't set Content-Type header - let axios set it automatically with boundary
  const res = await axios.post(
    `${CLOUDINARY_URL}/upload/cv`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        // Let axios set Content-Type automatically for FormData
      },
    }
  );
  return res.data;
};

// POST /api/cloudinary/upload/permission - Upload permission file
export const uploadPermissionFile = async (token, file, internId = null) => {
  const formData = new FormData();
  formData.append("file", file);
  if (internId) {
    formData.append("internId", internId);
  }

  // Don't set Content-Type header - let axios set it automatically with boundary
  const res = await axios.post(
    `${CLOUDINARY_URL}/upload/permission`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        // Let axios set Content-Type automatically for FormData
      },
    }
  );
  return res.data;
};

// DELETE /api/cloudinary/delete/{publicId} - Delete file by publicId
export const deleteCloudinaryFile = async (token, publicId) => {
  const res = await axios.delete(
    `${CLOUDINARY_URL}/delete/${encodeURIComponent(publicId)}`,
    authHeader(token)
  );
  return res.data;
};

// ===== UNIVERSITY CONFIRMATION UPLOAD & RETRIEVAL =====

// POST /api/cloudinary/upload/university-confirm - Upload university confirmation file
export const uploadUniversityConfirmationFile = async (token, file, internId = null) => {
  const formData = new FormData();
  formData.append("file", file);
  
  if (internId) {
    formData.append("internId", String(internId));
  }

  const res = await axios.post(
    `${CLOUDINARY_URL}/upload/university-confirm`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

// GET /api/cloudinary/university-confirm/{internId} - Get university confirmation file for intern
export const getUniversityConfirmationFile = async (token, internId) => {
  const res = await axios.get(
    `${CLOUDINARY_URL}/university-confirm/${internId}`,
    authHeader(token)
  );
  return res.data;
};