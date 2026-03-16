package com.dev.finalproject.game;

public record AdminGameDetailsResponse(
        Long id,
        String slug,
        String titleHu,
        String titleEn,
        String descriptionHu,
        String descriptionEn,
        String tutorialHu,
        String tutorialEn,
        String imageUrl,
        String sourceType,
        String externalUrl,
        String htmlCode,
        String htmlTranslationsHu,
        String htmlTranslationsEn,
        boolean active,
        String reviewStatus
) {}
