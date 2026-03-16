package com.dev.finalproject.game;

import com.dev.finalproject.i18n.LocalizationService;
import com.dev.finalproject.upload.GameImageStorageService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.Normalizer;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.Objects;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/admin/games")
// admin games
public class AdminGameController {
    private final GameRepository gameRepository;
    private final GameController gameController;
    private final LocalizationService localizationService;
    private final GameImageStorageService gameImageStorageService;
    private final ObjectMapper objectMapper;

    public AdminGameController(GameRepository gameRepository, GameController gameController, LocalizationService localizationService, GameImageStorageService gameImageStorageService, ObjectMapper objectMapper) {
        this.gameRepository = gameRepository;
        this.gameController = gameController;
        this.localizationService = localizationService;
        this.gameImageStorageService = gameImageStorageService;
        this.objectMapper = objectMapper;
    }

    public static class AdminGameRequest {
        public String titleHu;
        public String titleEn;
        public String slug;
        public String descriptionHu;
        public String descriptionEn;
        public String tutorialHu;
        public String tutorialEn;
        public String imageUrl;
        public String sourceType;
        public String externalUrl;
        public String htmlCode;
        public String htmlTranslationsHu;
        public String htmlTranslationsEn;
        public Boolean active;
    }

    public static class GameStatusRequest {
        public String status;
    }

    @GetMapping
    // game list
    public List<GameResponse> list() {
        return gameRepository.findAllByOrderByIdAsc().stream()
                .map(gameController::toAdminResponse)
                .toList();
    }

    @GetMapping("/{gameId}")
    // game details
    public ResponseEntity<?> getDetails(@PathVariable Long gameId) {
        return gameRepository.findById(gameId)
                .<ResponseEntity<?>>map(game -> ResponseEntity.ok(gameController.toAdminDetailsResponse(game)))
                .orElseGet(() -> notFound());
    }

    @PostMapping
    // game create
    public ResponseEntity<?> create(@Valid @RequestBody AdminGameRequest req) {
        try {
            Game game = new Game();
            prepareNewGame(game, req);
            gameRepository.save(game);
            return success("admin.gameCreated", game);
        } catch (IllegalArgumentException e) {
            return badRequest(e);
        }
    }

    @PutMapping("/{gameId}")
    // game update
    public ResponseEntity<?> update(@PathVariable Long gameId, @Valid @RequestBody AdminGameRequest req) {
        return gameRepository.findById(gameId)
                .<ResponseEntity<?>>map(game -> {
                    try {
                        applyUpdate(game, req);
                        gameRepository.save(game);
                        return success("admin.gameUpdated", game);
                    } catch (IllegalArgumentException ex) {
                        return badRequest(ex);
                    }
                })
                .orElseGet(this::notFound);
    }

    @DeleteMapping("/{gameId}")
    // game delete
    public ResponseEntity<?> delete(@PathVariable Long gameId) {
        return gameRepository.findById(gameId)
                .<ResponseEntity<?>>map(game -> {
                    gameRepository.delete(game);
                    return ResponseEntity.ok(Map.of("message", localizationService.get("admin.gameDeleted")));
                })
                .orElseGet(this::notFound);
    }

    @GetMapping("/{slug}/preview")
    // game preview
    public ResponseEntity<?> preview(@PathVariable String slug, Locale locale) {
        return gameRepository.findBySlug(slug)
                .<ResponseEntity<?>>map(game -> ResponseEntity.ok(gameController.toAdminPreviewResponse(game, locale)))
                .orElseGet(this::notFound);
    }

    @PatchMapping("/{gameId}/status")
    // status update
    public ResponseEntity<?> updateStatus(@PathVariable Long gameId, @RequestBody GameStatusRequest req) {
        return gameRepository.findById(gameId)
                .<ResponseEntity<?>>map(game -> {
                    try {
                        GameReviewStatus nextStatus = applyStatusUpdate(game, req);
                        gameRepository.save(game);
                        return success(statusMessageKey(nextStatus), game);
                    } catch (IllegalArgumentException ex) {
                        return badRequest(ex);
                    }
                })
                .orElseGet(this::notFound);
    }

