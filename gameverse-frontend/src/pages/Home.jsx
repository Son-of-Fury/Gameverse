import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { useI18n } from "../i18n/I18nContext.jsx";
import "../styles/Home.css";

// home page
export default function Home() {
    const { t } = useI18n();
    const [games, setGames] = useState([]);
    const [search, setSearch] = useState("");
    const [err, setErr] = useState("");

    // games load
    useEffect(() => {
        api.games().then(setGames).catch(e => setErr(String(e)));
    }, []);

    const filteredGames = games.filter(g =>
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.description.toLowerCase().includes(search.toLowerCase())
    );

    const topLikedGames = [...games]
        .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0) || a.title.localeCompare(b.title))
        .slice(0, 3);

    if (err) return <div className="home-error">{t("home.error")}: {err}</div>;

    return (
        <div className="home-page">
            {/* hero */}
            <div className="home-section home-hero">
                <h1 className="home-title">{t("home.title")}</h1>
                <div className="home-search-wrap">
                    <input
                        className="home-search"
                        type="text"
                        placeholder={t("home.searchPlaceholder")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {search.trim() === "" && topLikedGames.length > 0 ? (
                /* top games */
                <div className="home-section home-highlight">
                    <div className="home-section-title-row">
                        <h2 className="home-section-title">{t("home.topLiked")}</h2>
                    </div>
                    <div className="home-highlight-grid">
                        {topLikedGames.map(game => <TopGameCard key={`top-${game.id}`} game={game} t={t} />)}
                    </div>
                </div>
            ) : null}

            <div className="home-section" data-section="all-games">
                <h2 className="home-section-title">{t("home.allGames")}</h2>
            </div>

            {/* game list */}
            <div className="home-grid">
                {filteredGames.map(game => <GameCard key={game.id} game={game} t={t} />)}
            </div>
        </div>
    );
}

// artwork
function GameArtwork({ game, fallbackText, variant, dimmed = false }) {
    const [hasError, setHasError] = useState(false);
    const hasImage = Boolean(game.imageUrl) && !hasError;

    return (
        <div className={`home-artwork ${variant === "top" ? "home-artwork-top" : "home-artwork-default"}`}>
            {hasImage ? (
                <img
                    src={game.imageUrl}
                    alt={game.title}
                    onError={() => setHasError(true)}
                    className={`home-artwork-image${dimmed ? " home-artwork-dimmed" : ""}`}
                />
            ) : (
                <div className={`home-artwork-fallback ${variant === "top" ? "home-artwork-fallback-top" : "home-artwork-fallback-default"}`}>
                    {fallbackText}
                </div>
            )}
        </div>
    );
}

// top card
function TopGameCard({ game, t }) {
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

// game card
function GameCard({ game, t }) {
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
