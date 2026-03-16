package com.dev.finalproject.score;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
// leaderboard api
public class LeaderboardController {

    private final ScoreService scoreService;

    public LeaderboardController(ScoreService scoreService) {
        this.scoreService = scoreService;
    }

    @GetMapping
    // global rows
    public List<LeaderboardRow> global() {
        return scoreService.globalLeaderboard();
    }

    @GetMapping("/{gameId}")
    // game rows
    public List<LeaderboardRow> byGame(@PathVariable Long gameId) {
        return scoreService.leaderboardByGame(gameId);
    }
}
