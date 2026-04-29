import { Link } from "react-router-dom";

export default function AppHeader({ isAdmin, token, avatar, initials, displayName, t, onLogout }) {
    return (
        <header className="app-header">
            <div className="app-header-left">
                <Link to={isAdmin ? "/admin" : "/"} className="app-brand-link">
                    {isAdmin ? t("app.adminPanel") : t("app.brand")}
                </Link>
                {!isAdmin && <Link to="/leaderboard" className="app-nav-link">{t("app.leaderboard")}</Link>}
            </div>

            <div aria-hidden="true" />

            <div className="app-header-right">
                {!token ? (
                    <>
                        <Link to="/login" className="app-nav-link">{t("app.login")}</Link>
                        <Link to="/register" className="app-primary-link">{t("app.register")}</Link>
                    </>
                ) : isAdmin ? (
                    <button type="button" onClick={onLogout} className="app-ghost-button">
                        {t("app.logout")}
                    </button>
                ) : (
                    <Link to="/profile" className="app-avatar-link" title={t("app.profile")}>
                        {avatar ? (
                            <img src={avatar} alt={t("app.profileAlt")} className="app-avatar-image" />
                        ) : (
                            <div className="app-avatar-fallback">{initials}</div>
                        )}
                        <span className="app-avatar-name">{displayName}</span>
                    </Link>
                )}
            </div>
        </header>
    );
}
