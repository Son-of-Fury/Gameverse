import { applyDateFilter, sortRowsByScore } from "./leaderboard.js";

export const SCORE_EVENT_TYPES = ["SNAKE_SCORE", "GAME_SCORE", "GV_SCORE", "GAMEVERSE_SCORE"];
export const READY_EVENT_TYPES = ["SNAKE_READY", "GAME_READY", "GV_READY", "GAMEVERSE_READY"];

export function buildFilteredLeaderboard(leaderboard, filterDate, sortOrder) {
    return sortRowsByScore(applyDateFilter([...leaderboard], filterDate), sortOrder);
}

export function fallbackInlineHtmlDocument(loadingLabel) {
    return `<!doctype html><html><body style="background:#0f172a;color:#fff;font-family:system-ui;display:grid;place-items:center;min-height:100vh">${loadingLabel}</body></html>`;
}
