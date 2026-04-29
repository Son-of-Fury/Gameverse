package com.dev.finalproject.game.support;

import com.dev.finalproject.game.Game;
import com.dev.finalproject.game.GameReviewStatus;
import com.dev.finalproject.game.GameSourceType;

import java.util.Locale;

public class GameTextSupport {
    public GameReviewStatus resolveReviewStatus(Game game) {
        if (game.getReviewStatus() != null) {
            return game.getReviewStatus();
        }
        return game.isActive() ? GameReviewStatus.PUBLISHED : GameReviewStatus.PENDING;
    }

    public String resolvePlayUrl(Game game, boolean previewMode) {
        if (game.getSourceType() == GameSourceType.INLINE_HTML) {
            return previewMode ? "" : "/api/games/" + game.getSlug() + "/play";
        }
        return fallback(game.getEmbedUrl(), "");
    }

    public String resolveTitle(Game game, Locale locale) {
        return isHungarian(locale) ? fallback(game.getTitleHu(), game.getTitleEn()) : fallback(game.getTitleEn(), game.getTitleHu());
    }

    public String resolveDescription(Game game, Locale locale) {
        return isHungarian(locale) ? fallback(game.getDescriptionHu(), game.getDescriptionEn()) : fallback(game.getDescriptionEn(), game.getDescriptionHu());
    }

    public String resolveTutorial(Game game, Locale locale) {
        return isHungarian(locale) ? fallback(game.getTutorialHu(), game.getTutorialEn()) : fallback(game.getTutorialEn(), game.getTutorialHu());
    }

    public String fallback(String preferred, String secondary) {
        if (preferred != null && !preferred.isBlank()) {
            return preferred;
        }
        return secondary == null ? "" : secondary;
    }

    public String resolveLocaleCode(Locale locale) {
        return locale != null && "en".equalsIgnoreCase(locale.getLanguage()) ? "en" : "hu";
    }

    private boolean isHungarian(Locale locale) {
        return locale != null && "hu".equalsIgnoreCase(locale.getLanguage());
    }
}
