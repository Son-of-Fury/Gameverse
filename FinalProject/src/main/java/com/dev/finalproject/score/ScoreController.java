package com.dev.finalproject.score;

import com.dev.finalproject.auth.security.AuthUser;
import com.dev.finalproject.i18n.LocalizationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ScoreController {
    private final ScoreService scoreService;
    private final LocalizationService localizationService;

    public ScoreController(ScoreService scoreService, LocalizationService localizationService) {
        this.scoreService = scoreService;
        this.localizationService = localizationService;
    }

    @PostMapping("/scores")
    public Map<String, String> save(@AuthUser Long userId, @Valid @RequestBody ScoreRequest req) {
        scoreService.saveScore(userId, req.getGameId(), req.getScore());
        return Map.of("message", localizationService.get("score.saved"));
    }

    @GetMapping("/scores/leaderboard/{gameId}")
    public List<LeaderboardRow> leaderboard(@PathVariable Long gameId,
                                            @RequestParam(defaultValue = "10") int limit) {
        return scoreService.top(gameId, Math.max(1, Math.min(limit, 100)));
    }
}
