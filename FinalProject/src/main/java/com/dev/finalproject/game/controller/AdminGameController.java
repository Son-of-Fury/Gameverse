package com.dev.finalproject.game.controller;

import com.dev.finalproject.game.Game;
import com.dev.finalproject.game.GameRepository;
import com.dev.finalproject.game.GameReviewStatus;
import com.dev.finalproject.game.dto.AdminGameRequest;
import com.dev.finalproject.game.dto.GameResponse;
import com.dev.finalproject.game.dto.GameStatusRequest;
import com.dev.finalproject.game.support.AdminGameMutationService;
import com.dev.finalproject.game.support.AdminGameResponseFactory;
import com.dev.finalproject.i18n.LocalizationService;
import com.dev.finalproject.upload.GameImageStorageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import tools.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/admin/games")
public class AdminGameController {
    private final GameRepository gameRepository;
    private final GameController gameController;
    private final LocalizationService localizationService;
    private final GameImageStorageService gameImageStorageService;
    private final AdminGameMutationService adminGameMutationService;
    private final AdminGameResponseFactory adminGameResponseFactory;

    @Autowired
    public AdminGameController(
            GameRepository gameRepository,
            GameController gameController,
            LocalizationService localizationService,
            GameImageStorageService gameImageStorageService,
            AdminGameMutationService adminGameMutationService,
            AdminGameResponseFactory adminGameResponseFactory
    ) {
        this.gameRepository = gameRepository;
        this.gameController = gameController;
        this.localizationService = localizationService;
        this.gameImageStorageService = gameImageStorageService;
        this.adminGameMutationService = adminGameMutationService;
        this.adminGameResponseFactory = adminGameResponseFactory;
    }

    public AdminGameController(GameRepository gameRepository, GameController gameController, LocalizationService localizationService, GameImageStorageService gameImageStorageService, ObjectMapper objectMapper) {
        this(
                gameRepository,
                gameController,
                localizationService,
                gameImageStorageService,
                new AdminGameMutationService(gameRepository, localizationService, objectMapper),
                new AdminGameResponseFactory(gameController, localizationService)
        );
    }

    public static class AdminGameRequest extends com.dev.finalproject.game.dto.AdminGameRequest {}

    public static class GameStatusRequest extends com.dev.finalproject.game.dto.GameStatusRequest {}

    @GetMapping
    public List<GameResponse> list() {
        return gameRepository.findAllByOrderByIdAsc().stream()
                .map(gameController::toAdminResponse)
                .toList();
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<?> getDetails(@PathVariable Long gameId) {
        return gameRepository.findById(gameId)
                .<ResponseEntity<?>>map(game -> ResponseEntity.ok(gameController.toAdminDetailsResponse(game)))
                .orElseGet(adminGameResponseFactory::notFound);
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody AdminGameRequest req) {
        try {
            Game game = new Game();
            adminGameMutationService.createGame(game, req);
            gameRepository.save(game);
            return adminGameResponseFactory.success("admin.gameCreated", game);
        } catch (IllegalArgumentException e) {
            return adminGameResponseFactory.badRequest(e);
        }
    }

    @PutMapping("/{gameId}")
    public ResponseEntity<?> update(@PathVariable Long gameId, @Valid @RequestBody AdminGameRequest req) {
        return gameRepository.findById(gameId)
                .<ResponseEntity<?>>map(game -> {
                    try {
                        adminGameMutationService.updateGame(game, req);
                        gameRepository.save(game);
                        return adminGameResponseFactory.success("admin.gameUpdated", game);
                    } catch (IllegalArgumentException ex) {
                        return adminGameResponseFactory.badRequest(ex);
                    }
                })
                .orElseGet(adminGameResponseFactory::notFound);
    }

    @DeleteMapping("/{gameId}")
    public ResponseEntity<?> delete(@PathVariable Long gameId) {
        return gameRepository.findById(gameId)
                .<ResponseEntity<?>>map(game -> {
                    gameRepository.delete(game);
                    return ResponseEntity.ok(Map.of("message", localizationService.get("admin.gameDeleted")));
                })
                .orElseGet(adminGameResponseFactory::notFound);
    }

    @GetMapping("/{slug}/preview")
    public ResponseEntity<?> preview(@PathVariable String slug, Locale locale) {
        return gameRepository.findBySlug(slug)
                .<ResponseEntity<?>>map(game -> ResponseEntity.ok(gameController.toAdminPreviewResponse(game, locale)))
                .orElseGet(adminGameResponseFactory::notFound);
    }

    @PatchMapping("/{gameId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long gameId, @RequestBody GameStatusRequest req) {
        return gameRepository.findById(gameId)
                .<ResponseEntity<?>>map(game -> {
                    try {
                        GameReviewStatus nextStatus = adminGameMutationService.updateStatus(game, req);
                        gameRepository.save(game);
                        return adminGameResponseFactory.success(adminGameMutationService.messageKeyForStatus(nextStatus), game);
                    } catch (IllegalArgumentException ex) {
                        return adminGameResponseFactory.badRequest(ex);
                    }
                })
                .orElseGet(adminGameResponseFactory::notFound);
    }

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        try {
            return ResponseEntity.ok(gameImageStorageService.storeGameImage(file));
        } catch (IllegalArgumentException e) {
            return adminGameResponseFactory.badRequest(e);
        }
    }
}
