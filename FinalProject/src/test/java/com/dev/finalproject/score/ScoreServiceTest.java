package com.dev.finalproject.score;

import com.dev.finalproject.game.Game;
import com.dev.finalproject.game.GameRepository;
import com.dev.finalproject.i18n.LocalizationService;
import com.dev.finalproject.user.User;
import com.dev.finalproject.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScoreServiceTest {

    @Mock
    private ScoreRepository scoreRepository;
    @Mock
    private GameRepository gameRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private LocalizationService localizationService;

    private ScoreService scoreService;

    @BeforeEach
    void setUp() {
        scoreService = new ScoreService(scoreRepository, gameRepository, userRepository, localizationService);
        lenient().when(localizationService.get(anyString())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void saveScorePersistsScoreForExistingGameAndUser() {
        Game game = new Game();
        ReflectionTestUtils.setField(game, "id", 3L);
        User user = new User("Player", "player@example.com", "hash");
        ReflectionTestUtils.setField(user, "id", 9L);
        when(gameRepository.findById(3L)).thenReturn(Optional.of(game));
        when(userRepository.findById(9L)).thenReturn(Optional.of(user));

        scoreService.saveScore(9L, 3L, 42);

        ArgumentCaptor<Score> captor = ArgumentCaptor.forClass(Score.class);
        verify(scoreRepository).save(captor.capture());
        assertEquals(42, captor.getValue().getValue());
        assertSame(game, captor.getValue().getGame());
        assertSame(user, captor.getValue().getUser());
    }

    @Test
    void topLimitsAndMapsLeaderboardRows() {
        Game game = new Game();
        User first = new User("Alice", "alice@example.com", "hash");
        User second = new User("Bob", "bob@example.com", "hash");

        Score score1 = new Score(game, first, 120);
        Score score2 = new Score(game, second, 90);
        ReflectionTestUtils.setField(score1, "createdAt", Instant.parse("2026-03-12T10:00:00Z"));
        ReflectionTestUtils.setField(score2, "createdAt", Instant.parse("2026-03-12T11:00:00Z"));

        when(scoreRepository.leaderboard(5L)).thenReturn(List.of(score1, score2));

        List<LeaderboardRow> rows = scoreService.top(5L, 1);

        assertEquals(1, rows.size());
        assertEquals("Alice", rows.get(0).getUsername());
        assertEquals(120, rows.get(0).getScore());
    }
}
