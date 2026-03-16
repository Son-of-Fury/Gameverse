package com.dev.finalproject.game;

public record AdminGamePreviewResponse(
        GameResponse game,
        String inlineHtml
) {}
