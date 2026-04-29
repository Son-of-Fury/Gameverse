import { request } from "../http/request.js";

export const gameApi = {
    games: () => request("/api/games"),
    gameBySlug: (slug) => request(`/api/games/${slug}`),
    gamePlayHtml: (slug) => request(`/api/games/${slug}/play`),
    rate: (gameId, value) => request(`/api/games/${gameId}/${value.toLowerCase()}`, { method: "POST", auth: true, body: { gameId, value } }),
    submitScore: (gameId, score) => request("/api/scores", { method: "POST", auth: true, body: { gameId, score } }),
    leaderboardGlobal: () => request("/api/leaderboard"),
    leaderboardByGame: (gameId) => request(`/api/leaderboard/${gameId}`)
};
