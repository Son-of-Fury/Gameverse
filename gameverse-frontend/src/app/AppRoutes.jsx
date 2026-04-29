import { Navigate, Route, Routes } from "react-router-dom";
import AdminGamePreview from "../features/admin/pages/AdminGamePreview.jsx";
import AdminPanel from "../features/admin/pages/AdminPanel.jsx";
import ForgotPassword from "../features/auth/pages/ForgotPassword.jsx";
import Game from "../features/game/pages/Game.jsx";
import Home from "../features/home/pages/Home.jsx";
import Leaderboard from "../features/leaderboard/pages/Leaderboard.jsx";
import Login from "../features/auth/pages/Login.jsx";
import Profile from "../features/profile/pages/Profile.jsx";
import Register from "../features/auth/pages/Register.jsx";

export default function AppRoutes({ isAdmin, token, currentUser, onAuthenticated, onUserChange, onLogout }) {
    return (
        <Routes>
            <Route path="/" element={isAdmin ? <Navigate to="/admin" replace /> : <Home />} />
            <Route path="/game/:slug" element={isAdmin ? <Navigate to="/admin" replace /> : <Game />} />
            <Route path="/leaderboard" element={isAdmin ? <Navigate to="/admin" replace /> : <Leaderboard />} />
            <Route
                path="/login"
                element={token ? <Navigate to={isAdmin ? "/admin" : "/"} replace /> : <Login onAuthenticated={onAuthenticated} />}
            />
            <Route
                path="/register"
                element={token ? <Navigate to={isAdmin ? "/admin" : "/"} replace /> : <Register onAuthenticated={onAuthenticated} />}
            />
            <Route path="/forgot-password" element={isAdmin ? <Navigate to="/admin" replace /> : <ForgotPassword />} />
            <Route
                path="/profile"
                element={!token ? <Navigate to="/login" replace /> : isAdmin ? <Navigate to="/admin" replace /> : (
                    <Profile currentUser={currentUser} onUserChange={onUserChange} onLogout={onLogout} />
                )}
            />
            <Route path="/admin" element={!token ? <Navigate to="/login" replace /> : isAdmin ? <AdminPanel currentUser={currentUser} /> : <Navigate to="/" replace />} />
            <Route path="/admin/game-preview/:slug" element={!token ? <Navigate to="/login" replace /> : isAdmin ? <AdminGamePreview /> : <Navigate to="/" replace />} />
        </Routes>
    );
}
