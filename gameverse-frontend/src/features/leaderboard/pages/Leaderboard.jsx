import { Component } from "react";
import LeaderboardRow from "../components/LeaderboardRow.jsx";
import { I18nContext } from "../../../i18n/context.js";
import { api } from "../../../lib/api.js";
import { applyDateFilter, sortRowsByScore } from "../../../utils/leaderboard.js";
import "../../../styles/Leaderboard.css";

export default class Leaderboard extends Component {
    static contextType = I18nContext;

    constructor(props) {
        super(props);
        this.state = {
            rows: [],
            games: [],
            err: "",
            filterGame: "",
            filterDate: "",
            sortOrder: "desc"
        };
    }

    componentDidMount() {
        this.loadLeaderboard();
    }

    loadLeaderboard = async () => {
        try {
            const [rows, games] = await Promise.all([api.leaderboardGlobal(), api.games()]);
            this.setState({ rows, games, err: "" });
        } catch (error) {
            this.setState({ err: String(error) });
        }
    };

    handleFieldChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    resetFilters = () => {
        this.setState({
            filterGame: "",
            filterDate: "",
            sortOrder: "desc"
        });
    };

    getFilteredRows() {
        const { rows, filterGame, filterDate, sortOrder } = this.state;
        let result = rows;

        if (filterGame) {
            result = result.filter((row) => (row.gameTitle || row.gameId) === filterGame);
        }

        result = applyDateFilter(result, filterDate);
        return sortRowsByScore(result, sortOrder);
    }

    render() {
        const { t, locale } = this.context;
        const { games, err, filterGame, filterDate, sortOrder } = this.state;
        const filteredRows = this.getFilteredRows();
        const selectedDateLabel = filterDate
            ? new Date(`${filterDate}T00:00:00`).toLocaleDateString(locale)
            : "";

        if (err) {
            return <div className="leaderboard-error">{t("leaderboard.error")}: {err}</div>;
        }

        return (
            <div className="leaderboard-page">
                <div className="leaderboard-header">
                    <h1 className="leaderboard-title">🏆 {t("leaderboard.title")}</h1>
                </div>

                <div className="leaderboard-filters">
                    <div className="leaderboard-filter">
                        <label className="leaderboard-label">{t("leaderboard.game")}</label>
                        <select className="leaderboard-select" name="filterGame" value={filterGame} onChange={this.handleFieldChange}>
                            <option value="">{t("leaderboard.everyGame")}</option>
                            {games.map((game) => <option key={game.id} value={game.title}>{game.title}</option>)}
                        </select>
                    </div>

                    <div className="leaderboard-filter">
                        <label className="leaderboard-label" htmlFor="leaderboard-date-filter">{t("leaderboard.date")}</label>
                        <div className="leaderboard-date-field">
                            <input
                                id="leaderboard-date-filter"
                                className={`leaderboard-select leaderboard-date-input${filterDate ? " has-value" : ""}`}
                                type="date"
                                name="filterDate"
                                value={filterDate}
                                onChange={this.handleFieldChange}
                                aria-label={t("leaderboard.pickDate")}
                            />
                            {!filterDate ? (
                                <span className="leaderboard-date-placeholder">{t("leaderboard.allTime")}</span>
                            ) : null}
                            {filterDate ? (
                                <span className="leaderboard-date-value">{selectedDateLabel}</span>
                            ) : null}
                        </div>
                    </div>

                    <div className="leaderboard-filter">
                        <label className="leaderboard-label">{t("leaderboard.order")}</label>
                        <select className="leaderboard-select" name="sortOrder" value={sortOrder} onChange={this.handleFieldChange}>
                            <option value="desc">{t("leaderboard.higherPointOnTop")}</option>
                            <option value="asc">{t("leaderboard.lowerPointOnTop")}</option>
                        </select>
                    </div>

                    <button className="leaderboard-reset" onClick={this.resetFilters}>
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
}
