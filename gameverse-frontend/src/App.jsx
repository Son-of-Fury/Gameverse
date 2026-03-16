import { useEffect, useState } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Game from "./pages/Game.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import { api, getToken, setToken } from "./lib/api.js";
import ConsentBar from "./components/ConsentBar.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Profile from "./pages/Profile.jsx";
import { useI18n } from "./i18n/I18nContext.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import AdminGamePreview from "./pages/AdminGamePreview.jsx";
import "./styles/App.css";

// app shell
export default function App() {
    const { t } = useI18n();
    const [token, setTokenState] = useState(() => getToken());
    const [currentUser, setCurrentUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // auth load
    useEffect(() => {
        let active = true;

        async function loadCurrentUser() {
            if (!token) {
                setCurrentUser(null);
                setAuthLoading(false);
                return;
            }

            try {
                const me = await api.me();
                if (active) {
                    setCurrentUser(me);
                }
            } catch (e) {
                if (!active) return;

                setCurrentUser(null);
                if (e.status === 401 || e.status === 404) {
                    setToken(null);
                    setTokenState(null);
                }
            } finally {
                if (active) {
                    setAuthLoading(false);
                }
            }
        }

        loadCurrentUser();
        return () => {
            active = false;
        };
    }, [token]);

    // auth state
    function handleAuthenticated(authResponse) {
        setToken(authResponse.token);
        setTokenState(authResponse.token);
        setCurrentUser({
            userId: authResponse.userId,
            username: authResponse.username || "",
            email: authResponse.email || "",
            profileImage: authResponse.profileImage || "",
            role: authResponse.role || "USER"
        });
        setAuthLoading(false);
    }

    // user state
    function handleUserChange(user) {
        setCurrentUser(prev => ({ ...prev, ...user }));
    }

    // logout
    function handleLogout() {
        setToken(null);
        setTokenState(null);
        setCurrentUser(null);
        setAuthLoading(false);
    }

    const isAdmin = currentUser?.role === "ADMIN";
    const avatar = currentUser?.profileImage?.trim();
    const initials = (currentUser?.username || currentUser?.email || "P").trim().charAt(0).toUpperCase();

    if (authLoading) {
        return <div className="app-loading">{t("app.loading")}</div>;
    }

    return (
        <div className="app-shell">
            {/* header */}
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
                        <button type="button" onClick={handleLogout} className="app-ghost-button">
                            {t("app.logout")}
                        </button>
                    ) : (
                        <Link to="/profile" className="app-avatar-link" title={t("app.profile")}>
                            {avatar ? (
                                <img src={avatar} alt={t("app.profileAlt")} className="app-avatar-image" />
                            ) : (
                                <div className="app-avatar-fallback">{initials}</div>
                            )}
                        </Link>
                    )}
                </div>
            </header>

            {/* routes */}
            <main className="app-main">
                <Routes>
                    <Route path="/" element={isAdmin ? <Navigate to="/admin" replace /> : <Home />} />
                    <Route path="/game/:slug" element={isAdmin ? <Navigate to="/admin" replace /> : <Game />} />
                    <Route path="/leaderboard" element={isAdmin ? <Navigate to="/admin" replace /> : <Leaderboard />} />
                    <Route
                        path="/login"
                        element={token ? <Navigate to={isAdmin ? "/admin" : "/profile"} replace /> : <Login onAuthenticated={handleAuthenticated} />}
                    />
                    <Route
                        path="/register"
                        element={token ? <Navigate to={isAdmin ? "/admin" : "/profile"} replace /> : <Register onAuthenticated={handleAuthenticated} />}
                    />
                    <Route path="/forgot-password" element={isAdmin ? <Navigate to="/admin" replace /> : <ForgotPassword />} />
                    <Route path="/profile" element={!token ? <Navigate to="/login" replace /> : isAdmin ? <Navigate to="/admin" replace /> : <Profile currentUser={currentUser} onUserChange={handleUserChange} onLogout={handleLogout} />} />
                    <Route path="/admin" element={!token ? <Navigate to="/login" replace /> : isAdmin ? <AdminPanel currentUser={currentUser} /> : <Navigate to="/" replace />} />
                    <Route path="/admin/game-preview/:slug" element={!token ? <Navigate to="/login" replace /> : isAdmin ? <AdminGamePreview /> : <Navigate to="/" replace />} />
                </Routes>
            </main>

            {/* consent */}
            <ConsentBar />
        </div>
    );
}
