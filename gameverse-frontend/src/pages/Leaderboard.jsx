import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";
import { useI18n } from "../i18n/I18nContext.jsx";
import "../styles/Leaderboard.css";

// leaderboard page
export default function Leaderboard() {
    const { t, locale } = useI18n();
    const [rows, setRows] = useState([]);
    const [games, setGames] = useState([]);
    const [err, setErr] = useState("");
    const [filterGame, setFilterGame] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");

    // leaderboard load
    useEffect(() => {
        Promise.all([api.leaderboardGlobal(), api.games()])
            .then(([leaderboardData, gamesData]) => {
                setRows(leaderboardData);
                setGames(gamesData);
            })
            .catch(e => setErr(String(e)));
    }, []);

    // row filter
    const filteredRows = useMemo(() => {
        let result = [...rows];

        if (filterGame) {
            result = result.filter(r => (r.gameTitle || r.gameId) === filterGame);
        }

        if (filterDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            result = result.filter(r => {
                const rowDate = new Date(r.createdAt);
                rowDate.setHours(0, 0, 0, 0);
                if (filterDate === "today") return rowDate.getTime() === today.getTime();
                if (filterDate === "yesterday") return rowDate.getTime() === yesterday.getTime();
                return true;
            });
        }

        result.sort((a, b) => sortOrder === "desc" ? b.score - a.score : a.score - b.score);
        return result;
    }, [rows, filterGame, filterDate, sortOrder]);

    if (err) return <div className="leaderboard-error">{t("leaderboard.error")}: {err}</div>;

    return (
        <div className="leaderboard-page">
            {/* filters */}
            <div className="leaderboard-header">
                <h1 className="leaderboard-title">🏆 {t("leaderboard.title")}</h1>
            </div>

            <div className="leaderboard-filters">
                <div className="leaderboard-filter">
                    <label className="leaderboard-label">{t("leaderboard.game")}</label>
                    <select className="leaderboard-select" value={filterGame} onChange={e => setFilterGame(e.target.value)}>
                        <option value="">{t("leaderboard.everyGame")}</option>
                        {games.map(g => <option key={g.id} value={g.title}>{g.title}</option>)}
                    </select>
                </div>

                <div className="leaderboard-filter">
                    <label className="leaderboard-label">{t("leaderboard.time")}</label>
                    <select className="leaderboard-select" value={filterDate} onChange={e => setFilterDate(e.target.value)}>
                        <option value="">{t("leaderboard.allTime")}</option>
                        <option value="today">{t("leaderboard.today")}</option>
                        <option value="yesterday">{t("leaderboard.yesterday")}</option>
                    </select>
                </div>

                <div className="leaderboard-filter">
                    <label className="leaderboard-label">{t("leaderboard.order")}</label>
                    <select className="leaderboard-select" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                        <option value="desc">{t("leaderboard.higherPointOnTop")}</option>
                        <option value="asc">{t("leaderboard.lowerPointOnTop")}</option>
                    </select>
                </div>

                <button className="leaderboard-reset" onClick={() => { setFilterGame(""); setFilterDate(""); setSortOrder("desc"); }}>
                    {t("leaderboard.removeFilters")}
                </button>
            </div>

            <div className="leaderboard-table-wrap">
                <table className="leaderboard-table">
                    <thead>
                    <tr className="leaderboard-head-row">
                        <th className="leaderboard-th">#</th>
                        <th className="leaderboard-th">{t("leaderboard.player")}</th>
                        <th className="leaderboard-th">{t("leaderboard.game")}</th>
                        <th className="leaderboard-th leaderboard-align-right">{t("leaderboard.point")}</th>
                        <th className="leaderboard-th leaderboard-align-right">{t("leaderboard.date")}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredRows.map((row, index) => (
                        <LeaderboardRow key={row.id ?? index} row={row} index={index} locale={locale} t={t} />
                    ))}
                    </tbody>
                </table>
                {filteredRows.length === 0 ? <div className="leaderboard-empty">{t("leaderboard.noResults")}</div> : null}
            </div>
        </div>
    );
}

// leaderboard row
function LeaderboardRow({ row, index, locale, t }) {
    const rankColors = ["#fbbf24", "#94a3b8", "#b45309"];
    const isTop3 = index < 3;

    return (
        <tr className="leaderboard-row">
            <td className="leaderboard-td">
                <div
                    className={`leaderboard-rank ${isTop3 ? "leaderboard-rank-top" : "leaderboard-rank-default"}`}
                    style={isTop3 ? { background: rankColors[index] } : undefined}
                >
                    {index + 1}
                </div>
            </td>
            <td className="leaderboard-td leaderboard-player">{row.username ?? row.userEmail ?? t("leaderboard.guest")}</td>
            <td className="leaderboard-td">
                <span className="leaderboard-game-badge">{row.gameTitle ?? t("leaderboard.anonymous")}</span>
            </td>
            <td className="leaderboard-td leaderboard-align-right leaderboard-score">{row.score.toLocaleString()}</td>
            <td className="leaderboard-td leaderboard-align-right leaderboard-date">{row.createdAt ? new Date(row.createdAt).toLocaleDateString(locale) : "—"}</td>
        </tr>
    );
}
