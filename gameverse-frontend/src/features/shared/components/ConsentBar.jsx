import { Component } from "react";
import { I18nContext } from "../../../i18n/context.js";
import { hasConsent, setConsent } from "../../../lib/api.js";
import "../../../styles/ConsentBar.css";

export default class ConsentBar extends Component {
    static contextType = I18nContext;

    constructor(props) {
        super(props);
        this.state = {
            open: !hasConsent()
        };
    }

    handleChoice = (value) => {
        setConsent(value);
        this.setState({ open: false });
    };

    render() {
        const { t } = this.context;

        if (!this.state.open) {
            return null;
        }

        return (
            <div className="consent-shell">
                <div className="consent-bar">
                    <div className="consent-icon">🍪</div>

                    <div className="consent-content">
                        <div className="consent-title">{t("consent.title")}</div>
                        <div className="consent-text">{t("consent.text")}</div>
                    </div>

                    <div className="consent-actions">
                        <button className="consent-button consent-button-secondary" onClick={() => this.handleChoice(false)}>
                            {t("consent.reject")}
                        </button>
                        <button className="consent-button consent-button-primary" onClick={() => this.handleChoice(true)}>
                            {t("consent.accept")}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
