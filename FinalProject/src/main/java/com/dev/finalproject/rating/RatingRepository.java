package com.dev.finalproject.rating;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {
    Optional<Rating> findByUserIdAndGameId(Long userId, Long gameId);
    long countByGameIdAndValue(Long gameId, Rating.Value value);
}
