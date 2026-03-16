package com.dev.finalproject.score;

import com.dev.finalproject.game.Game;
import com.dev.finalproject.user.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "scores", indexes = {
        @Index(name = "idx_scores_game", columnList = "game_id"),
        @Index(name = "idx_scores_user", columnList = "user_id")
})
public class Score {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false) @JoinColumn(name = "game_id")
    private Game game;

    @ManyToOne(optional = false) @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private int value;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public Score() {}

    public Score(Game game, User user, int value) {
        this.game = game;
        this.user = user;
        this.value = value;
    }

    public Long getId() { return id; }
    public Game getGame() { return game; }
    public User getUser() { return user; }
    public int getValue() { return value; }
    public Instant getCreatedAt() { return createdAt; }

    public void setGame(Game game) { this.game = game; }
    public void setUser(User user) { this.user = user; }
    public void setValue(int value) { this.value = value; }
}
