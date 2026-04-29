package com.dev.finalproject.game.support;

import com.dev.finalproject.game.Game;
import com.dev.finalproject.game.GameSourceType;
import com.dev.finalproject.game.dto.AdminGameRequest;

public interface GameSourceHandler {
    GameSourceType sourceType();

    void apply(Game game, AdminGameRequest request);

    void validate(Game game);
}
