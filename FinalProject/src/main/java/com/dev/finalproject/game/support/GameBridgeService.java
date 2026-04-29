package com.dev.finalproject.game.support;

import com.dev.finalproject.game.Game;
import tools.jackson.databind.ObjectMapper;

import java.util.Locale;

public class GameBridgeService {
    private final ObjectMapper objectMapper;
    private final GameTextSupport gameTextSupport;

    public GameBridgeService(ObjectMapper objectMapper, GameTextSupport gameTextSupport) {
        this.objectMapper = objectMapper;
        this.gameTextSupport = gameTextSupport;
    }

    public String withGameverseBridge(String html, Game game, Locale locale, String translations) {
        String localeCode = gameTextSupport.resolveLocaleCode(locale);
        String title = gameTextSupport.resolveTitle(game, locale);
        String gameContextJson = buildGameContextJson(game, localeCode, title, translations);
        String bridgeScript = """
                <script>
                (function () {
                    window.GameverseContext = %s;

                    window.GameverseT = function (key, fallback) {
                        var source = window.GameverseContext && window.GameverseContext.translations;
                        if (!source || !key) {
                            return fallback || key || '';
                        }

                        var value = key.split('.').reduce(function (acc, part) {
                            return acc && typeof acc === 'object' ? acc[part] : undefined;
                        }, source);

                        if (typeof value === 'string' || typeof value === 'number') {
                            return String(value);
                        }

                        return fallback || key;
                    };

                    function normalizeScore(value) {
                        var parsed = Number(value);
                        return Number.isFinite(parsed) ? parsed : 0;
                    }

                    window.GameverseBridge = {
                        submitScore: function (score) {
                            window.parent.postMessage({ type: 'GAME_SCORE', score: normalizeScore(score) }, '*');
                        },
                        ready: function () {
                            window.parent.postMessage({ type: 'GAME_READY' }, '*');
                        }
                    };

                    window.addEventListener('message', function (event) {
                        if (!event.data) return;
                        var type = event.data.type;
                        if (type === 'SET_PLAYER_HIGHSCORE' || type === 'GAMEVERSE_SET_HIGHSCORE') {
                            var score = normalizeScore(event.data.score ?? event.data.highScore);
                            window.dispatchEvent(new CustomEvent('gameverse:set-high-score', { detail: { score: score } }));
                            if (typeof window.onGameverseHighScore === 'function') {
                                window.onGameverseHighScore(score);
                            }
                        }
                    });

                    window.parent.postMessage({ type: 'GAME_READY' }, '*');
                })();
                </script>
                """.formatted(gameContextJson);

        if (html.contains("<head>")) {
            return html.replace("<head>", "<head>" + bridgeScript);
        }
        if (html.contains("<body")) {
            int bodyEnd = html.indexOf('>', html.indexOf("<body"));
            if (bodyEnd >= 0) {
                return html.substring(0, bodyEnd + 1) + bridgeScript + html.substring(bodyEnd + 1);
            }
        }
        if (html.contains("</body>")) {
            return html.replace("</body>", bridgeScript + "</body>");
        }
        return bridgeScript + html;
    }

    public String normalizeTranslationsForResponse(String value) {
        if (value == null || value.isBlank()) {
            return "{}";
        }
        try {
            return objectMapper.writeValueAsString(objectMapper.readTree(value)).replace("</", "<\\/");
        } catch (Exception e) {
            return "{}";
        }
    }

    private String buildGameContextJson(Game game, String localeCode, String title, String translations) {
        try {
            return objectMapper.writeValueAsString(java.util.Map.of(
                    "locale", localeCode,
                    "translations", objectMapper.readTree(translations),
                    "game", java.util.Map.of(
                            "slug", gameTextSupport.fallback(game.getSlug(), ""),
                            "title", gameTextSupport.fallback(title, "")
                    )
            )).replace("</", "<\\/");
        } catch (Exception e) {
            return "{\"locale\":\"" + localeCode + "\",\"translations\":{},\"game\":{\"slug\":\"" + escapeJson(gameTextSupport.fallback(game.getSlug(), "")) + "\",\"title\":\"" + escapeJson(gameTextSupport.fallback(title, "")) + "\"}}";
        }
    }

    private String escapeJson(String value) {
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("</", "<\\/");
    }
}
