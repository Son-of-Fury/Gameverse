package com.dev.finalproject.rating;

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

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RatingControllerTest {

    @Mock
    private RatingRepository ratingRepository;
    @Mock
    private GameRepository gameRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private LocalizationService localizationService;

    private RatingController controller;

    @BeforeEach
    void setUp() {
        controller = new RatingController(ratingRepository, gameRepository, userRepository, localizationService);
        lenient().when(localizationService.get(anyString())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void likeUpdatesExistingRatingAndReturnsCounts() {
        Game game = new Game();
        ReflectionTestUtils.setField(game, "id", 4L);
        User user = new User("Player", "player@example.com", "hash");
        ReflectionTestUtils.setField(user, "id", 12L);
        Rating existing = new Rating(user, game, Rating.Value.DISLIKE);

        when(gameRepository.findById(4L)).thenReturn(Optional.of(game));
        when(userRepository.findById(12L)).thenReturn(Optional.of(user));
        when(ratingRepository.findByUserIdAndGameId(12L, 4L)).thenReturn(Optional.of(existing));
        when(ratingRepository.countByGameIdAndValue(4L, Rating.Value.LIKE)).thenReturn(7L);
        when(ratingRepository.countByGameIdAndValue(4L, Rating.Value.DISLIKE)).thenReturn(2L);

        Map<String, Object> response = controller.like(12L, 4L);

        ArgumentCaptor<Rating> captor = ArgumentCaptor.forClass(Rating.class);
        verify(ratingRepository).save(captor.capture());
        assertEquals(Rating.Value.LIKE, captor.getValue().getValue());
        assertEquals(7L, response.get("likes"));
        assertEquals(2L, response.get("dislikes"));
    }
}
