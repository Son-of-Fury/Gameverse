import { Component } from "react";
import { withRouter } from "../../../hoc/withRouter.jsx";
import { I18nContext } from "../../../i18n/context.js";
import { setToken } from "../../../lib/api.js";
import { createProfileState, deleteProfileData, loadProfileData, saveProfileData, uploadProfileFile } from "./profileRuntime.js";
import "../../../styles/Profile.css";

class Profile extends Component {
    static contextType = I18nContext;

    constructor(props) {
        super(props);
        this.state = createProfileState();
    }

    componentDidMount() {
        this.loadProfile();
    }

    loadProfile = async () => {
        await loadProfileData(this);
    };

    handleChange = (event) => {
        const { name, value } = event.target;
        this.setState((current) => ({
            form: { ...current.form, [name]: value }
        }));
    };

    handleLanguageChange = (event) => {
        this.context.setLanguage(event.target.value);
    };

    handleSubmit = async (event) => {
        event.preventDefault();
        await saveProfileData(this);
    };

    handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        await uploadProfileFile(this, file, event.target);
    };

    handleLogout = () => {
        const { navigate, onLogout } = this.props;
        setToken(null);
        onLogout?.();
        navigate("/login");
    };

    handleDeleteProfile = async () => {
        const { t } = this.context;

        if (!window.confirm(t("profile.deleteConfirm"))) {
            return;
        }

        await deleteProfileData(this);
    };

    render() {
        const { currentUser } = this.props;
        const { language, t, locale } = this.context;
        const { form, loading, saving, deleting, uploading, message, error, uploadInfo } = this.state;
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

                    <form onSubmit={this.handleSubmit} className="profile-form">
                        <div>
                            <label htmlFor="profile-username" className="profile-field-label">{t("profile.username")}</label>
                            <input id="profile-username" className="profile-input" type="text" name="username" value={form.username} onChange={this.handleChange} autoComplete="username" required />
                        </div>
                        <div>
                            <label htmlFor="profile-email" className="profile-field-label">{t("profile.email")}</label>
                            <input id="profile-email" className="profile-input" type="email" name="email" value={form.email} onChange={this.handleChange} autoComplete="email" required />
                        </div>
                        <div>
                            <label htmlFor="profile-password" className="profile-field-label">{t("profile.newPassword")}</label>
                            <input id="profile-password" className="profile-input" type="password" name="password" value={form.password} onChange={this.handleChange} autoComplete="new-password" placeholder={t("profile.newPasswordPlaceholder")} />
                        </div>
                        <div>
                            <label htmlFor="profile-image" className="profile-field-label">{t("profile.imageUpload")}</label>
                            <input id="profile-image" className="profile-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={this.handleFileChange} disabled={uploading} />
                            <div className="profile-help">{uploading ? t("profile.imageUploading") : t("profile.imageAllowed")}</div>
                        </div>
                        <div className="profile-language-card">
                            <div>
                                <div className="profile-language-title">{t("profile.languageTitle")}</div>
                                <div className="profile-language-subtitle">{t("profile.languageSubtitle")}</div>
                            </div>
                            <div>
                                <label htmlFor="profile-language" className="profile-field-label">{t("profile.languageLabel")}</label>
                                <select id="profile-language" className="profile-input" value={language} onChange={this.handleLanguageChange}>
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
                            <button type="button" className="profile-logout-button" onClick={this.handleLogout}>
                                {t("profile.logout")}
                            </button>
                            <button type="button" className="profile-delete-button" onClick={this.handleDeleteProfile} disabled={deleting}>
                                {deleting ? t("profile.deleting") : t("profile.delete")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

const RoutedProfile = withRouter(Profile);

export default RoutedProfile;
