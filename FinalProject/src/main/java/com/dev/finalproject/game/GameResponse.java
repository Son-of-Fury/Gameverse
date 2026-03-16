package com.dev.finalproject.game;

public record GameResponse(
        Long id,
        String slug,
        String title,
        String description,
        String imageUrl,
        String tutorial,
        String embedUrl,
        boolean active,
        String sourceType,
        long likeCount,
        String reviewStatus
) {}
