package com.dev.finalproject.score;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ScoreRequest {
    @NotNull
    private Long gameId;

    @Min(0)
    private int score;

    public Long getGameId() { return gameId; }
    public int getScore() { return score; }

    public void setGameId(Long gameId) { this.gameId = gameId; }
    public void setScore(int score) { this.score = score; }
}
