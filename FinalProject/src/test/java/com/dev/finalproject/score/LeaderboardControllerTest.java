package com.dev.finalproject.score;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LeaderboardControllerTest {

    @Mock
    private ScoreService scoreService;

    private LeaderboardController controller;

    @BeforeEach
    void setUp() {
        controller = new LeaderboardController(scoreService);
    }

    @Test
    void globalReturnsServicePayload() {
        when(scoreService.globalLeaderboard()).thenReturn(List.of(new LeaderboardRow("Alice", "Snake", 100, Instant.now())));

        List<LeaderboardRow> result = controller.global();

        assertEquals(1, result.size());
        verify(scoreService).globalLeaderboard();
    }

    @Test
    void byGameReturnsServicePayload() {
        when(scoreService.leaderboardByGame(2L)).thenReturn(List.of(new LeaderboardRow("Bob", "Flappy Bird", 50, Instant.now())));

        List<LeaderboardRow> result = controller.byGame(2L);

        assertEquals(1, result.size());
        verify(scoreService).leaderboardByGame(2L);
    }
}
