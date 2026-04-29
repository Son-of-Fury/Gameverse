package com.dev.finalproject.game.support;

import com.dev.finalproject.game.Game;
import com.dev.finalproject.game.GameRepository;
import com.dev.finalproject.game.GameReviewStatus;
import com.dev.finalproject.game.GameSourceType;
import com.dev.finalproject.game.dto.AdminGameRequest;
import com.dev.finalproject.game.dto.GameStatusRequest;
import com.dev.finalproject.i18n.LocalizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.text.Normalizer;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class AdminGameMutationService {
    private final GameRepository gameRepository;
    private final LocalizationService localizationService;
    private final Map<GameSourceType, GameSourceHandler> sourceHandlers;

    @Autowired
    public AdminGameMutationService(
            GameRepository gameRepository,
            LocalizationService localizationService,
            List<GameSourceHandler> sourceHandlers
    ) {
        this.gameRepository = gameRepository;
        this.localizationService = localizationService;
        this.sourceHandlers = toSourceHandlerMap(sourceHandlers);
    }

    public AdminGameMutationService(GameRepository gameRepository, LocalizationService localizationService, ObjectMapper objectMapper) {
        this(
                gameRepository,
                localizationService,
                List.of(
                        new EmbedUrlGameSourceHandler(localizationService),
                        new InlineHtmlGameSourceHandler(localizationService, objectMapper)
                )
        );
    }

    public void createGame(Game game, AdminGameRequest req) {
        String title = applyGameRequest(game, req);
        game.setSlug(buildUniqueSlug(req.slug, title));
        game.setActive(false);
        game.setReviewStatus(GameReviewStatus.PENDING);
        validateSource(game);
    }

    public void updateGame(Game game, AdminGameRequest req) {
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

    public GameReviewStatus updateStatus(Game game, GameStatusRequest req) {
        GameReviewStatus nextStatus = parseReviewStatus(req == null ? null : req.status);
        game.setReviewStatus(nextStatus);
        game.setActive(nextStatus == GameReviewStatus.PUBLISHED);
        return nextStatus;
    }

    public String messageKeyForStatus(GameReviewStatus status) {
        return switch (status) {
            case PUBLISHED -> "admin.gamePublished";
            case WITHDRAWN -> "admin.gameWithdrawn";
            case NEEDS_CHANGES -> "admin.gameNeedsChanges";
            default -> "admin.gameUpdated";
        };
    }

    private void validateSource(Game game) {
        resolveSourceHandler(game.getSourceType()).validate(game);
    }

    private GameSourceType parseSourceType(String value) {
        try {
            return value == null ? GameSourceType.EMBED_URL : GameSourceType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return GameSourceType.EMBED_URL;
        }
    }

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
        resolveSourceHandler(sourceType).apply(game, req);
        return title;
    }

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

    private String slugify(String value) {
        String normalized = Normalizer.normalize(Objects.requireNonNullElse(value, ""), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("[^A-Za-z0-9]+", "-")
                .replaceAll("-{2,}", "-")
                .replaceAll("^-|-$", "")
                .toLowerCase();
        return normalized.isBlank() ? "game" : normalized;
    }

    private String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private GameSourceHandler resolveSourceHandler(GameSourceType sourceType) {
        GameSourceHandler handler = sourceHandlers.get(sourceType);
        if (handler != null) {
            return handler;
        }
        throw new IllegalArgumentException(localizationService.get("admin.invalidGameSourceType"));
    }

    private String fallback(String preferred, String secondary) {
        if (preferred != null && !preferred.isBlank()) {
            return preferred;
        }
        return secondary == null ? "" : secondary;
    }

    private Map<GameSourceType, GameSourceHandler> toSourceHandlerMap(List<GameSourceHandler> handlers) {
        EnumMap<GameSourceType, GameSourceHandler> handlerMap = new EnumMap<>(GameSourceType.class);
        for (GameSourceHandler handler : handlers) {
            handlerMap.put(handler.sourceType(), handler);
        }
        return handlerMap;
    }
}
