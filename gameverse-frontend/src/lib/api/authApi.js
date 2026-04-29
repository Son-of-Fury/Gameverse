import { request } from "../http/request.js";
import { upload } from "../http/upload.js";

export const authApi = {
    register: (data) => request("/api/auth/register", { method: "POST", body: data }),
    login: (data) => request("/api/auth/login", { method: "POST", body: data }),
    requestPasswordReset: (data) => request("/api/auth/request-password-reset", { method: "POST", body: data }),
    resetPassword: (data) => request("/api/auth/reset-password", { method: "POST", body: data }),
    me: () => request("/api/auth/me", { auth: true }),
    updateMe: (data) => request("/api/auth/me", { method: "PUT", auth: true, body: data }),
    deleteMe: () => request("/api/auth/me", { method: "DELETE", auth: true }),
    uploadProfileImage: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return upload("/api/auth/me/profile-image", formData, { auth: true });
    }
};
