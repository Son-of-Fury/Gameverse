package com.dev.finalproject.game.controller;

import com.dev.finalproject.game.Game;
import com.dev.finalproject.game.GameRepository;
import com.dev.finalproject.game.GameSourceType;
import com.dev.finalproject.game.dto.AdminGameDetailsResponse;
import com.dev.finalproject.game.dto.AdminGamePreviewResponse;
import com.dev.finalproject.game.dto.GameResponse;
import com.dev.finalproject.i18n.LocalizationService;
import com.dev.finalproject.rating.Rating;
import com.dev.finalproject.rating.RatingRepository;
import com.dev.finalproject.game.support.GameBridgeService;
import com.dev.finalproject.game.support.GameTextSupport;
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
public class GameController {
    private final GameRepository gameRepository;
    private final LocalizationService localizationService;
    private final RatingRepository ratingRepository;
    private final GameTextSupport gameTextSupport;
    private final GameBridgeService gameBridgeService;

    public GameController(GameRepository gameRepository, LocalizationService localizationService, RatingRepository ratingRepository, ObjectMapper objectMapper) {
        this.gameRepository = gameRepository;
        this.localizationService = localizationService;
        this.ratingRepository = ratingRepository;
        this.gameTextSupport = new GameTextSupport();
        this.gameBridgeService = new GameBridgeService(objectMapper, gameTextSupport);
    }

    @GetMapping
    public List<GameResponse> list(Locale locale) {
        return gameRepository.findAllByActiveTrueOrderByIdAsc().stream()
                .map(game -> toResponse(game, locale))
                .toList();
    }

    @GetMapping("/{slug}")
    public GameResponse get(@PathVariable String slug, Locale locale) {
        return gameRepository.findBySlugAndActiveTrue(slug)
                .map(game -> toResponse(game, locale))
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, localizationService.get("game.notFound")));
    }

    @GetMapping(value = "/{slug}/play", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> play(@PathVariable String slug, Locale locale) {
        return gameRepository.findBySlugAndActiveTrue(slug)
                .filter(game -> game.getSourceType() == GameSourceType.INLINE_HTML)
                .map(game -> ResponseEntity.ok(gameBridgeService.withGameverseBridge(
                        gameTextSupport.fallback(game.getHtmlCode(), ""),
                        game,
                        locale,
                        resolveHtmlTranslations(game, gameTextSupport.resolveLocaleCode(locale))
                )))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private GameResponse toResponse(Game game, Locale locale) {
        return buildResponse(
                game,
                gameTextSupport.resolveTitle(game, locale),
                gameTextSupport.resolveDescription(game, locale),
                gameTextSupport.resolveTutorial(game, locale),
                gameTextSupport.resolvePlayUrl(game, false)
        );
    }

    public GameResponse toAdminResponse(Game game) {
        return buildResponse(
                game,
                gameTextSupport.fallback(game.getTitleHu(), game.getTitleEn()),
                gameTextSupport.fallback(game.getDescriptionHu(), game.getDescriptionEn()),
                gameTextSupport.fallback(game.getTutorialHu(), game.getTutorialEn()),
                gameTextSupport.resolvePlayUrl(game, false)
        );
    }

    public AdminGamePreviewResponse toAdminPreviewResponse(Game game, Locale locale) {
        GameResponse previewGame = buildResponse(
                game,
                gameTextSupport.resolveTitle(game, locale),
                gameTextSupport.resolveDescription(game, locale),
                gameTextSupport.resolveTutorial(game, locale),
                gameTextSupport.resolvePlayUrl(game, true)
        );
        String inlineHtml = game.getSourceType() == GameSourceType.INLINE_HTML
                ? gameBridgeService.withGameverseBridge(
                        gameTextSupport.fallback(game.getHtmlCode(), ""),
                        game,
                        locale,
                        resolveHtmlTranslations(game, gameTextSupport.resolveLocaleCode(locale))
                )
                : "";

        return new AdminGamePreviewResponse(previewGame, inlineHtml);
    }

    public AdminGameDetailsResponse toAdminDetailsResponse(Game game) {
        return new AdminGameDetailsResponse(
                game.getId(),
                game.getSlug(),
                gameTextSupport.fallback(game.getTitleHu(), game.getTitleEn()),
                gameTextSupport.fallback(game.getTitleEn(), game.getTitleHu()),
                gameTextSupport.fallback(game.getDescriptionHu(), game.getDescriptionEn()),
                gameTextSupport.fallback(game.getDescriptionEn(), game.getDescriptionHu()),
                gameTextSupport.fallback(game.getTutorialHu(), game.getTutorialEn()),
                gameTextSupport.fallback(game.getTutorialEn(), game.getTutorialHu()),
                gameTextSupport.fallback(game.getImageUrl(), ""),
                game.getSourceType().name(),
                gameTextSupport.fallback(game.getEmbedUrl(), ""),
                game.getHtmlCode() == null ? "" : game.getHtmlCode(),
                gameBridgeService.normalizeTranslationsForResponse(game.getHtmlTranslationsHu()),
                gameBridgeService.normalizeTranslationsForResponse(game.getHtmlTranslationsEn()),
                game.isActive(),
                gameTextSupport.resolveReviewStatus(game).name()
        );
    }

    private GameResponse buildResponse(Game game, String title, String description, String tutorial, String playUrl) {
        return new GameResponse(
                game.getId(),
                game.getSlug(),
                title,
                description,
                gameTextSupport.fallback(game.getImageUrl(), ""),
                tutorial,
                playUrl,
                game.isActive(),
                game.getSourceType().name(),
                ratingRepository.countByGameIdAndValue(game.getId(), Rating.Value.LIKE),
                ratingRepository.countByGameIdAndValue(game.getId(), Rating.Value.DISLIKE),
                gameTextSupport.resolveReviewStatus(game).name()
        );
    }

    private String resolveHtmlTranslations(Game game, String localeCode) {
        String preferred = "en".equalsIgnoreCase(localeCode)
                ? gameTextSupport.fallback(game.getHtmlTranslationsEn(), game.getHtmlTranslationsHu())
                : gameTextSupport.fallback(game.getHtmlTranslationsHu(), game.getHtmlTranslationsEn());
        return gameBridgeService.normalizeTranslationsForResponse(preferred);
    }
}
