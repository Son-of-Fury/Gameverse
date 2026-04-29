package com.dev.finalproject.game.support;

import com.dev.finalproject.game.Game;
import com.dev.finalproject.game.GameSourceType;
import com.dev.finalproject.game.dto.AdminGameRequest;
import com.dev.finalproject.i18n.LocalizationService;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Component
public class InlineHtmlGameSourceHandler implements GameSourceHandler {
    private final LocalizationService localizationService;
    private final ObjectMapper objectMapper;

    public InlineHtmlGameSourceHandler(LocalizationService localizationService, ObjectMapper objectMapper) {
        this.localizationService = localizationService;
        this.objectMapper = objectMapper;
    }

    @Override
    public GameSourceType sourceType() {
        return GameSourceType.INLINE_HTML;
    }

    @Override
    public void apply(Game game, AdminGameRequest request) {
        game.setEmbedUrl(null);
        game.setHtmlCode(trimToNull(request.htmlCode));
        game.setHtmlTranslationsHu(normalizeTranslations(request.htmlTranslationsHu));
        game.setHtmlTranslationsEn(normalizeTranslations(request.htmlTranslationsEn));
    }

    @Override
    public void validate(Game game) {
        if (isBlank(game.getHtmlCode())) {
            throw new IllegalArgumentException(localizationService.get("admin.gameMissingHtml"));
        }
    }

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
        } catch (IllegalArgumentException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new IllegalArgumentException(localizationService.get("admin.gameInvalidTranslations"));
        }
    }

    private String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private String trimToNull(String value) {
        String trimmed = trimToEmpty(value);
        return trimmed.isBlank() ? null : trimmed;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
