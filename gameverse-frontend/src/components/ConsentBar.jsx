import { useState } from "react";
import { hasConsent, setConsent } from "../lib/api.js";
import { useI18n } from "../i18n/I18nContext.jsx";
import "../styles/ConsentBar.css";

// consent bar
export default function ConsentBar() {
    const { t } = useI18n();
    const [open, setOpen] = useState(!hasConsent());

    if (!open) return null;

    return (
        <div className="consent-shell">
            {/* banner */}
            <div className="consent-bar">
                <div className="consent-icon">🍪</div>

                <div className="consent-content">
                    <div className="consent-title">{t("consent.title")}</div>
                    <div className="consent-text">{t("consent.text")}</div>
                </div>

                {/* actions */}
                <div className="consent-actions">
                    <button className="consent-button consent-button-secondary" onClick={() => { setConsent(false); setOpen(false); }}>
                        {t("consent.reject")}
                    </button>
                    <button className="consent-button consent-button-primary" onClick={() => { setConsent(true); setOpen(false); }}>
                        {t("consent.accept")}
                    </button>
                </div>
            </div>
        </div>
    );
}
