import { Component } from "react";
import GameLeaderboard from "../components/GameLeaderboard.jsx";
import GamePlayArea from "../components/GamePlayArea.jsx";
import GameSummary from "../components/GameSummary.jsx";
import { withRouter } from "../../../hoc/withRouter.jsx";
import { I18nContext } from "../../../i18n/context.js";
import { buildFilteredLeaderboard, fallbackInlineHtmlDocument, READY_EVENT_TYPES, SCORE_EVENT_TYPES } from "../../../utils/gamePage.js";
import { createResetGameState, loadGameDetails, loadInlineHtml, submitAutoScore, submitRating, syncIframeHighScore, updateLeaderboard } from "./gameRuntime.js";
import "../../../styles/Game.css";

class Game extends Component {
    static contextType = I18nContext;

    constructor(props) {
        super(props);
        this.state = {
            ...createResetGameState(),
            filterDate: "",
            sortOrder: "desc"
        };
        this.leaderboardIntervalId = null;
    }

    componentDidMount() {
        this.loadGame();
        window.addEventListener("message", this.handleMessage);
    }

    componentDidUpdate(previousProps, previousState) {
        if (previousProps.params.slug !== this.props.params.slug) {
            this.clearLeaderboardPolling();
            this.setState(createResetGameState(), this.loadGame);
        }

        if (previousState.userBestScore !== this.state.userBestScore && this.state.userBestScore > 0) {
            syncIframeHighScore(this.state.userBestScore);
        }

        if (previousState.game?.id !== this.state.game?.id) {
            this.restartLeaderboardPolling();
        }

        if (previousState.game?.slug !== this.state.game?.slug || previousState.game?.sourceType !== this.state.game?.sourceType) {
            this.loadInlineHtml();
        }
    }

    componentWillUnmount() {
        window.removeEventListener("message", this.handleMessage);
        this.clearLeaderboardPolling();
    }

    get filteredLeaderboard() {
        const { leaderboard, filterDate, sortOrder } = this.state;
        return buildFilteredLeaderboard(leaderboard, filterDate, sortOrder);
    }

    loadGame = async () => {
        await loadGameDetails(this, this.props.params.slug);
    };

    loadInlineHtml = async () => {
        await loadInlineHtml(this);
    };

    updateLeaderboard = async (gameId) => {
        await updateLeaderboard(this, gameId);
    };

    restartLeaderboardPolling = () => {
        this.clearLeaderboardPolling();

        if (!this.state.game?.id) {
            return;
        }

        this.updateLeaderboard(this.state.game.id);
        this.leaderboardIntervalId = window.setInterval(() => {
            this.updateLeaderboard(this.state.game?.id);
        }, 15000);
    };

    clearLeaderboardPolling = () => {
        if (this.leaderboardIntervalId) {
            window.clearInterval(this.leaderboardIntervalId);
            this.leaderboardIntervalId = null;
        }
    };

    autoSubmit = async (gameId, value) => {
        await submitAutoScore(this, gameId, value);
    };

    handleMessage = (event) => {
        const type = event.data?.type;
        const { game, userBestScore } = this.state;

        if (SCORE_EVENT_TYPES.includes(type)) {
            const nextScore = Number(event.data.score ?? event.data.value);
            this.setState({ score: nextScore });
            if (game?.id) {
                this.autoSubmit(game.id, nextScore);
            }
        }

        if (READY_EVENT_TYPES.includes(type)) {
            syncIframeHighScore(userBestScore);
        }
    };

    handleRate = async (value) => {
        await submitRating(this, value);
    };

    render() {
        const { t, locale } = this.context;
        const { game, inlineHtml, msg, score, filterDate, sortOrder } = this.state;

        if (!game) {
            return <div className="game-loading">{msg || t("game.loading")}</div>;
        }

        const rawEmbedUrl = (game.embedUrl || "").trim();
        const iframeProps = game.sourceType === "INLINE_HTML"
            ? { srcDoc: inlineHtml || fallbackInlineHtmlDocument(t("game.loading")) }
            : { src: rawEmbedUrl };

        return (
            <div className="game-page">
                <GameSummary game={game} t={t} />
                <GamePlayArea game={game} iframeProps={iframeProps} message={msg} score={score} t={t} onRate={this.handleRate} />
                <GameLeaderboard
                    rows={this.filteredLeaderboard}
                    filterDate={filterDate}
                    sortOrder={sortOrder}
                    locale={locale}
                    t={t}
                    onFilterDateChange={(value) => this.setState({ filterDate: value })}
                    onSortOrderChange={(value) => this.setState({ sortOrder: value })}
                    onReset={() => this.setState({ filterDate: "", sortOrder: "desc" })}
                />
            </div>
        );
    }
}

const RoutedGame = withRouter(Game);

export default RoutedGame;
