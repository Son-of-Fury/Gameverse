import { request } from "../http/request.js";
import { upload } from "../http/upload.js";

export const adminApi = {
    adminUsers: () => request("/api/admin/users", { auth: true }),
    adminCreateUser: (data) => request("/api/admin/users", { method: "POST", auth: true, body: data }),
    adminUpdateUser: (userId, data) => request(`/api/admin/users/${userId}`, { method: "PUT", auth: true, body: data }),
    adminDeleteUser: (userId) => request(`/api/admin/users/${userId}`, { method: "DELETE", auth: true }),
    adminGames: () => request("/api/admin/games", { auth: true }),
    adminGameDetails: (gameId) => request(`/api/admin/games/${gameId}`, { auth: true }),
    adminCreateGame: (data) => request("/api/admin/games", { method: "POST", auth: true, body: data }),
    adminUpdateGame: (gameId, data) => request(`/api/admin/games/${gameId}`, { method: "PUT", auth: true, body: data }),
    adminPreviewGame: (slug) => request(`/api/admin/games/${slug}/preview`, { auth: true }),
    adminUpdateGameStatus: (gameId, status) => request(`/api/admin/games/${gameId}/status`, { method: "PATCH", auth: true, body: { status } }),
    adminDeleteGame: (gameId) => request(`/api/admin/games/${gameId}`, { method: "DELETE", auth: true }),
    adminUploadGameImage: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return upload("/api/admin/games/image", formData, { auth: true });
    }
};
