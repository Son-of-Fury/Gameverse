package com.dev.finalproject.game.support;

import com.dev.finalproject.game.Game;
import com.dev.finalproject.game.controller.GameController;
import com.dev.finalproject.i18n.LocalizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AdminGameResponseFactory {
    private final GameController gameController;
    private final LocalizationService localizationService;

    public AdminGameResponseFactory(GameController gameController, LocalizationService localizationService) {
        this.gameController = gameController;
        this.localizationService = localizationService;
    }

    public ResponseEntity<?> success(String messageKey, Game game) {
        return ResponseEntity.ok(Map.of(
                "message", localizationService.get(messageKey),
                "game", gameController.toAdminResponse(game)
        ));
    }

    public ResponseEntity<?> badRequest(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
    }

    public ResponseEntity<?> notFound() {
        return ResponseEntity.status(404).body(Map.of("error", localizationService.get("game.notFound")));
    }
}
