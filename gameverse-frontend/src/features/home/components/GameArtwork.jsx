import { Component } from "react";

export default class GameArtwork extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false
        };
    }

    handleError = () => {
        this.setState({ hasError: true });
    };

    render() {
        const { game, fallbackText, variant, dimmed = false } = this.props;
        const hasImage = Boolean(game.imageUrl) && !this.state.hasError;

        return (
            <div className={`home-artwork ${variant === "top" ? "home-artwork-top" : "home-artwork-default"}`}>
                {hasImage ? (
                    <img
                        src={game.imageUrl}
                        alt={game.title}
                        onError={this.handleError}
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
}
