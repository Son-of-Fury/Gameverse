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

export default function GameLeaderboard({ rows, filterDate, sortOrder, locale, t, onFilterDateChange, onSortOrderChange, onReset }) {
    return (
        <aside className="game-leaderboard">
            <h3 className="game-leaderboard-title">🏆 {t("game.topPlayers")}</h3>
            <div className="game-leaderboard-filters">
                <select className="game-leaderboard-select" value={filterDate} onChange={(event) => onFilterDateChange(event.target.value)}>
                    <option value="">{t("game.allTimes")}</option>
                    <option value="today">{t("leaderboard.today")}</option>
                    <option value="yesterday">{t("leaderboard.yesterday")}</option>
                </select>
                <select className="game-leaderboard-select" value={sortOrder} onChange={(event) => onSortOrderChange(event.target.value)}>
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
