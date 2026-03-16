import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, getActionError, setToken } from "../lib/api.js";
import { useI18n } from "../i18n/I18nContext.jsx";
import "../styles/Auth.css";

// login page
export default function Login({ onAuthenticated }) {
    const { t } = useI18n();
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState("");

    // login submit
    async function onSubmit(e) {
        e.preventDefault();
        setMsg("");
        try {
            const res = await api.login({ email, password });
            setToken(res.token);
            onAuthenticated?.(res);
            nav("/");
        } catch (e2) {
            setMsg(getActionError(e2, t, "login"));
        }
    }

    return (
        <div className="auth-page">
            {/* login form */}
            <form onSubmit={onSubmit} className="auth-card">
                <h2 className="auth-title">{t("login.title")}</h2>

                {msg && <div className="auth-error">{msg}</div>}

                <div className="auth-field">
                    <label className="auth-label">{t("login.email")}</label>
                    <input
                        className="auth-input"
                        value={email}
                        onChange={e=>setEmail(e.target.value)}
                        placeholder="example@email.com"
                        required
                    />
                </div>

                <div className="auth-field">
                    <div className="auth-field-header">
                        <label className="auth-label">{t("login.password")}</label>
                        <Link to="/forgot-password" className="auth-helper-link">{t("login.forgotPassword")}</Link>
                    </div>
                    <input
                        className="auth-input"
                        value={password}
                        onChange={e=>setPassword(e.target.value)}
                        placeholder="••••••••"
                        type="password"
                        required
                    />
                </div>

                <button className="auth-submit">
                    {t("login.submit")}
                </button>

                <p className="auth-footer">
                    {t("login.noAccount")} <Link to="/register" className="auth-footer-link">{t("login.register")}</Link>
                </p>
            </form>
        </div>
    );
}
