package com.dev.finalproject.rating;

import com.dev.finalproject.auth.security.AuthUser;
import com.dev.finalproject.game.Game;
import com.dev.finalproject.game.GameRepository;
import com.dev.finalproject.i18n.LocalizationService;
import com.dev.finalproject.user.User;
import com.dev.finalproject.user.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/games")
public class RatingController {
    private final RatingRepository ratingRepository;
    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final LocalizationService localizationService;

    public RatingController(RatingRepository ratingRepository, GameRepository gameRepository, UserRepository userRepository, LocalizationService localizationService) {
        this.ratingRepository = ratingRepository;
        this.gameRepository = gameRepository;
        this.userRepository = userRepository;
        this.localizationService = localizationService;
    }

    @PostMapping("/{gameId}/like")
    public Map<String, Object> like(@AuthUser Long userId, @PathVariable Long gameId) {
        upsert(userId, gameId, Rating.Value.LIKE);
        return counts(gameId);
    }

    @PostMapping("/{gameId}/dislike")
    public Map<String, Object> dislike(@AuthUser Long userId, @PathVariable Long gameId) {
        upsert(userId, gameId, Rating.Value.DISLIKE);
        return counts(gameId);
    }

    private void upsert(Long userId, Long gameId, Rating.Value value) {
        Game game = gameRepository.findById(gameId).orElseThrow(() -> new RuntimeException(localizationService.get("game.notFound")));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException(localizationService.get("user.notFound")));

        Rating rating = ratingRepository.findByUserIdAndGameId(userId, gameId)
                .orElseGet(() -> new Rating(user, game, value));

        rating.setValue(value);
        ratingRepository.save(rating);
    }

    private Map<String, Object> counts(Long gameId) {
        long likes = ratingRepository.countByGameIdAndValue(gameId, Rating.Value.LIKE);
        long dislikes = ratingRepository.countByGameIdAndValue(gameId, Rating.Value.DISLIKE);
        return Map.of("likes", likes, "dislikes", dislikes);
    }
}
