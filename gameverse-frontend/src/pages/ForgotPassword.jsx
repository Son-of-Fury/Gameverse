import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, getActionError } from "../lib/api.js";
import { useI18n } from "../i18n/I18nContext.jsx";
import "../styles/ForgotPassword.css";

// reset page
export default function ForgotPassword() {
    const { t } = useI18n();
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [msg, setMsg] = useState("");
    const [issuedResetToken, setIssuedResetToken] = useState("");
    const [requestDone, setRequestDone] = useState(false);

    // token request
    async function handleRequestToken(event) {
        event.preventDefault();
        setMsg("");

        try {
            const response = await api.requestPasswordReset({ email });
            setRequestDone(true);
            setIssuedResetToken(response.resetToken || "");
            setMsg(response.message || t("forgotPassword.requestSuccess"));
        } catch (error) {
            setMsg(t("forgotPassword.errorPrefix") + getActionError(error, t, "requestPasswordReset"));
        }
    }

    // password reset
    async function handleReset(event) {
        event.preventDefault();
        setMsg("");

        try {
            await api.resetPassword({ email, resetToken, newPassword });
            setMsg(t("forgotPassword.success"));
            setTimeout(() => nav("/login"), 3000);
        } catch (error) {
            setMsg(t("forgotPassword.errorPrefix") + getActionError(error, t, "resetPassword"));
        }
    }

    const isSuccess = msg === t("forgotPassword.success");

    return (
        <div className="forgot-page">
            {/* reset form */}
            <form onSubmit={requestDone ? handleReset : handleRequestToken} className="forgot-form">
                <h2 className="forgot-title">{t("forgotPassword.title")}</h2>

                {msg ? <div className={`forgot-message ${isSuccess ? "forgot-message-success" : "forgot-message-error"}`}>{msg}</div> : null}

                <div className="forgot-field">
                    <label className="forgot-label">{t("forgotPassword.email")}</label>
                    <input className="forgot-input" value={email} onChange={e => setEmail(e.target.value)} placeholder={t("forgotPassword.emailPlaceholder")} required />
                </div>

                {requestDone ? (
                    <>
                        <div className="forgot-field">
                            <label className="forgot-label">{t("forgotPassword.resetToken")}</label>
                            <input className="forgot-input" value={resetToken} onChange={e => setResetToken(e.target.value)} placeholder={t("forgotPassword.resetTokenPlaceholder")} required />
                        </div>

                        <div className="forgot-field">
                            <label className="forgot-label">{t("forgotPassword.newPassword")}</label>
                            <input className="forgot-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={t("forgotPassword.newPasswordPlaceholder")} type="password" required />
                        </div>

                        {issuedResetToken ? <div className="forgot-token-box">{t("forgotPassword.tokenHint")} {issuedResetToken}</div> : null}
                    </>
                ) : null}

                <button className="forgot-submit">{requestDone ? t("forgotPassword.submit") : t("forgotPassword.requestToken")}</button>

                <div className="forgot-back">
                    <Link to="/login" className="forgot-link">{t("forgotPassword.backToLogin")}</Link>
                </div>
            </form>
        </div>
    );
}
