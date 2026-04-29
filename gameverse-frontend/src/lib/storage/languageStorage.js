const LANGUAGE_KEY = "gv_language";
const DEFAULT_LANGUAGE = "hu";

export function getStoredLanguage() {
    return localStorage.getItem(LANGUAGE_KEY) || DEFAULT_LANGUAGE;
}

export function setStoredLanguage(language) {
    localStorage.setItem(LANGUAGE_KEY, language);
}
