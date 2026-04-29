import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function GamePlayArea({ game, iframeProps, message, score, t, onRate }) {
    const iframeRef = useRef(null);
    const frameWrapRef = useRef(null);
    const [isFallbackFullscreen, setIsFallbackFullscreen] = useState(false);
    const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
    const isError = message.startsWith("Error") || message.startsWith("Hiba");
    const isFullscreen = isNativeFullscreen || isFallbackFullscreen;

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsNativeFullscreen(document.fullscreenElement === frameWrapRef.current);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    const handleFullscreenToggle = async () => {
        if (document.fullscreenElement) {
            await document.exitFullscreen();
            setIsFallbackFullscreen(false);
            return;
        }

        if (isFallbackFullscreen) {
            setIsFallbackFullscreen(false);
            return;
        }

        try {
            if (frameWrapRef.current?.requestFullscreen) {
                await frameWrapRef.current.requestFullscreen();
                return;
            }
        } catch {
            // Some mobile browsers block iframe fullscreen; use the CSS fallback below.
        }

        setIsFallbackFullscreen(true);
    };

    return (
        <section className={`game-play-area${isFallbackFullscreen ? " game-play-area-fullscreen" : ""}`}>
            <div ref={frameWrapRef} className="game-frame-wrap">
                <div className="game-frame-stage">
                    <iframe ref={iframeRef} title={game.title} {...iframeProps} className="game-frame" allowFullScreen scrolling="no" />
                </div>
            </div>
            <div className="game-toolbar">
                <div className="game-reactions">
                    <button className="game-reaction-button" onClick={() => onRate("LIKE")}>👍</button>
                    <button className="game-reaction-button" onClick={() => onRate("DISLIKE")}>👎</button>
                </div>
                <div className="game-message">
                    {message ? (
                        <span className={`game-message-text ${isError ? "game-message-error" : "game-message-success"}`}>
                            {message}
                            {message === t("game.loginRequired") ? <Link to="/login" className="game-login-link">{t("game.login")}</Link> : null}
                        </span>
                    ) : null}
                </div>
                <div className="game-score">{score !== null ? `${score} ${t("game.pointUnit")}` : t("game.start")}</div>
                <button type="button" className="game-toolbar-fullscreen-button" onClick={handleFullscreenToggle}>
                    {isFullscreen ? t("game.exitFullscreen") : t("game.fullscreen")}
                </button>
            </div>
        </section>
    );
}
