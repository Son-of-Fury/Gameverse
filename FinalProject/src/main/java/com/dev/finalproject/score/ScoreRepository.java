package com.dev.finalproject.score;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ScoreRepository extends JpaRepository<Score, Long> {
    void deleteByUserId(Long userId);

    @Query("""
        select s from Score s
        where s.game.id = :gameId
        order by s.value desc, s.createdAt asc
    """)
    List<Score> leaderboard(@Param("gameId") Long gameId);

    @Query("""
        select s from Score s
        where s.user.id = :userId and s.game.id = :gameId
        order by s.value desc, s.createdAt asc
    """)
    List<Score> bestForUser(@Param("userId") Long userId, @Param("gameId") Long gameId);

    @Query("""
        select new com.dev.finalproject.score.LeaderboardRow(s.user.username, coalesce(s.game.titleHu, s.game.titleEn), s.value, s.createdAt)
        from Score s
        where s.id in (
            select max(s2.id) 
            from Score s2 
            where s2.value = (
                select max(s3.value) 
                from Score s3 
                where s3.user.id = s2.user.id and s3.game.id = s2.game.id
            )
            group by s2.user.id, s2.game.id
        )
        order by s.value desc
    """)
    List<LeaderboardRow> globalLeaderboard();

    @Query("""
        select new com.dev.finalproject.score.LeaderboardRow(s.user.username, coalesce(s.game.titleHu, s.game.titleEn), s.value, s.createdAt)
        from Score s
        where s.game.id = :gameId and s.id in (
            select max(s2.id) 
            from Score s2 
            where s2.game.id = :gameId and s2.value = (
                select max(s3.value) 
                from Score s3 
                where s3.user.id = s2.user.id and s3.game.id = :gameId
            )
            group by s2.user.id
        )
        order by s.value desc
    """)
    List<LeaderboardRow> leaderboardByGame(@Param("gameId") Long gameId);
}
