import { useSyncExternalStore } from "react";
import { getStoredLanguage, setStoredLanguage } from "../lib/storage/languageStorage.js";
import { DEFAULT_LANGUAGE, I18nContext } from "./context.js";
import { translations } from "./translations.js";
const listeners = new Set();

const languageStore = {
    getSnapshot() {
        const language = getStoredLanguage();
        document.documentElement.lang = language;
        return language;
    },
    subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    setLanguage(language) {
        setStoredLanguage(language);
        document.documentElement.lang = language;
        listeners.forEach((listener) => listener());
    }
};

function getNestedValue(object, path) {
    return path.split(".").reduce((current, part) => current?.[part], object);
}

function createTranslator(language) {
    return function translate(key, ...args) {
        const dictionary = translations[language] || translations[DEFAULT_LANGUAGE];
        const fallback = translations[DEFAULT_LANGUAGE];
        const resolved = getNestedValue(dictionary, key) ?? getNestedValue(fallback, key) ?? key;
        return typeof resolved === "function" ? resolved(...args) : resolved;
    };
}

export function I18nProvider({ children }) {
    const language = useSyncExternalStore(
        languageStore.subscribe,
        languageStore.getSnapshot,
        languageStore.getSnapshot
    );

    const value = {
        language,
        setLanguage: languageStore.setLanguage,
        t: createTranslator(language),
        locale: language === "hu" ? "hu-HU" : "en-US"
    };

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
