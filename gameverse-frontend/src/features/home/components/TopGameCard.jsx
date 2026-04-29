import { Link } from "react-router-dom";
import GameArtwork from "./GameArtwork.jsx";

export default function TopGameCard({ game, t }) {
    return (
        <Link to={`/game/${game.slug}`} className="home-top-card">
            <GameArtwork game={game} fallbackText={t("home.imageFallback")} variant="top" dimmed />
            <div className="home-card-body">
                <div className="home-card-header">
                    <div className="home-top-name">{game.title}</div>
                    <div className="home-card-badge home-card-badge-top">👍 {game.likeCount || 0}</div>
                </div>
                <div className="home-top-description">{game.description}</div>
            </div>
        </Link>
    );
}
