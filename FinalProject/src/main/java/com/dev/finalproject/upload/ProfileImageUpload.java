package com.dev.finalproject.upload;

import com.dev.finalproject.user.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "profile_image_uploads", indexes = {
        @Index(name = "idx_profile_image_uploads_user", columnList = "user_id")
})
public class ProfileImageUpload {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 255)
    private String originalFileName;

    @Column(nullable = false, length = 255, unique = true)
    private String storedFileName;

    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal sizeMb;

    @Column(nullable = false)
    private Long sizeBytes;

    @Column(nullable = false, updatable = false)
    private Instant uploadedAt;

    @PrePersist
    protected void onCreate() {
        uploadedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public String getStoredFileName() {
        return storedFileName;
    }

    public void setStoredFileName(String storedFileName) {
        this.storedFileName = storedFileName;
    }

    public BigDecimal getSizeMb() {
        return sizeMb;
    }

    public void setSizeMb(BigDecimal sizeMb) {
        this.sizeMb = sizeMb;
    }

    public Long getSizeBytes() {
        return sizeBytes;
    }

    public void setSizeBytes(Long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }

    public Instant getUploadedAt() {
        return uploadedAt;
    }
}
