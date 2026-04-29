import { api, getActionError } from "../../../lib/api.js";
import { EMPTY_TRANSLATIONS, clearPreviewedGame, emptyGameForm, resetAdminFeedback } from "./adminPanelState.js";

export async function createAdminGame(component, event) {
    event.preventDefault();
    const { t } = component.context;
    const { gameForm } = component.state;
    resetAdminFeedback(component);

    try {
        const response = await api.adminCreateGame(gameForm);
        component.setState({
            message: response.message || t("admin.createSuccess"),
            gameForm: emptyGameForm()
        });
        await component.loadGames();
    } catch (error) {
        component.setState({ error: getActionError(error, t, "adminCreateGame") });
    }
}

export async function startAdminGameEdit(component, gameId) {
    const { t } = component.context;
    component.setState({ editingGameId: gameId });
    resetAdminFeedback(component);

    try {
        const data = await api.adminGameDetails(gameId);
        component.setState({
            gameEditForm: {
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
            }
        });
    } catch (error) {
        component.setState({
            editingGameId: null,
            error: getActionError(error, t, "adminLoad")
        });
    }
}

export function cancelAdminGameEdit(component) {
    component.setState({
        editingGameId: null,
        gameEditForm: emptyGameForm()
    });
}

export async function updateAdminGame(component, gameId) {
    const { t } = component.context;
    const { gameEditForm } = component.state;
    resetAdminFeedback(component);

    try {
        const response = await api.adminUpdateGame(gameId, gameEditForm);
        clearPreviewedGame(gameEditForm.slug);
        component.setState({
            message: response.message || t("admin.gameUpdated"),
            editingGameId: null,
            gameEditForm: emptyGameForm()
        });
        await component.loadGames();
    } catch (error) {
        component.setState({ error: getActionError(error, t, "adminUpdateGame") });
    }
}

export async function updateAdminGameStatus(component, gameId, status) {
    const { t } = component.context;
    component.setState({ reviewBusyId: gameId });
    resetAdminFeedback(component);

    try {
        const response = await api.adminUpdateGameStatus(gameId, status);
        component.setState({
            message: response.message || t("admin.statusUpdated"),
            reviewBusyId: null
        });
        await component.loadGames();
    } catch (error) {
        component.setState({
            error: getActionError(error, t, "adminUpdateGameStatus"),
            reviewBusyId: null
        });
    }
}

export async function deleteAdminGame(component, gameId) {
    const { t } = component.context;
    resetAdminFeedback(component);

    try {
        const response = await api.adminDeleteGame(gameId);
        component.setState({ message: response.message || t("admin.deleteSuccess") });
        await component.loadGames();
    } catch (error) {
        component.setState({ error: getActionError(error, t, "adminDeleteGame") });
    }
}

export async function uploadAdminGameImage(component, event, uploadStateKey, formKey) {
    const { t } = component.context;
    const file = event.target.files?.[0];

    if (!file) {
        return;
    }

    component.setState({ [uploadStateKey]: true });
    resetAdminFeedback(component);

    try {
        const response = await api.adminUploadGameImage(file);
        component.setState((current) => ({
            [formKey]: { ...current[formKey], imageUrl: response.imageUrl || "" },
            [uploadStateKey]: false,
            message: response.message || t("admin.uploadImage")
        }));
    } catch (error) {
        component.setState({
            [uploadStateKey]: false,
            error: getActionError(error, t, "adminUploadGameImage")
        });
    } finally {
        event.target.value = "";
    }
}
