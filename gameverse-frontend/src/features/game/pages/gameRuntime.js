import { api, getActionError, getToken, hasConsent } from "../../../lib/api.js";

export function createResetGameState() {
    return {
        game: null,
        inlineHtml: "",
        msg: "",
        score: null,
        leaderboard: [],
        userBestScore: 0
    };
}

export async function loadGameDetails(component, slug) {
    const { t } = component.context;

    try {
        const game = await api.gameBySlug(slug);
        component.setState({ game, msg: "" });
        await updateLeaderboard(component, game.id);
    } catch (error) {
        component.setState({ msg: t("game.loadError", String(error)) });
    }
}

export async function loadInlineHtml(component) {
    const { game } = component.state;

    if (!game || game.sourceType !== "INLINE_HTML") {
        component.setState({ inlineHtml: "" });
        return;
    }

    try {
        const html = await api.gamePlayHtml(game.slug);
        component.setState({ inlineHtml: typeof html === "string" ? html : "" });
    } catch {
        component.setState({ inlineHtml: "" });
    }
}

export async function updateLeaderboard(component, gameId) {
    if (!gameId) {
        return;
    }

    try {
        const leaderboard = await api.leaderboardByGame(gameId);
        component.setState({ leaderboard });

        if (!getToken()) {
            component.setState({ userBestScore: 0 });
            return;
        }

        try {
            const user = await api.me();
            if (!user?.username) {
                return;
            }
            const ownRecord = leaderboard.find((row) => row.username === user.username);
            component.setState({ userBestScore: ownRecord?.score || 0 });
        } catch {
            return;
        }
    } catch {
        return;
    }
}

export function syncIframeHighScore(value) {
    const iframe = document.querySelector("iframe");
    if (!iframe?.contentWindow) {
        return;
    }

    iframe.contentWindow.postMessage({ type: "SET_PLAYER_HIGHSCORE", score: value }, "*");
    iframe.contentWindow.postMessage({ type: "GAMEVERSE_SET_HIGHSCORE", score: value, highScore: value }, "*");
}

export async function submitAutoScore(component, gameId, value) {
    const { t } = component.context;
    const { userBestScore } = component.state;

    if (!hasConsent()) {
        component.setState({ msg: t("game.cookieRequired") });
        return;
    }

    try {
        component.setState({ msg: t("game.savingPoints") });
        await api.submitScore(gameId, value);
        component.setState({
            msg: t("game.scoreSaved", value),
            userBestScore: value > userBestScore ? value : userBestScore
        });
        await updateLeaderboard(component, gameId);
    } catch (error) {
        component.setState({ msg: getActionError(error, t, "submitScore") });
    }
}

export async function submitRating(component, value) {
    const { t } = component.context;
    const { game } = component.state;

    component.setState({ msg: "" });

    try {
        if (!hasConsent()) {
            component.setState({ msg: t("game.cookiesRequiredForRating") });
            return;
        }
        await api.rate(game.id, value);
        component.setState({ msg: t("game.feedbackSaved") });
    } catch (error) {
        component.setState({ msg: getActionError(error, t, value === "LIKE" ? "like" : "dislike") });
    }
}
