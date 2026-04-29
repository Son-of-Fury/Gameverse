package com.dev.finalproject.score;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final ScoreService scoreService;

    public LeaderboardController(ScoreService scoreService) {
        this.scoreService = scoreService;
    }

    @GetMapping
    public List<LeaderboardRow> global() {
        return scoreService.globalLeaderboard();
    }

    @GetMapping("/{gameId}")
    public List<LeaderboardRow> byGame(@PathVariable Long gameId) {
        return scoreService.leaderboardByGame(gameId);
    }
}
