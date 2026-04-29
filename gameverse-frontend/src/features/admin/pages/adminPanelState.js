export const PREVIEWED_GAMES_KEY = "gv_admin_previewed_games";
export const EMPTY_USER_FORM = { username: "", email: "", password: "", profileImage: "" };
export const EMPTY_USER_EDIT_FORM = { username: "", email: "", profileImage: "" };
export const EMPTY_TRANSLATIONS = "{\n  \n}";

export function createAdminPanelState() {
    return {
        users: [],
        games: [],
        loading: true,
        gamesLoading: true,
        gameUploading: false,
        reviewBusyId: null,
        editingGameId: null,
        gameEditUploading: false,
        message: "",
        error: "",
        editingUserId: null,
        createForm: { ...EMPTY_USER_FORM },
        editForm: { ...EMPTY_USER_EDIT_FORM },
        gameForm: emptyGameForm(),
        gameEditForm: emptyGameForm()
    };
}

export function emptyGameForm() {
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

function slugify(value) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function buildGameSlug(form, preferredTitleName, preferredTitleValue) {
    const nextTitleHu = preferredTitleName === "titleHu" ? preferredTitleValue : form.titleHu;
    const nextTitleEn = preferredTitleName === "titleEn" ? preferredTitleValue : form.titleEn;
    const normalizedHu = nextTitleHu?.trim() || "";
    const normalizedEn = nextTitleEn?.trim() || "";
    const titlesDiffer = normalizedHu && normalizedEn && normalizedHu !== normalizedEn;
    const sourceTitle = titlesDiffer
        ? normalizedEn
        : normalizedEn || normalizedHu || "";
    return slugify(sourceTitle);
}

export function updateNamedFormField(component, formKey, event) {
    const { name, value, type, checked } = event.target;
    component.setState((current) => {
        const nextValue = type === "checkbox" ? checked : value;
        const nextForm = { ...current[formKey], [name]: nextValue };

        if (formKey === "gameForm" || formKey === "gameEditForm") {
            if (name === "titleHu" || name === "titleEn") {
                nextForm.slug = buildGameSlug(current[formKey], name, nextValue);
            }
        }

        return { [formKey]: nextForm };
    });
}

export function resetAdminFeedback(component) {
    component.setState({ message: "", error: "" });
}

export function getPreviewedGames() {
    try {
        return JSON.parse(localStorage.getItem(PREVIEWED_GAMES_KEY) || "[]");
    } catch {
        return [];
    }
}

export function wasPreviewedGame(slug) {
    return getPreviewedGames().includes(slug);
}

export function markPreviewedGame(slug) {
    const previewedGames = new Set(getPreviewedGames());
    previewedGames.add(slug);
    localStorage.setItem(PREVIEWED_GAMES_KEY, JSON.stringify([...previewedGames]));
}

export function clearPreviewedGame(slug) {
    const previewedGames = getPreviewedGames().filter((item) => item !== slug);
    localStorage.setItem(PREVIEWED_GAMES_KEY, JSON.stringify(previewedGames));
}
