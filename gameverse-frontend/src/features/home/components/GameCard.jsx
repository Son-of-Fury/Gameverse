import { Link } from "react-router-dom";
import GameArtwork from "./GameArtwork.jsx";

export default function GameCard({ game, t }) {
    return (
        <div className="home-game-card">
            <GameArtwork game={game} fallbackText={t("home.imageFallback")} variant="default" />
            <div className="home-card-body">
                <div className="home-card-header">
                    <h3 className="home-card-name">{game.title}</h3>
                    <div className="home-card-badge home-card-badge-default">👍 {game.likeCount || 0}</div>
                </div>
                <p className="home-card-description">{game.description}</p>
                <Link to={`/game/${game.slug}`} className="home-open-link">{t("home.open")}</Link>
            </div>
        </div>
    );
}
