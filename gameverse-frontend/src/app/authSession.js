import { api, setToken } from "../lib/api.js";

export function buildAuthenticatedUser(authResponse) {
    return {
        userId: authResponse.userId,
        username: authResponse.username || "",
        email: authResponse.email || "",
        profileImage: authResponse.profileImage || "",
        role: authResponse.role || "USER"
    };
}

export async function loadCurrentUserSession(token) {
    if (!token) {
        return {
            token: null,
            currentUser: null,
            authLoading: false
        };
    }

    try {
        const currentUser = await api.me();
        return { token, currentUser, authLoading: false };
    } catch (error) {
        if (error.status === 401 || error.status === 404) {
            setToken(null);
            return {
                token: null,
                currentUser: null,
                authLoading: false
            };
        }

        return {
            token,
            currentUser: null,
            authLoading: false
        };
    }
}
