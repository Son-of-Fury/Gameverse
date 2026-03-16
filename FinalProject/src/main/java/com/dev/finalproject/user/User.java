package com.dev.finalproject.user;

import jakarta.persistence.*;
import org.jspecify.annotations.Nullable;

import java.time.Instant;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_email", columnList = "email", unique = true)
})
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String username;

    @Column(nullable = false, length = 160, unique = true)
    private String email;

    @Column(nullable = false, length = 255)
    private String passwordHash;

    @Column(length = 500)
    private String profileImage;

    @Column(length = 255)
    private String passwordResetTokenHash;

    private Instant passwordResetTokenExpiresAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    public User() {}

    public User(String username, String email, String passwordHash) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getProfileImage() { return profileImage; }
    public String getPasswordResetTokenHash() { return passwordResetTokenHash; }
    public Instant getPasswordResetTokenExpiresAt() { return passwordResetTokenExpiresAt; }
    public Instant getCreatedAt() { return createdAt; }

    public void setUsername(String username) { this.username = username; }
    public void setEmail(String email) { this.email = email; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }
    public void setPasswordResetTokenHash(String passwordResetTokenHash) { this.passwordResetTokenHash = passwordResetTokenHash; }
    public void setPasswordResetTokenExpiresAt(Instant passwordResetTokenExpiresAt) { this.passwordResetTokenExpiresAt = passwordResetTokenExpiresAt; }

    public void setPassword(String password) {
        this.passwordHash = password;
    }
}
