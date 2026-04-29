import { createContext } from "react";

const defaultLanguage = "hu";

export const I18nContext = createContext({
    language: defaultLanguage,
    setLanguage: () => {},
    t: (key) => key,
    locale: "hu-HU"
});

export const DEFAULT_LANGUAGE = defaultLanguage;
