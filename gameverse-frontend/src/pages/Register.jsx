import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, getActionError, setToken } from "../lib/api.js";
import { useI18n } from "../i18n/I18nContext.jsx";
import "../styles/Auth.css";

// register page
export default function Register({ onAuthenticated }) {
    const { t } = useI18n();
    const nav = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState("");

    // register submit
    async function onSubmit(e) {
        e.preventDefault();
        setMsg("");
        try {
            const res = await api.register({ username, email, password });
            setToken(res.token);
            onAuthenticated?.(res);
            nav("/");
        } catch (e2) {
            setMsg(getActionError(e2, t, "register"));
        }
    }

    return (
        <div className="auth-page">
            {/* register form */}
            <form onSubmit={onSubmit} className="auth-card">
                <h2 className="auth-title">{t("register.title")}</h2>

                {msg && <div className="auth-error">{msg}</div>}

                <div className="auth-field">
                    <label className="auth-label">{t("register.username")}</label>
                    <input
                        className="auth-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={t("register.usernamePlaceholder")}
                        required
                    />
                </div>

                <div className="auth-field">
                    <label className="auth-label">{t("register.email")}</label>
                    <input
                        className="auth-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        type="email"
                        required
                    />
                </div>

                <div className="auth-field">
                    <label className="auth-label">{t("register.password")}</label>
                    <input
                        className="auth-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t("register.passwordPlaceholder")}
                        type="password"
                        required
                    />
                </div>

                <button className="auth-submit">
                    {t("register.submit")}
                </button>

                <p className="auth-footer">
                    {t("register.haveAccount")} <Link to="/login" className="auth-footer-link">{t("register.login")}</Link>
                </p>
            </form>
        </div>
    );
}
