package com.dev.finalproject.game.controller;

import com.dev.finalproject.game.Game;
import com.dev.finalproject.game.GameRepository;
import com.dev.finalproject.game.dto.GameResponse;
import com.dev.finalproject.i18n.LocalizationService;
import com.dev.finalproject.upload.GameImageStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminGameControllerTest {

    @Mock
    private GameRepository gameRepository;
    @Mock
    private GameController gameController;
    @Mock
    private LocalizationService localizationService;
    @Mock
    private GameImageStorageService gameImageStorageService;

    private AdminGameController controller;

    @BeforeEach
    void setUp() {
        controller = new AdminGameController(
                gameRepository,
                gameController,
                localizationService,
                gameImageStorageService,
                new ObjectMapper()
        );
        lenient().when(localizationService.get(anyString())).thenAnswer(invocation -> invocation.getArgument(0));
        lenient().when(gameController.toAdminResponse(any(Game.class))).thenAnswer(invocation -> {
            Game game = invocation.getArgument(0);
            return new GameResponse(game.getId(), game.getSlug(), game.getTitleHu(), game.getDescriptionHu(), game.getImageUrl(), game.getTutorialHu(), game.getEmbedUrl(), game.isActive(), game.getSourceType().name(), 0L, 0L, String.valueOf(game.getReviewStatus()));
        });
    }

    @Test
    void createRejectsNonObjectTranslationsJson() {
        AdminGameController.AdminGameRequest request = new AdminGameController.AdminGameRequest();
        request.titleHu = "Teszt jatek";
        request.sourceType = "INLINE_HTML";
        request.htmlCode = "<html></html>";
        request.htmlTranslationsHu = "[]";
        request.htmlTranslationsEn = "{}";

        ResponseEntity<?> response = controller.create(request);

        assertEquals(400, response.getStatusCode().value());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertNotNull(body);
        assertEquals("admin.gameInvalidTranslations", body.get("error"));
    }

    @Test
    void createNormalizesInlineTranslationsAndSetsPendingStatus() {
        when(gameRepository.findBySlug("inline-teszt")).thenReturn(Optional.empty());

        AdminGameController.AdminGameRequest request = new AdminGameController.AdminGameRequest();
        request.titleHu = "Inline teszt";
        request.slug = "inline-teszt";
        request.sourceType = "INLINE_HTML";
        request.htmlCode = "<html></html>";
        request.htmlTranslationsHu = "{ \"start\" : \"Inditas\" }";
        request.htmlTranslationsEn = "{ \"start\" : \"Start\" }";

        ResponseEntity<?> response = controller.create(request);

        assertEquals(200, response.getStatusCode().value());
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertEquals("admin.gameCreated", body.get("message"));
        verify(gameRepository).save(any(Game.class));
        GameResponse saved = (GameResponse) body.get("game");
        assertEquals("PENDING", saved.reviewStatus());
        assertFalse(saved.active());
    }
}
