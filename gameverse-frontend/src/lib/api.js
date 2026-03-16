const TOKEN_KEY = "gv_token";
const CONSENT_KEY = "gv_consent";
const LANGUAGE_KEY = "gv_language";

// consent
export function hasConsent() {
    return localStorage.getItem(CONSENT_KEY) === "true";
}

// consent
export function setConsent(val) {
    localStorage.setItem(CONSENT_KEY, val ? "true" : "false");
}

// token
export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

// token
export function setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
}

// language
function getLanguage() {
    return localStorage.getItem(LANGUAGE_KEY) || "hu";
}

// error text
function normalizeServerMessage(error) {
    const message = error?.response?.data?.error || error?.message || "";
    const normalized = String(message).trim();

    if (!normalized) return "";
    if (/^error:\s*\d+/i.test(normalized)) return "";
    if (/^\d{3}\s+[a-z]/i.test(normalized)) return "";
    if (/internal server error/i.test(normalized)) return "";

    return normalized;
}

// error map
export function getActionError(error, t, action) {
    const status = error?.status || error?.response?.status;
    const serverMessage = normalizeServerMessage(error);

    if (status === 401) {
        if (action === "login") return t("errors.login.invalidCredentials");
        if (action === "like" || action === "dislike") return t("errors.rating.loginRequired");
        if (action === "submitScore") return t("errors.score.loginRequired");
        if (action === "profileLoad" || action === "profileSave" || action === "profileUpload") return t("errors.auth.sessionExpired");
        if (action?.startsWith("admin")) return t("errors.admin.notAllowed");
        return t("errors.auth.loginRequired");
    }

    if (status === 403) {
        if (action?.startsWith("admin")) return t("errors.admin.notAllowed");
        return t("errors.auth.forbidden");
    }

    if (status === 404) {
        if (action === "requestPasswordReset") return t("errors.reset.requestFailed");
        return serverMessage || t("errors.common.notFound");
    }

    if (status === 409) {
        if (action === "register") return t("errors.register.conflict");
        if (action === "adminCreateUser") return t("errors.admin.userConflict");
        if (action === "adminCreateGame") return t("errors.admin.gameConflict");
    }

    if (status === 400) {
        if (action === "login") return serverMessage || t("errors.login.invalidCredentials");
        if (action === "register") return serverMessage || t("errors.register.invalidData");
        if (action === "requestPasswordReset") return serverMessage || t("errors.reset.requestFailed");
        if (action === "resetPassword") return serverMessage || t("errors.reset.invalidToken");
        if (action === "profileSave") return serverMessage || t("errors.profile.save");
        if (action === "profileUpload") return serverMessage || t("errors.profile.upload");
        if (action === "adminCreateGame") return serverMessage || t("errors.admin.gameCreate");
        if (action === "adminUpdateGame") return serverMessage || t("errors.admin.gameUpdate");
        if (action === "adminCreateUser") return serverMessage || t("errors.admin.userCreate");
    }

    if (serverMessage) return serverMessage;

    const fallbackByAction = {
        login: t("errors.login.generic"),
        register: t("errors.register.generic"),
        requestPasswordReset: t("errors.reset.requestFailed"),
        resetPassword: t("errors.reset.generic"),
        like: t("errors.rating.like"),
        dislike: t("errors.rating.dislike"),
        submitScore: t("errors.score.save"),
        profileLoad: t("errors.profile.load"),
        profileSave: t("errors.profile.save"),
        profileUpload: t("errors.profile.upload"),
        adminLoad: t("errors.admin.load"),
        adminCreateUser: t("errors.admin.userCreate"),
        adminUpdateUser: t("errors.admin.userUpdate"),
        adminDeleteUser: t("errors.admin.userDelete"),
        adminCreateGame: t("errors.admin.gameCreate"),
        adminUpdateGame: t("errors.admin.gameUpdate"),
        adminUpdateGameStatus: t("errors.admin.gameStatusUpdate"),
        adminDeleteGame: t("errors.admin.gameDelete"),
        adminUploadGameImage: t("errors.admin.gameImageUpload"),
    };

    return fallbackByAction[action] || t("errors.common.generic");
}

// json request
async function request(path, { method="GET", body, auth=false } = {}) {
    const headers = { "Content-Type": "application/json", "Accept-Language": getLanguage() };
    if (auth) {
        const t = getToken();
        if (t) headers["Authorization"] = `Bearer ${t}`;
    }

    const res = await fetch(path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        let errorData;
        const text = await res.text().catch(() => "");

        try {
            errorData = JSON.parse(text);
        } catch (e) {
            errorData = { error: text };
        }

        const err = new Error(errorData.error || `Error: ${res.status}`);
        err.status = res.status;
        err.response = { data: errorData };
        throw err;
    }
    const ct = res.headers.get("content-type") || "";
    return ct.includes("application/json") ? res.json() : res.text();
}

// file upload
async function upload(path, formData, { auth=false } = {}) {
    const headers = { "Accept-Language": getLanguage() };
    if (auth) {
        const t = getToken();
        if (t) headers["Authorization"] = `Bearer ${t}`;
    }

    const res = await fetch(path, {
        method: "POST",
        headers,
        body: formData,
    });

    if (!res.ok) {
        let errorData;
        const text = await res.text().catch(() => "");

        try {
            errorData = JSON.parse(text);
        } catch (e) {
            errorData = { error: text };
        }

        const err = new Error(errorData.error || `Error: ${res.status}`);
        err.status = res.status;
        err.response = { data: errorData };
        throw err;
    }

    const ct = res.headers.get("content-type") || "";
    return ct.includes("application/json") ? res.json() : res.text();
}

export const api = {
    // auth api
    register: (data) => request("/api/auth/register", { method: "POST", body: data }),
    login: (data) => request("/api/auth/login", { method: "POST", body: data }),
    requestPasswordReset: (data) => request("/api/auth/request-password-reset", { method: "POST", body: data }),
    resetPassword: (data) => request("/api/auth/reset-password", { method: "POST", body: data }),
    me: () => request("/api/auth/me", { auth: true }),
    updateMe: (data) => request("/api/auth/me", { method: "PUT", auth: true, body: data }),
    uploadProfileImage: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return upload("/api/auth/me/profile-image", formData, { auth: true });
    },
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
    },

    // game api
    games: () => request("/api/games"),
    gameBySlug: (slug) => request(`/api/games/${slug}`),
    gamePlayHtml: (slug) => request(`/api/games/${slug}/play`),

    // rating api
    rate: (gameId, value) => request(`/api/games/${gameId}/${value.toLowerCase()}`, { method:"POST", auth:true, body:{ gameId, value } }),

    // score api
    submitScore: (gameId, score) => request(`/api/scores`, { method:"POST", auth:true, body:{ gameId, score } }),

    // leaderboard api
    leaderboardGlobal: () => request(`/api/leaderboard`),
    leaderboardByGame: (gameId) => request(`/api/leaderboard/${gameId}`),
};
