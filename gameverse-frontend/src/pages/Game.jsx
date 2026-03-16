import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, getActionError, getToken, hasConsent } from "../lib/api.js";
import { useI18n } from "../i18n/I18nContext.jsx";
import "../styles/Game.css";

const SCORE_EVENT_TYPES = ["SNAKE_SCORE", "GAME_SCORE", "GV_SCORE", "GAMEVERSE_SCORE"];
const READY_EVENT_TYPES = ["SNAKE_READY", "GAME_READY", "GV_READY", "GAMEVERSE_READY"];

// game page
export default function Game() {
    const { t, locale } = useI18n();
    const { slug } = useParams();
    const [game, setGame] = useState(null);
    const [inlineHtml, setInlineHtml] = useState("");
    const [msg, setMsg] = useState("");
    const [score, setScore] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [userBestScore, setUserBestScore] = useState(0);
    const [filterDate, setFilterDate] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");

    // leaderboard filter
    const filteredLeaderboard = useMemo(() => {
        let result = [...leaderboard];

        if (filterDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            result = result.filter(row => {
                const rowDate = new Date(row.createdAt);
                rowDate.setHours(0, 0, 0, 0);
                if (filterDate === "today") return rowDate.getTime() === today.getTime();
                if (filterDate === "yesterday") return rowDate.getTime() === yesterday.getTime();
                return true;
            });
        }

        result.sort((a, b) => sortOrder === "desc" ? b.score - a.score : a.score - b.score);
        return result;
    }, [leaderboard, filterDate, sortOrder]);

    // iframe sync
    const sendHighScoreToIframe = useCallback((value) => {
        const iframe = document.querySelector("iframe");
        if (!iframe?.contentWindow) return;

        iframe.contentWindow.postMessage({ type: "SET_PLAYER_HIGHSCORE", score: value }, "*");
        iframe.contentWindow.postMessage({ type: "GAMEVERSE_SET_HIGHSCORE", score: value, highScore: value }, "*");
    }, []);

    // leaderboard load
    const updateLeaderboard = useCallback((gameId) => {
        if (!gameId) return;

        api.leaderboardByGame(gameId)
            .then(data => {
                setLeaderboard(data);
                if (!getToken()) {
                    setUserBestScore(0);
                    return;
                }

                api.me()
                    .then(user => {
                        if (!user?.username) return;
                        const ownRecord = data.find(row => row.username === user.username);
                        setUserBestScore(ownRecord?.score || 0);
                    })
                    .catch(() => {});
            })
            .catch(error => console.error("Error while refreshing the leaderboard:", error));
    }, []);

    // score sync
    useEffect(() => {
        if (userBestScore > 0) {
            sendHighScoreToIframe(userBestScore);
        }
    }, [userBestScore, sendHighScoreToIframe]);

    // leaderboard poll
    useEffect(() => {
        if (!game?.id) return;
        updateLeaderboard(game.id);
        const intervalId = setInterval(() => updateLeaderboard(game.id), 15000);
        return () => clearInterval(intervalId);
    }, [game?.id, updateLeaderboard]);

    // game load
    useEffect(() => {
        api.gameBySlug(slug)
            .then(data => {
                setGame(data);
                updateLeaderboard(data.id);
            })
            .catch(error => setMsg(t("game.loadError", String(error))));
    }, [slug, t, updateLeaderboard]);

    // inline html
    useEffect(() => {
        if (!game || game.sourceType !== "INLINE_HTML") {
            setInlineHtml("");
            return;
        }

        let active = true;

        api.gamePlayHtml(game.slug)
            .then(html => {
                if (active) {
                    setInlineHtml(typeof html === "string" ? html : "");
                }
            })
            .catch(() => {
                if (active) {
                    setInlineHtml("");
                }
            });

        return () => {
            active = false;
        };
    }, [game]);

    // auto score
    const autoSubmit = useCallback(async (gameId, value) => {
        if (!hasConsent()) {
            setMsg(t("game.cookieRequired"));
            return;
        }

        try {
            setMsg(t("game.savingPoints"));
            await api.submitScore(gameId, value);
            setMsg(t("game.scoreSaved", value));

            if (value > userBestScore) {
                setUserBestScore(value);
            }

            updateLeaderboard(gameId);
        } catch (error) {
            setMsg(getActionError(error, t, "submitScore"));
        }
    }, [t, updateLeaderboard, userBestScore]);

    // game events
    useEffect(() => {
        const handler = (event) => {
            const type = event.data?.type;

            if (SCORE_EVENT_TYPES.includes(type)) {
                const nextScore = Number(event.data.score ?? event.data.value);
                setScore(nextScore);
                if (game?.id) autoSubmit(game.id, nextScore);
            }

            if (READY_EVENT_TYPES.includes(type)) {
                sendHighScoreToIframe(userBestScore);
            }
        };

        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, [autoSubmit, game, sendHighScoreToIframe, userBestScore]);

    if (!game) return <div className="game-loading">{msg || t("game.loading")}</div>;

    const rawEmbedUrl = (game.embedUrl || "").trim();
    const iframeProps = game.sourceType === "INLINE_HTML"
        ? { srcDoc: inlineHtml || fallbackInlineHtmlDocument(t("game.loading")) }
        : { src: rawEmbedUrl };

    async function rate(value) {
        setMsg("");
        try {
            if (!hasConsent()) return setMsg(t("game.cookiesRequiredForRating"));
            await api.rate(game.id, value);
            setMsg(t("game.feedbackSaved"));
        } catch (error) {
            setMsg(getActionError(error, t, value === "LIKE" ? "like" : "dislike"));
        }
    }

    return (
        <div className="game-page">
            {/* summary */}
            <GameSummary game={game} t={t} />
            {/* player */}
            <GamePlayArea game={game} iframeProps={iframeProps} message={msg} score={score} t={t} onRate={rate} />
            {/* leaderboard */}
            <GameLeaderboard
                rows={filteredLeaderboard}
                filterDate={filterDate}
                sortOrder={sortOrder}
                locale={locale}
                t={t}
                onFilterDateChange={setFilterDate}
                onSortOrderChange={setSortOrder}
                onReset={() => { setFilterDate(""); setSortOrder("desc"); }}
            />
        </div>
    );
}

// game summary
function GameSummary({ game, t }) {
    return (
        <aside className="game-summary">
            <div>
                <h2 className="game-summary-title">{game.title}</h2>
                <p className="game-summary-description">{game.description}</p>
            </div>
            <div className="game-summary-tutorial">
                <h4 className="game-summary-subtitle">{t("game.howToPlay")}</h4>
                <div className="game-summary-tutorial-text">{game.tutorial || "?"}</div>
            </div>
        </aside>
    );
}

// game player
function GamePlayArea({ game, iframeProps, message, score, t, onRate }) {
    const isError = message.startsWith("Error") || message.startsWith("Hiba");

    return (
        <section className="game-play-area">
            <iframe title={game.title} {...iframeProps} className="game-frame" />
            <div className="game-toolbar">
                <div className="game-reactions">
                    <button className="game-reaction-button" onClick={() => onRate("LIKE")}>👍</button>
                    <button className="game-reaction-button" onClick={() => onRate("DISLIKE")}>👎</button>
                </div>
                <div className="game-message">
                    {message ? (
                        <span className={`game-message-text ${isError ? "game-message-error" : "game-message-success"}`}>
                            {message}
                            {message === t("game.loginRequired") ? <Link to="/login" className="game-login-link">{t("game.login")}</Link> : null}
                        </span>
                    ) : null}
                </div>
                <div className="game-score">{score !== null ? `${score} ${t("game.pointUnit")}` : t("game.start")}</div>
            </div>
        </section>
    );
}

// game table
function GameLeaderboard({ rows, filterDate, sortOrder, locale, t, onFilterDateChange, onSortOrderChange, onReset }) {
    return (
        <aside className="game-leaderboard">
            <h3 className="game-leaderboard-title">🏆 {t("game.topPlayers")}</h3>

            <div className="game-leaderboard-filters">
                <select className="game-leaderboard-select" value={filterDate} onChange={e => onFilterDateChange(e.target.value)}>
                    <option value="">{t("game.allTimes")}</option>
                    <option value="today">{t("leaderboard.today")}</option>
                    <option value="yesterday">{t("leaderboard.yesterday")}</option>
                </select>
                <select className="game-leaderboard-select" value={sortOrder} onChange={e => onSortOrderChange(e.target.value)}>
                    <option value="desc">{t("game.pointShortDesc")}</option>
                    <option value="asc">{t("game.pointShortAsc")}</option>
                </select>
                <button className="game-leaderboard-reset" onClick={onReset}>✖</button>
            </div>

            <div className="game-table-wrap">
                <table className="game-table">
                    <thead className="game-table-head">
                    <tr>
                        <th>#</th>
                        <th>{t("game.name")}</th>
                        <th className="game-table-right">{t("game.point")}</th>
                        <th className="game-table-right">{t("game.date")}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.map((row, index) => <GameLeaderboardRow key={index} row={row} index={index} locale={locale} t={t} />)}
                    </tbody>
                </table>
            </div>
        </aside>
    );
}

function GameLeaderboardRow({ row, index, locale, t }) {
    const rankColors = ["#fbbf24", "#94a3b8", "#b45309"];
    const isTop3 = index < 3;

    return (
        <tr className="game-table-row">
            <td className="game-table-cell">
                <div
                    className={`game-rank ${isTop3 ? "game-rank-top" : "game-rank-default"}`}
                    style={isTop3 ? { background: rankColors[index] } : undefined}
                >
                    {index + 1}
                </div>
            </td>
            <td className="game-table-cell game-player">{row.username ?? t("game.anonymous")}</td>
            <td className="game-table-cell game-table-right game-score-value">{row.score.toLocaleString()}</td>
            <td className="game-table-cell game-table-right game-score-date">
                {row.createdAt ? new Date(row.createdAt).toLocaleDateString(locale, { month: "short", day: "numeric" }) : "—"}
            </td>
        </tr>
    );
}

function fallbackInlineHtmlDocument(loadingLabel) {
    return `<!doctype html><html><body style="background:#0f172a;color:#fff;font-family:system-ui;display:grid;place-items:center;min-height:100vh">${loadingLabel}</body></html>`;
}
