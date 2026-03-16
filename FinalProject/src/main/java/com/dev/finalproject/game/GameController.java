package com.dev.finalproject.game;

import com.dev.finalproject.i18n.LocalizationService;
import com.dev.finalproject.rating.Rating;
import com.dev.finalproject.rating.RatingRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import tools.jackson.databind.ObjectMapper;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/games")
// game api
public class GameController {
    private final GameRepository gameRepository;
    private final LocalizationService localizationService;
    private final RatingRepository ratingRepository;
    private final ObjectMapper objectMapper;

    public GameController(GameRepository gameRepository, LocalizationService localizationService, RatingRepository ratingRepository, ObjectMapper objectMapper) {
        this.gameRepository = gameRepository;
        this.localizationService = localizationService;
        this.ratingRepository = ratingRepository;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    // game list
    public List<GameResponse> list(Locale locale) {
        return gameRepository.findAllByActiveTrueOrderByIdAsc().stream()
                .map(game -> toResponse(game, locale))
                .toList();
    }

    @GetMapping("/{slug}")
    // game details
    public GameResponse get(@PathVariable String slug, Locale locale) {
        return gameRepository.findBySlugAndActiveTrue(slug)
                .map(game -> toResponse(game, locale))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, localizationService.get("game.notFound")));
    }

    @GetMapping(value = "/{slug}/play", produces = MediaType.TEXT_HTML_VALUE)
    // game play
    public ResponseEntity<String> play(@PathVariable String slug, Locale locale) {
        return gameRepository.findBySlugAndActiveTrue(slug)
                .filter(game -> game.getSourceType() == GameSourceType.INLINE_HTML)
                .map(game -> ResponseEntity.ok(withGameverseBridge(fallback(game.getHtmlCode(), ""), game, locale)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // public body
    private GameResponse toResponse(Game game, Locale locale) {
        return buildResponse(
                game,
                resolveTitle(game, locale),
                resolveDescription(game, locale),
                resolveTutorial(game, locale),
                resolvePlayUrl(game, false)
        );
    }

    // admin body
    public GameResponse toAdminResponse(Game game) {
        return buildResponse(
                game,
                fallback(game.getTitleHu(), game.getTitleEn()),
                fallback(game.getDescriptionHu(), game.getDescriptionEn()),
                fallback(game.getTutorialHu(), game.getTutorialEn()),
                resolvePlayUrl(game, false)
        );
    }

    // preview body
    public AdminGamePreviewResponse toAdminPreviewResponse(Game game, Locale locale) {
        GameResponse previewGame = buildResponse(
                game,
                resolveTitle(game, locale),
                resolveDescription(game, locale),
                resolveTutorial(game, locale),
                resolvePlayUrl(game, true)
        );
        String inlineHtml = game.getSourceType() == GameSourceType.INLINE_HTML
                ? withGameverseBridge(fallback(game.getHtmlCode(), ""), game, locale)
                : "";

        return new AdminGamePreviewResponse(previewGame, inlineHtml);
    }

    // detail body
    public AdminGameDetailsResponse toAdminDetailsResponse(Game game) {
        return new AdminGameDetailsResponse(
                game.getId(),
                game.getSlug(),
                fallback(game.getTitleHu(), game.getTitleEn()),
                fallback(game.getTitleEn(), game.getTitleHu()),
                fallback(game.getDescriptionHu(), game.getDescriptionEn()),
                fallback(game.getDescriptionEn(), game.getDescriptionHu()),
                fallback(game.getTutorialHu(), game.getTutorialEn()),
                fallback(game.getTutorialEn(), game.getTutorialHu()),
                fallback(game.getImageUrl(), ""),
                game.getSourceType().name(),
                fallback(game.getEmbedUrl(), ""),
                game.getHtmlCode() == null ? "" : game.getHtmlCode(),
                normalizeTranslationsForResponse(game.getHtmlTranslationsHu()),
                normalizeTranslationsForResponse(game.getHtmlTranslationsEn()),
                game.isActive(),
                resolveReviewStatus(game).name()
        );
    }

    // game body
    private GameResponse buildResponse(Game game, String title, String description, String tutorial, String playUrl) {
        return new GameResponse(
                game.getId(),
                game.getSlug(),
                title,
                description,
                fallback(game.getImageUrl(), ""),
                tutorial,
                playUrl,
                game.isActive(),
                game.getSourceType().name(),
                ratingRepository.countByGameIdAndValue(game.getId(), Rating.Value.LIKE),
                resolveReviewStatus(game).name()
        );
    }

    // review state
    private GameReviewStatus resolveReviewStatus(Game game) {
        if (game.getReviewStatus() != null) {
            return game.getReviewStatus();
        }
        return game.isActive() ? GameReviewStatus.PUBLISHED : GameReviewStatus.PENDING;
    }

    // play url
    private String resolvePlayUrl(Game game, boolean previewMode) {
        if (game.getSourceType() == GameSourceType.INLINE_HTML) {
            return previewMode ? "" : "/api/games/" + game.getSlug() + "/play";
        }
        return fallback(game.getEmbedUrl(), "");
    }

    // title text
    private String resolveTitle(Game game, Locale locale) {
        return isHungarian(locale)
                ? fallback(game.getTitleHu(), game.getTitleEn())
                : fallback(game.getTitleEn(), game.getTitleHu());
    }

    // description text
    private String resolveDescription(Game game, Locale locale) {
        return isHungarian(locale)
                ? fallback(game.getDescriptionHu(), game.getDescriptionEn())
                : fallback(game.getDescriptionEn(), game.getDescriptionHu());
    }

    // tutorial text
    private String resolveTutorial(Game game, Locale locale) {
        return isHungarian(locale)
                ? fallback(game.getTutorialHu(), game.getTutorialEn())
                : fallback(game.getTutorialEn(), game.getTutorialHu());
    }

    // locale check
    private boolean isHungarian(Locale locale) {
        return locale != null && "hu".equalsIgnoreCase(locale.getLanguage());
    }

    // fallback text
    private String fallback(String preferred, String secondary) {
        if (preferred != null && !preferred.isBlank()) {
            return preferred;
        }
        return secondary == null ? "" : secondary;
    }

    // html bridge
    private String withGameverseBridge(String html, Game game, Locale locale) {
        String localeCode = resolveLocaleCode(locale);
        String gameContextJson = buildGameContextJson(game, locale, localeCode);
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

    // locale code
    private String resolveLocaleCode(Locale locale) {
        return locale != null && "en".equalsIgnoreCase(locale.getLanguage()) ? "en" : "hu";
    }

    // game context
    private String buildGameContextJson(Game game, Locale locale, String localeCode) {
        String translations = resolveHtmlTranslations(game, localeCode);
        String title = resolveTitle(game, locale);

        try {
            return objectMapper.writeValueAsString(java.util.Map.of(
                    "locale", localeCode,
                    "translations", objectMapper.readTree(translations),
                    "game", java.util.Map.of(
                            "slug", fallback(game.getSlug(), ""),
                            "title", fallback(title, "")
                    )
            )).replace("</", "<\\/");
        } catch (Exception e) {
            return "{\"locale\":\"" + localeCode + "\",\"translations\":{},\"game\":{\"slug\":\"" + escapeJson(fallback(game.getSlug(), "")) + "\",\"title\":\"" + escapeJson(fallback(title, "")) + "\"}}";
        }
    }

    // html text
    private String resolveHtmlTranslations(Game game, String localeCode) {
        String preferred = "en".equalsIgnoreCase(localeCode)
                ? fallback(game.getHtmlTranslationsEn(), game.getHtmlTranslationsHu())
                : fallback(game.getHtmlTranslationsHu(), game.getHtmlTranslationsEn());
        return normalizeTranslationsForResponse(preferred);
    }

    // json normalize
    private String normalizeTranslationsForResponse(String value) {
        if (value == null || value.isBlank()) {
            return "{}";
        }
        try {
            return objectMapper.writeValueAsString(objectMapper.readTree(value)).replace("</", "<\\/");
        } catch (Exception e) {
            return "{}";
        }
    }

    // json escape
    private String escapeJson(String value) {
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("</", "<\\/");
    }
}
