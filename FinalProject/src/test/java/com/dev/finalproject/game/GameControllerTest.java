package com.dev.finalproject.game;

import com.dev.finalproject.i18n.LocalizationService;
import com.dev.finalproject.rating.Rating;
import com.dev.finalproject.rating.RatingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import tools.jackson.databind.ObjectMapper;

import java.util.Locale;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GameControllerTest {

    @Mock
    private GameRepository gameRepository;
    @Mock
    private LocalizationService localizationService;
    @Mock
    private RatingRepository ratingRepository;

    private GameController controller;

    @BeforeEach
    void setUp() {
        controller = new GameController(gameRepository, localizationService, ratingRepository, new ObjectMapper());
        lenient().when(localizationService.get(anyString())).thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(ratingRepository.countByGameIdAndValue(anyLong(), org.mockito.ArgumentMatchers.eq(Rating.Value.LIKE))).thenReturn(5L);
    }

    @Test
    void getReturnsLocalizedHungarianFields() {
        Game game = new Game();
        ReflectionTestUtils.setField(game, "id", 7L);
        game.setSlug("snake");
        game.setTitleHu("Kigyo");
        game.setTitleEn("Snake");
        game.setDescriptionHu("Magyar leiras");
        game.setDescriptionEn("English description");
        game.setTutorialHu("Magyar tutorial");
        game.setTutorialEn("English tutorial");
        game.setImageUrl("/img/snake.png");
        game.setSourceType(GameSourceType.EMBED_URL);
        game.setEmbedUrl("https://example.com/snake");
        game.setActive(true);
        when(gameRepository.findBySlugAndActiveTrue("snake")).thenReturn(Optional.of(game));

        GameResponse response = controller.get("snake", Locale.forLanguageTag("hu"));

        assertEquals("Kigyo", response.title());
        assertEquals("Magyar leiras", response.description());
        assertEquals("Magyar tutorial", response.tutorial());
        assertEquals("https://example.com/snake", response.embedUrl());
        assertEquals(5L, response.likeCount());
    }

    @Test
    void playInjectsGameverseContextBeforeGameScripts() {
        Game game = new Game();
        game.setSlug("inline-game");
        game.setTitleHu("Beepitett");
        game.setTitleEn("Inline");
        game.setSourceType(GameSourceType.INLINE_HTML);
        game.setHtmlTranslationsHu("{\"start\":\"Inditas\"}");
        game.setHtmlTranslationsEn("{\"start\":\"Start\"}");
        game.setHtmlCode("<html><head></head><body><script>window.__appStarted = !!window.GameverseContext;</script></body></html>");
        when(gameRepository.findBySlugAndActiveTrue("inline-game")).thenReturn(Optional.of(game));

        ResponseEntity<String> response = controller.play("inline-game", Locale.forLanguageTag("hu"));

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().contains("window.GameverseContext"));
        assertTrue(response.getBody().contains("\"locale\":\"hu\""));
        assertTrue(response.getBody().indexOf("window.GameverseContext") < response.getBody().indexOf("window.__appStarted"));
    }
}
