package com.dev.finalproject.score;

import com.dev.finalproject.game.Game;
import com.dev.finalproject.game.GameRepository;
import com.dev.finalproject.i18n.LocalizationService;
import com.dev.finalproject.user.User;
import com.dev.finalproject.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
// score service
public class ScoreService {
    private final ScoreRepository scoreRepository;
    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final LocalizationService localizationService;

    public ScoreService(ScoreRepository scoreRepository, GameRepository gameRepository, UserRepository userRepository, LocalizationService localizationService) {
        this.scoreRepository = scoreRepository;
        this.gameRepository = gameRepository;
        this.userRepository = userRepository;
        this.localizationService = localizationService;
    }

    // save score
    public void saveScore(Long userId, Long gameId, int value) {
        Game game = gameRepository.findById(gameId).orElseThrow(() -> new RuntimeException(localizationService.get("game.notFound")));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException(localizationService.get("user.notFound")));
        scoreRepository.save(new Score(game, user, value));
    }

    // top rows
    public List<LeaderboardRow> top(Long gameId, int limit) {
        return scoreRepository.leaderboard(gameId).stream()
                .limit(limit)
                .map(s -> new LeaderboardRow(s.getUser().getUsername(), s.getValue(), s.getCreatedAt()))
                .toList();
    }

    // global rows
    public List<LeaderboardRow> globalLeaderboard() {
        return scoreRepository.globalLeaderboard();
    }

    // game rows
    public List<LeaderboardRow> leaderboardByGame(Long gameId) {
        return scoreRepository.leaderboardByGame(gameId);
    }
}
