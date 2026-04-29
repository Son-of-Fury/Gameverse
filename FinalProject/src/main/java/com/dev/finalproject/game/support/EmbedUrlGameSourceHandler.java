package com.dev.finalproject.game.support;

import com.dev.finalproject.game.Game;
import com.dev.finalproject.game.GameSourceType;
import com.dev.finalproject.game.dto.AdminGameRequest;
import com.dev.finalproject.i18n.LocalizationService;
import org.springframework.stereotype.Component;

@Component
public class EmbedUrlGameSourceHandler implements GameSourceHandler {
    private final LocalizationService localizationService;

    public EmbedUrlGameSourceHandler(LocalizationService localizationService) {
        this.localizationService = localizationService;
    }

    @Override
    public GameSourceType sourceType() {
        return GameSourceType.EMBED_URL;
    }

    @Override
    public void apply(Game game, AdminGameRequest request) {
        game.setEmbedUrl(trimToNull(request.externalUrl));
        game.setHtmlCode(null);
        game.setHtmlTranslationsHu(null);
        game.setHtmlTranslationsEn(null);
    }

    @Override
    public void validate(Game game) {
        if (isBlank(game.getEmbedUrl())) {
            throw new IllegalArgumentException(localizationService.get("admin.gameMissingUrl"));
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
