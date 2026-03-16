import { useEffect, useState } from "react";
import { api, getActionError } from "../lib/api.js";
import { useI18n } from "../i18n/I18nContext.jsx";
import UsersSection from "../components/admin/UsersSection.jsx";
import GamesSection from "../components/admin/GamesSection.jsx";
import "../styles/admin.css";

const PREVIEWED_GAMES_KEY = "gv_admin_previewed_games";
const EMPTY_USER_FORM = { username: "", email: "", password: "", profileImage: "" };
const EMPTY_USER_EDIT_FORM = { username: "", email: "", profileImage: "" };
const EMPTY_TRANSLATIONS = "{\n  \n}";

// admin page
export default function AdminPanel({ currentUser }) {
    const { t, locale } = useI18n();
    const [users, setUsers] = useState([]);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gamesLoading, setGamesLoading] = useState(true);
    const [gameUploading, setGameUploading] = useState(false);
    const [reviewBusyId, setReviewBusyId] = useState(null);
    const [editingGameId, setEditingGameId] = useState(null);
    const [gameEditUploading, setGameEditUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [editingUserId, setEditingUserId] = useState(null);
    const [createForm, setCreateForm] = useState(EMPTY_USER_FORM);
    const [editForm, setEditForm] = useState(EMPTY_USER_EDIT_FORM);
    const [gameForm, setGameForm] = useState(emptyGameForm());
    const [gameEditForm, setGameEditForm] = useState(emptyGameForm());

    // admin load
    useEffect(() => {
        loadUsers();
        loadGames();
    }, []);

    // users load
    async function loadUsers() {
        setLoading(true);
        setError("");

        try {
            setUsers(await api.adminUsers());
        } catch (fetchError) {
            setError(getActionError(fetchError, t, "adminLoad"));
        } finally {
            setLoading(false);
        }
    }

    // games load
    async function loadGames() {
        setGamesLoading(true);

        try {
            setGames(await api.adminGames());
        } catch (fetchError) {
            setError(getActionError(fetchError, t, "adminLoad"));
        } finally {
            setGamesLoading(false);
        }
    }

    // create input
    function updateCreateField(event) {
        const { name, value } = event.target;
        setCreateForm(prev => ({ ...prev, [name]: value }));
    }

    // edit input
    function updateEditField(event) {
        const { name, value } = event.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    }

    // game input
    function updateGameField(event) {
        const { name, value, type, checked } = event.target;
        setGameForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }

    // game edit input
    function updateGameEditField(event) {
        const { name, value, type, checked } = event.target;
        setGameEditForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }

    // preview cache
    function getPreviewedGames() {
        try {
            return JSON.parse(localStorage.getItem(PREVIEWED_GAMES_KEY) || "[]");
        } catch {
            return [];
        }
    }

    // preview check
    function wasPreviewed(slug) {
        return getPreviewedGames().includes(slug);
    }

    // preview mark
    function markGamePreviewed(slug) {
        const previewedGames = new Set(getPreviewedGames());
        previewedGames.add(slug);
        localStorage.setItem(PREVIEWED_GAMES_KEY, JSON.stringify([...previewedGames]));
    }

    // preview clear
    function clearGamePreviewed(slug) {
        const previewedGames = getPreviewedGames().filter(item => item !== slug);
        localStorage.setItem(PREVIEWED_GAMES_KEY, JSON.stringify(previewedGames));
    }

    // create user
    async function handleCreateUser(event) {
        event.preventDefault();
        resetFeedback();

        try {
            const response = await api.adminCreateUser(createForm);
            setMessage(response.message || t("admin.createSuccess"));
            setCreateForm(EMPTY_USER_FORM);
            await loadUsers();
        } catch (requestError) {
            setError(getActionError(requestError, t, "adminCreateUser"));
        }
    }

    // start user edit
    function startEditUser(user) {
        setEditingUserId(user.id);
        setEditForm({
            username: user.username || "",
            email: user.email || "",
            profileImage: user.profileImage || ""
        });
        resetFeedback();
    }

    // update user
    async function handleUpdateUser(userId) {
        resetFeedback();

        try {
            const response = await api.adminUpdateUser(userId, editForm);
            setMessage(response.message || t("admin.updateSuccess"));
            setEditingUserId(null);
            await loadUsers();
        } catch (requestError) {
            setError(getActionError(requestError, t, "adminUpdateUser"));
        }
    }

    // delete user
    async function handleDeleteUser(userId) {
        resetFeedback();

        try {
            const response = await api.adminDeleteUser(userId);
            setMessage(response.message || t("admin.deleteSuccess"));
            if (editingUserId === userId) {
                setEditingUserId(null);
            }
            await loadUsers();
        } catch (requestError) {
            setError(getActionError(requestError, t, "adminDeleteUser"));
        }
    }

    // create game
    async function handleCreateGame(event) {
        event.preventDefault();
        resetFeedback();

        try {
            const response = await api.adminCreateGame(gameForm);
            setMessage(response.message || t("admin.createSuccess"));
            setGameForm(emptyGameForm());
            await loadGames();
        } catch (requestError) {
            setError(getActionError(requestError, t, "adminCreateGame"));
        }
    }

    // start game edit
    async function startEditGame(gameId) {
        setEditingGameId(gameId);
        resetFeedback();

        try {
            const data = await api.adminGameDetails(gameId);
            setGameEditForm({
                titleHu: data.titleHu || "",
                titleEn: data.titleEn || "",
                slug: data.slug || "",
                descriptionHu: data.descriptionHu || "",
                descriptionEn: data.descriptionEn || "",
                tutorialHu: data.tutorialHu || "",
                tutorialEn: data.tutorialEn || "",
                sourceType: data.sourceType || "EMBED_URL",
                externalUrl: data.externalUrl || "",
                htmlCode: data.htmlCode || "",
                htmlTranslationsHu: data.htmlTranslationsHu || EMPTY_TRANSLATIONS,
                htmlTranslationsEn: data.htmlTranslationsEn || EMPTY_TRANSLATIONS,
                imageUrl: data.imageUrl || ""
            });
        } catch (requestError) {
            setEditingGameId(null);
            setError(getActionError(requestError, t, "adminLoad"));
        }
    }

    // cancel game edit
    function cancelEditGame() {
        setEditingGameId(null);
        setGameEditForm(emptyGameForm());
    }

    // update game
    async function handleUpdateGame(gameId) {
        resetFeedback();

        try {
            const response = await api.adminUpdateGame(gameId, gameEditForm);
            setMessage(response.message || t("admin.gameUpdated"));
            clearGamePreviewed(gameEditForm.slug);
            setEditingGameId(null);
            setGameEditForm(emptyGameForm());
            await loadGames();
        } catch (requestError) {
            setError(getActionError(requestError, t, "adminUpdateGame"));
        }
    }

    // game status
    async function handleGameStatus(gameId, status) {
        setReviewBusyId(gameId);
        resetFeedback();

        try {
            const response = await api.adminUpdateGameStatus(gameId, status);
            setMessage(response.message || t("admin.statusUpdated"));
            await loadGames();
        } catch (requestError) {
            setError(getActionError(requestError, t, "adminUpdateGameStatus"));
        } finally {
            setReviewBusyId(null);
        }
    }

    // delete game
    async function handleDeleteGame(gameId) {
        resetFeedback();

        try {
            const response = await api.adminDeleteGame(gameId);
            setMessage(response.message || t("admin.deleteSuccess"));
            await loadGames();
        } catch (requestError) {
            setError(getActionError(requestError, t, "adminDeleteGame"));
        }
    }

    // create image
    async function handleGameImageUpload(event) {
        await uploadGameImage(event, setGameUploading, imageUrl => setGameForm(prev => ({ ...prev, imageUrl })));
    }

    // edit image
    async function handleGameEditImageUpload(event) {
        await uploadGameImage(event, setGameEditUploading, imageUrl => setGameEditForm(prev => ({ ...prev, imageUrl })));
    }

    return (
        <div className="admin-page">
            {/* admin layout */}
            <div className="admin-page-inner">
                <div className="admin-page-header">
                    <div>
                        <h1 className="admin-page-title">{t("admin.title")}</h1>
                        <p className="admin-page-subtitle">{t("admin.signedInAs")} {currentUser?.email || t("admin.defaultAdminEmail")}</p>
                    </div>
                </div>

                {error ? <div className="admin-feedback admin-feedback-error">{error}</div> : null}
                {message ? <div className="admin-feedback admin-feedback-success">{message}</div> : null}

                <UsersSection
                    users={users}
                    loading={loading}
                    locale={locale}
                    t={t}
                    createForm={createForm}
                    editForm={editForm}
                    editingUserId={editingUserId}
                    onCreateSubmit={handleCreateUser}
                    onCreateFieldChange={updateCreateField}
                    onRefresh={loadUsers}
                    onStartEdit={startEditUser}
                    onEditFieldChange={updateEditField}
                    onSaveEdit={handleUpdateUser}
                    onCancelEdit={() => setEditingUserId(null)}
                    onDelete={handleDeleteUser}
                />

                <GamesSection
                    games={games}
                    gamesLoading={gamesLoading}
                    gameForm={gameForm}
                    gameEditForm={gameEditForm}
                    editingGameId={editingGameId}
                    gameUploading={gameUploading}
                    gameEditUploading={gameEditUploading}
                    reviewBusyId={reviewBusyId}
                    t={t}
                    onRefresh={loadGames}
                    onCreateSubmit={handleCreateGame}
                    onCreateFieldChange={updateGameField}
                    onCreateImageUpload={handleGameImageUpload}
                    onStartEdit={startEditGame}
                    onEditFieldChange={updateGameEditField}
                    onEditImageUpload={handleGameEditImageUpload}
                    onSaveEdit={handleUpdateGame}
                    onCancelEdit={cancelEditGame}
                    onDelete={handleDeleteGame}
                    onStatusChange={handleGameStatus}
                    onPreviewOpen={markGamePreviewed}
                    wasPreviewed={wasPreviewed}
                />
            </div>
        </div>
    );

    // image upload
    async function uploadGameImage(event, setUploadingState, setImageUrl) {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadingState(true);
        resetFeedback();

        try {
            const response = await api.adminUploadGameImage(file);
            setImageUrl(response.imageUrl || "");
            setMessage(response.message || t("admin.uploadImage"));
        } catch (requestError) {
            setError(getActionError(requestError, t, "adminUploadGameImage"));
        } finally {
            setUploadingState(false);
            event.target.value = "";
        }
    }

    // feedback reset
    function resetFeedback() {
        setMessage("");
        setError("");
    }
}

// empty game
function emptyGameForm() {
    return {
        titleHu: "",
        titleEn: "",
        slug: "",
        descriptionHu: "",
        descriptionEn: "",
        tutorialHu: "",
        tutorialEn: "",
        sourceType: "EMBED_URL",
        externalUrl: "",
        htmlCode: "",
        htmlTranslationsHu: EMPTY_TRANSLATIONS,
        htmlTranslationsEn: EMPTY_TRANSLATIONS,
        imageUrl: ""
    };
}
