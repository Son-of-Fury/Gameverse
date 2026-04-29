import { adminApi } from "./api/adminApi.js";
import { authApi } from "./api/authApi.js";
import { gameApi } from "./api/gameApi.js";

export { getActionError } from "./errors.js";
export { hasConsent, setConsent } from "./storage/consentStorage.js";
export { getStoredLanguage as getLanguage, setStoredLanguage as setLanguage } from "./storage/languageStorage.js";
export { getToken, setToken } from "./storage/tokenStorage.js";

export const api = {
    ...authApi,
    ...adminApi,
    ...gameApi
};
