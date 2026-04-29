const CONSENT_KEY = "gv_consent";

export function hasConsent() {
    return localStorage.getItem(CONSENT_KEY) === "true";
}

export function setConsent(value) {
    localStorage.setItem(CONSENT_KEY, value ? "true" : "false");
}
