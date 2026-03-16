package com.dev.finalproject.game;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface GameRepository extends JpaRepository<Game, Long> {
    List<Game> findAllByOrderByIdAsc();
    List<Game> findAllByActiveTrueOrderByIdAsc();

    Optional<Game> findBySlug(String slug);
    Optional<Game> findBySlugAndActiveTrue(String slug);
}
