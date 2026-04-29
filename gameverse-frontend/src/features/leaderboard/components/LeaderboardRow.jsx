export default function LeaderboardRow({ row, index, locale, t }) {
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
