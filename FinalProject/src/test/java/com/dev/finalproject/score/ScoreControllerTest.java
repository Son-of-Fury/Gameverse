package com.dev.finalproject.score;

import com.dev.finalproject.i18n.LocalizationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScoreControllerTest {

    @Mock
    private ScoreService scoreService;
    @Mock
    private LocalizationService localizationService;

    private ScoreController controller;

    @BeforeEach
    void setUp() {
        controller = new ScoreController(scoreService, localizationService);
        lenient().when(localizationService.get(anyString())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void saveDelegatesToServiceAndReturnsLocalizedMessage() {
        ScoreRequest request = new ScoreRequest();
        request.setGameId(5L);
        request.setScore(77);

        Map<String, String> response = controller.save(9L, request);

        verify(scoreService).saveScore(9L, 5L, 77);
        assertEquals("score.saved", response.get("message"));
    }

    @Test
    void leaderboardClampsLimitIntoValidRange() {
        LeaderboardRow row = new LeaderboardRow("Alice", 100, Instant.now());
        when(scoreService.top(3L, 100)).thenReturn(List.of(row));

        List<LeaderboardRow> response = controller.leaderboard(3L, 500);

        assertEquals(1, response.size());
        verify(scoreService).top(3L, 100);
    }
}
