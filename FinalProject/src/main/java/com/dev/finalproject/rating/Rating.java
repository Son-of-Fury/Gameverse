package com.dev.finalproject.rating;

import com.dev.finalproject.game.Game;
import com.dev.finalproject.user.User;
import jakarta.persistence.*;

@Entity
@Table(name = "game_ratings",
        uniqueConstraints = @UniqueConstraint(name = "uq_rating_user_game", columnNames = {"user_id", "game_id"}))
public class Rating {

    public enum Value { LIKE, DISLIKE }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false) @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(optional = false) @JoinColumn(name = "game_id")
    private Game game;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Value value;

    public Rating() {}

    public Rating(User user, Game game, Value value) {
        this.user = user;
        this.game = game;
        this.value = value;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public Game getGame() { return game; }
    public Value getValue() { return value; }

    public void setUser(User user) { this.user = user; }
    public void setGame(Game game) { this.game = game; }
    public void setValue(Value value) { this.value = value; }
}
