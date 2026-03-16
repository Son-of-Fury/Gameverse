import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getActionError, getToken, setToken } from "../lib/api.js";
import { useI18n } from "../i18n/I18nContext.jsx";
import "../styles/Profile.css";

// profile page
export default function Profile({ currentUser, onUserChange, onLogout }) {
    const { language, setLanguage, t, locale } = useI18n();
    const nav = useNavigate();
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        profileImage: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [uploadInfo, setUploadInfo] = useState(null);

    // profile load
    useEffect(() => {
        if (!getToken()) {
            nav("/login");
            return;
        }

        let active = true;

        async function loadProfile() {
            setLoading(true);
            setError("");

            try {
                const user = await api.me();
                if (!active) return;

                setForm({
                    username: user.username || "",
                    email: user.email || "",
                    password: "",
                    profileImage: user.profileImage || ""
                });
                onUserChange?.(user);
                setUploadInfo(null);
            } catch (loadError) {
                if (!active) return;
                setError(getActionError(loadError, t, "profileLoad"));
                if (loadError.status === 401) {
                    setToken(null);
                    nav("/login");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadProfile();
        return () => {
            active = false;
        };
    }, [nav]);

    // form input
    function handleChange(event) {
        const { name, value } = event.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    // profile save
    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setMessage("");
        setError("");

        try {
            const response = await api.updateMe(form);
            setForm(prev => ({
                ...prev,
                username: response.username || prev.username,
                email: response.email || prev.email,
                profileImage: response.profileImage || "",
                password: ""
            }));
            onUserChange?.({
                username: response.username || form.username,
                email: response.email || form.email,
                profileImage: response.profileImage || form.profileImage
            });
            setMessage(response.message || t("profile.saveSuccess"));
        } catch (saveError) {
            setError(getActionError(saveError, t, "profileSave"));
            if (saveError.status === 401) {
                setToken(null);
                nav("/login");
            }
        } finally {
            setSaving(false);
        }
    }

    // image upload
    async function handleFileChange(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setMessage("");
        setError("");

        try {
            const response = await api.uploadProfileImage(file);
            setForm(prev => ({ ...prev, profileImage: response.profileImage || prev.profileImage }));
            onUserChange?.({ profileImage: response.profileImage || "" });
            setUploadInfo({
                originalFileName: response.originalFileName,
                storedFileName: response.storedFileName,
                sizeMb: response.sizeMb,
                uploadedAt: response.uploadedAt
            });
            setMessage(response.message || t("profile.uploadSuccess"));
        } catch (uploadError) {
            setError(getActionError(uploadError, t, "profileUpload"));
            if (uploadError.status === 401) {
                setToken(null);
                nav("/login");
            }
        } finally {
            setUploading(false);
            event.target.value = "";
        }
    }

    // profile logout
    function handleLogout() {
        setToken(null);
        onLogout?.();
        nav("/login");
    }

    const avatar = (currentUser?.profileImage || form.profileImage || "").trim();
    const initials = (currentUser?.username || form.username || currentUser?.email || form.email || "P").trim().charAt(0).toUpperCase();

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-card">{t("profile.loading")}</div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            {/* profile card */}
            <div className="profile-card">
                <div className="profile-header">
                    {avatar ? (
                        <img src={avatar} alt={t("app.profileAlt")} className="profile-avatar-image" />
                    ) : (
                        <div className="profile-avatar-fallback">{initials}</div>
                    )}

                    <div>
                        <h1 className="profile-title">{t("profile.title")}</h1>
                        <p className="profile-subtitle">{t("profile.subtitle")}</p>
                    </div>
                </div>

                {error ? <div className="profile-alert profile-alert-error">{error}</div> : null}
                {message ? <div className="profile-alert profile-alert-success">{message}</div> : null}

                <form onSubmit={handleSubmit} className="profile-form">
                    <div>
                        <label htmlFor="profile-username" className="profile-field-label">{t("profile.username")}</label>
                        <input id="profile-username" className="profile-input" type="text" name="username" value={form.username} onChange={handleChange} autoComplete="username" required />
                    </div>

                    <div>
                        <label htmlFor="profile-email" className="profile-field-label">{t("profile.email")}</label>
                        <input id="profile-email" className="profile-input" type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" required />
                    </div>

                    <div>
                        <label htmlFor="profile-password" className="profile-field-label">{t("profile.newPassword")}</label>
                        <input id="profile-password" className="profile-input" type="password" name="password" value={form.password} onChange={handleChange} autoComplete="new-password" placeholder={t("profile.newPasswordPlaceholder")} />
                    </div>

                    <div>
                        <label htmlFor="profile-image" className="profile-field-label">{t("profile.imageUpload")}</label>
                        <input id="profile-image" className="profile-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleFileChange} disabled={uploading} />
                        <div className="profile-help">{uploading ? t("profile.imageUploading") : t("profile.imageAllowed")}</div>
                    </div>

                    <div className="profile-language-card">
                        <div>
                            <div className="profile-language-title">{t("profile.languageTitle")}</div>
                            <div className="profile-language-subtitle">{t("profile.languageSubtitle")}</div>
                        </div>
                        <div>
                            <label htmlFor="profile-language" className="profile-field-label">{t("profile.languageLabel")}</label>
                            <select id="profile-language" className="profile-input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                                <option value="hu">{t("profile.hungarian")}</option>
                                <option value="en">{t("profile.english")}</option>
                            </select>
                        </div>
                    </div>

                    {uploadInfo ? (
                        <div className="profile-upload-info">
                            <div>{t("profile.originalFile")}: {uploadInfo.originalFileName}</div>
                            <div>{t("profile.storedFile")}: {uploadInfo.storedFileName}</div>
                            <div>{t("profile.size")}: {uploadInfo.sizeMb} MB</div>
                            <div>{t("profile.uploadedAt")}: {new Date(uploadInfo.uploadedAt).toLocaleString(locale)}</div>
                        </div>
                    ) : null}

                    <div className="profile-actions">
                        <button type="submit" className="profile-save-button" disabled={saving}>
                            {saving ? t("profile.saving") : t("profile.save")}
                        </button>
                        <button type="button" className="profile-logout-button" onClick={handleLogout}>
                            {t("profile.logout")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
