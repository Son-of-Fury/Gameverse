import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "./translations.js";

const LANGUAGE_KEY = "gv_language";
const defaultLanguage = "hu";

// i18n context
const I18nContext = createContext({
    language: defaultLanguage,
    setLanguage: () => {},
    t: (key) => key,
    locale: "hu-HU"
});

// nested key
function getNestedValue(obj, path) {
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
}

// i18n provider
export function I18nProvider({ children }) {
    const [language, setLanguage] = useState(() => localStorage.getItem(LANGUAGE_KEY) || defaultLanguage);

    // sync lang
    useEffect(() => {
        localStorage.setItem(LANGUAGE_KEY, language);
        document.documentElement.lang = language;
    }, [language]);

    // i18n value
    const value = useMemo(() => {
        const locale = language === "hu" ? "hu-HU" : "en-US";

        // text lookup
        function t(key, ...args) {
            const dictionary = translations[language] || translations[defaultLanguage];
            const fallback = translations[defaultLanguage];
            const resolved = getNestedValue(dictionary, key) ?? getNestedValue(fallback, key) ?? key;
            return typeof resolved === "function" ? resolved(...args) : resolved;
        }

        return { language, setLanguage, t, locale };
    }, [language]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// i18n hook
export function useI18n() {
    return useContext(I18nContext);
}
