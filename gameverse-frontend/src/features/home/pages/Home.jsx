import { Component } from "react";
import GameCard from "../components/GameCard.jsx";
import TopGameCard from "../components/TopGameCard.jsx";
import { I18nContext } from "../../../i18n/context.js";
import { api } from "../../../lib/api.js";
import "../../../styles/Home.css";

export default class Home extends Component {
    static contextType = I18nContext;

    constructor(props) {
        super(props);
        this.state = {
            games: [],
            search: "",
            err: ""
        };
    }

    componentDidMount() {
        this.loadGames();
    }

    loadGames = async () => {
        try {
            const games = await api.games();
            this.setState({ games, err: "" });
        } catch (error) {
            this.setState({ err: String(error) });
        }
    };

    handleSearchChange = (event) => {
        this.setState({ search: event.target.value });
    };

    render() {
        const { t } = this.context;
        const { games, search, err } = this.state;
        const normalizedSearch = search.toLowerCase();
        const filteredGames = games.filter((game) =>
            game.title.toLowerCase().includes(normalizedSearch) ||
            game.description.toLowerCase().includes(normalizedSearch)
        );
        const topLikedGames = [...games]
            .sort((left, right) => (right.likeCount || 0) - (left.likeCount || 0) || left.title.localeCompare(right.title))
            .slice(0, 3);

        if (err) {
            return <div className="home-error">{t("home.error")}: {err}</div>;
        }

        return (
            <div className="home-page">
                <div className="home-section home-hero">
                    <h1 className="home-title">{t("home.title")}</h1>
                    <div className="home-search-wrap">
                        <input
                            className="home-search"
                            type="text"
                            placeholder={t("home.searchPlaceholder")}
                            value={search}
                            onChange={this.handleSearchChange}
                        />
                    </div>
                </div>

                {search.trim() === "" && topLikedGames.length > 0 ? (
                    <div className="home-section home-highlight">
                        <div className="home-section-title-row">
                            <h2 className="home-section-title">{t("home.topLiked")}</h2>
                        </div>
                        <div className="home-highlight-grid">
                            {topLikedGames.map((game) => <TopGameCard key={`top-${game.id}`} game={game} t={t} />)}
                        </div>
                    </div>
                ) : null}

                <div className="home-section" data-section="all-games">
                    <h2 className="home-section-title">{t("home.allGames")}</h2>
                </div>

                <div className="home-grid">
                    {filteredGames.map((game) => <GameCard key={game.id} game={game} t={t} />)}
                </div>
            </div>
        );
    }
}