    @PostMapping("/image")
    // image upload
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        try {
            return ResponseEntity.ok(gameImageStorageService.storeGameImage(file));
        } catch (IllegalArgumentException e) {
            return badRequest(e);
        }
    }

    // new game
    private void prepareNewGame(Game game, AdminGameRequest req) {
        String title = applyGameRequest(game, req);
        game.setSlug(buildUniqueSlug(req.slug, title));
        game.setActive(false);
        game.setReviewStatus(GameReviewStatus.PENDING);
        validateSource(game);
    }

    // edit game
    private void applyUpdate(Game game, AdminGameRequest req) {
        String previousSlug = game.getSlug();
        String title = applyGameRequest(game, req);
        String requestedSlug = trimToEmpty(req.slug);
        if (!requestedSlug.isBlank() && !requestedSlug.equalsIgnoreCase(previousSlug)) {
            game.setSlug(buildUniqueSlug(requestedSlug, title));
        }
        game.setActive(false);
        game.setReviewStatus(GameReviewStatus.EDITED);
        validateSource(game);
    }

    // apply state
    private GameReviewStatus applyStatusUpdate(Game game, GameStatusRequest req) {
        GameReviewStatus nextStatus = parseReviewStatus(req == null ? null : req.status);
        game.setReviewStatus(nextStatus);
        game.setActive(nextStatus == GameReviewStatus.PUBLISHED);
        return nextStatus;
    }

    // status text
    private String statusMessageKey(GameReviewStatus status) {
        return switch (status) {
            case PUBLISHED -> "admin.gamePublished";
            case WITHDRAWN -> "admin.gameWithdrawn";
            case NEEDS_CHANGES -> "admin.gameNeedsChanges";
            default -> "admin.gameUpdated";
        };
    }

    // success body
    private ResponseEntity<?> success(String messageKey, Game game) {
        return ResponseEntity.ok(Map.of(
                "message", localizationService.get(messageKey),
                "game", gameController.toAdminResponse(game)
        ));
    }

    // request error
    private ResponseEntity<?> badRequest(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
    }

    // missing body
    private ResponseEntity<?> notFound() {
        return ResponseEntity.status(404).body(Map.of("error", localizationService.get("game.notFound")));
    }

    // source check
    private void validateSource(Game game) {
        if (game.getSourceType() == GameSourceType.EMBED_URL && isBlank(game.getEmbedUrl())) {
            throw new IllegalArgumentException(localizationService.get("admin.gameMissingUrl"));
        }
        if (game.getSourceType() == GameSourceType.INLINE_HTML && isBlank(game.getHtmlCode())) {
            throw new IllegalArgumentException(localizationService.get("admin.gameMissingHtml"));
        }
    }

    // source type
    private GameSourceType parseSourceType(String value) {
        try {
            return value == null ? GameSourceType.EMBED_URL : GameSourceType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return GameSourceType.EMBED_URL;
        }
    }

    // review status
    private GameReviewStatus parseReviewStatus(String value) {
        try {
            if (value == null || value.isBlank()) {
                throw new IllegalArgumentException(localizationService.get("admin.invalidGameStatus"));
            }
            return GameReviewStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(localizationService.get("admin.invalidGameStatus"));
        }
    }

    // form apply
    private String applyGameRequest(Game game, AdminGameRequest req) {
        String titleHu = trimToEmpty(req.titleHu);
        String titleEn = trimToEmpty(req.titleEn);
        String title = fallback(titleHu, titleEn);
        if (title.isBlank()) {
            throw new IllegalArgumentException(localizationService.get("admin.gameMissingTitle"));
        }

        GameSourceType sourceType = parseSourceType(req.sourceType);
        game.setTitleHu(titleHu);
        game.setTitleEn(titleEn);
        game.setDescriptionHu(trimToEmpty(req.descriptionHu));
        game.setDescriptionEn(trimToEmpty(req.descriptionEn));
        game.setTutorialHu(trimToEmpty(req.tutorialHu));
        game.setTutorialEn(trimToEmpty(req.tutorialEn));
        game.setImageUrl(trimToEmpty(req.imageUrl));
        game.setSourceType(sourceType);
        game.setEmbedUrl(sourceType == GameSourceType.EMBED_URL ? trimToNull(req.externalUrl) : null);
        game.setHtmlCode(sourceType == GameSourceType.INLINE_HTML ? trimToNull(req.htmlCode) : null);
        game.setHtmlTranslationsHu(sourceType == GameSourceType.INLINE_HTML ? normalizeTranslations(req.htmlTranslationsHu) : null);
        game.setHtmlTranslationsEn(sourceType == GameSourceType.INLINE_HTML ? normalizeTranslations(req.htmlTranslationsEn) : null);
        return title;
    }

    // json normalize
    private String normalizeTranslations(String value) {
        String trimmed = trimToEmpty(value);
        if (trimmed.isBlank()) {
            return "{}";
        }

        try {
            JsonNode json = objectMapper.readTree(trimmed);
            if (json == null || !json.isObject()) {
                throw new IllegalArgumentException(localizationService.get("admin.gameInvalidTranslations"));
            }
            return objectMapper.writeValueAsString(json);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException(localizationService.get("admin.gameInvalidTranslations"));
        }
    }

    // slug build
    private String buildUniqueSlug(String requestedSlug, String title) {
        String baseSlug = slugify(requestedSlug == null || requestedSlug.isBlank() ? title : requestedSlug);
        String nextSlug = baseSlug;
        int suffix = 2;
        while (gameRepository.findBySlug(nextSlug).isPresent()) {
            nextSlug = baseSlug + "-" + suffix;
            suffix++;
        }
        return nextSlug;
    }

    // slug text
    private String slugify(String value) {
        String normalized = Normalizer.normalize(Objects.requireNonNullElse(value, ""), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("[^A-Za-z0-9]+", "-")
                .replaceAll("-{2,}", "-")
                .replaceAll("^-|-$", "")
                .toLowerCase();
        return normalized.isBlank() ? "game" : normalized;
    }

    // empty text
    private String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    // null text
    private String trimToNull(String value) {
        String trimmed = trimToEmpty(value);
        return trimmed.isBlank() ? null : trimmed;
    }

    // blank check
    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    // text fallback
    private String fallback(String preferred, String secondary) {
        if (preferred != null && !preferred.isBlank()) {
            return preferred;
        }
        return secondary == null ? "" : secondary;
    }
}
