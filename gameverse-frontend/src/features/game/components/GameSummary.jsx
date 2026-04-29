export default function GameSummary({ game, t }) {
    const scoreSaveMessage = game.sourceType === "INLINE_HTML"
        ? t("game.autoScoreSaving")
        : t("game.scoreSavingUnavailable");

    return (
        <aside className="game-summary">
            <div>
                <h2 className="game-summary-title">{game.title}</h2>
                <p className="game-summary-description">{game.description}</p>
                <div className={`game-score-saving-note ${game.sourceType === "INLINE_HTML" ? "is-available" : "is-unavailable"}`}>
                    {scoreSaveMessage}
                </div>
            </div>
            <div className="game-summary-tutorial">
                <h4 className="game-summary-subtitle">{t("game.howToPlay")}</h4>
                <div className="game-summary-tutorial-text">{game.tutorial || "?"}</div>
            </div>
        </aside>
    );
}
