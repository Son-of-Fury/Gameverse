package com.dev.finalproject.game.dto;

public record AdminGamePreviewResponse(
        GameResponse game,
        String inlineHtml
) {}
