package com.dev.finalproject.score;

import java.time.Instant;

public class LeaderboardRow {
    private final String username;
    private final String gameTitle;
    private final int score;
    private final Instant createdAt;

    public LeaderboardRow(String username, String gameTitle, Number score, Instant createdAt) {
        this.username = username;
        this.gameTitle = gameTitle;
        this.score = score == null ? 0 : score.intValue();
        this.createdAt = createdAt;
    }

    public LeaderboardRow(String username, int score, Instant createdAt) {
        this.username = username;
        this.gameTitle = null;
        this.score = score;
        this.createdAt = createdAt;
    }

    public String getUsername() { return username; }
    public String getGameTitle() { return gameTitle; }
    public int getScore() { return score; }
    public Instant getCreatedAt() { return createdAt; }
}
