import { Component } from "react";
import GamesSection from "../components/GamesSection.jsx";
import UsersSection from "../components/UsersSection.jsx";
import { I18nContext } from "../../../i18n/context.js";
import { buildGameSectionProps, buildUserSectionProps } from "./adminPanelViewProps.js";
import { createAdminGame, deleteAdminGame, startAdminGameEdit, updateAdminGame, updateAdminGameStatus, uploadAdminGameImage, cancelAdminGameEdit } from "./adminPanelGames.js";
import { loadAdminGames, loadAdminUsers } from "./adminPanelLoaders.js";
import { createAdminPanelState, markPreviewedGame, updateNamedFormField, wasPreviewedGame } from "./adminPanelState.js";
import { createAdminUser, deleteAdminUser, startAdminUserEdit, updateAdminUser } from "./adminPanelUsers.js";
import "../../../styles/admin.css";

export default class AdminPanel extends Component {
    static contextType = I18nContext;

    constructor(props) {
        super(props);
        this.state = createAdminPanelState();
    }

    componentDidMount() {
        this.loadUsers();
        this.loadGames();
    }

    loadUsers = async () => await loadAdminUsers(this);
    loadGames = async () => await loadAdminGames(this);
    updateNamedFormField = (formKey, event) => updateNamedFormField(this, formKey, event);
    wasPreviewed = (slug) => wasPreviewedGame(slug);
    markGamePreviewed = (slug) => markPreviewedGame(slug);
    handleCreateUser = async (event) => await createAdminUser(this, event);
    startEditUser = (user) => startAdminUserEdit(this, user);
    handleUpdateUser = async (userId) => await updateAdminUser(this, userId);
    handleDeleteUser = async (userId) => await deleteAdminUser(this, userId);
    handleCreateGame = async (event) => await createAdminGame(this, event);
    startEditGame = async (gameId) => await startAdminGameEdit(this, gameId);
    cancelEditGame = () => cancelAdminGameEdit(this);
    handleUpdateGame = async (gameId) => await updateAdminGame(this, gameId);
    handleGameStatus = async (gameId, status) => await updateAdminGameStatus(this, gameId, status);
    handleDeleteGame = async (gameId) => await deleteAdminGame(this, gameId);
    uploadGameImage = async (event, uploadStateKey, formKey) => await uploadAdminGameImage(this, event, uploadStateKey, formKey);
    cancelEditUser = () => this.setState({ editingUserId: null });

    render() {
        const { currentUser } = this.props;
        const { t, locale } = this.context;
        const { message, error } = this.state;
        const userSectionProps = buildUserSectionProps(this, t, locale);
        const gameSectionProps = buildGameSectionProps(this, t);

        return (
            <div className="admin-page">
                <div className="admin-page-inner">
                    <div className="admin-page-header">
                        <div>
                            <h1 className="admin-page-title">{t("admin.title")}</h1>
                            <p className="admin-page-subtitle">{t("admin.signedInAs")} {currentUser?.email || t("admin.defaultAdminEmail")}</p>
                        </div>
                    </div>

                    {error ? <div className="admin-feedback admin-feedback-error">{error}</div> : null}
                    {message ? <div className="admin-feedback admin-feedback-success">{message}</div> : null}

                    <UsersSection {...userSectionProps} />
                    <GamesSection {...gameSectionProps} />
                </div>
            </div>
        );
    }
}
