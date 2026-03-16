package com.dev.finalproject.game;

import jakarta.persistence.*;

@Entity
@Table(name = "games", indexes = {
        @Index(name = "idx_games_slug", columnList = "slug", unique = true)
})
public class Game {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80, unique = true)
    private String slug;

    @Column(length = 120)
    private String titleHu;

    @Column(length = 120)
    private String titleEn;

    @Column(length = 500)
    private String descriptionHu;

    @Column(length = 500)
    private String descriptionEn;

    @Column(length = 500)
    private String imageUrl;

    @Lob
    private String tutorialHu;

    @Lob
    private String tutorialEn;

    @Column(length = 300)
    private String embedUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GameSourceType sourceType = GameSourceType.EMBED_URL;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private GameReviewStatus reviewStatus = GameReviewStatus.PENDING;

    @Lob
    private String htmlCode;

    @Lob
    private String htmlTranslationsHu;

    @Lob
    private String htmlTranslationsEn;

    @Column(nullable = false)
    private boolean active = true;

    public Game() {}

    public Long getId() { return id; }
    public String getSlug() { return slug; }
    public String getTitleHu() { return titleHu; }
    public String getTitleEn() { return titleEn; }
    public String getDescriptionHu() { return descriptionHu; }
    public String getDescriptionEn() { return descriptionEn; }
    public String getImageUrl() { return imageUrl; }
    public String getTutorialHu() { return tutorialHu; }
    public String getTutorialEn() { return tutorialEn; }
    public String getEmbedUrl() { return embedUrl; }
    public GameSourceType getSourceType() { return sourceType; }
    public GameReviewStatus getReviewStatus() { return reviewStatus; }
    public String getHtmlCode() { return htmlCode; }
    public String getHtmlTranslationsHu() { return htmlTranslationsHu; }
    public String getHtmlTranslationsEn() { return htmlTranslationsEn; }
    public boolean isActive() { return active; }

    public void setSlug(String slug) { this.slug = slug; }
    public void setTitleHu(String titleHu) { this.titleHu = titleHu; }
    public void setTitleEn(String titleEn) { this.titleEn = titleEn; }
    public void setDescriptionHu(String descriptionHu) { this.descriptionHu = descriptionHu; }
    public void setDescriptionEn(String descriptionEn) { this.descriptionEn = descriptionEn; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setTutorialHu(String tutorialHu) { this.tutorialHu = tutorialHu; }
    public void setTutorialEn(String tutorialEn) { this.tutorialEn = tutorialEn; }
    public void setEmbedUrl(String embedUrl) { this.embedUrl = embedUrl; }
    public void setSourceType(GameSourceType sourceType) { this.sourceType = sourceType; }
    public void setReviewStatus(GameReviewStatus reviewStatus) { this.reviewStatus = reviewStatus; }
    public void setHtmlCode(String htmlCode) { this.htmlCode = htmlCode; }
    public void setHtmlTranslationsHu(String htmlTranslationsHu) { this.htmlTranslationsHu = htmlTranslationsHu; }
    public void setHtmlTranslationsEn(String htmlTranslationsEn) { this.htmlTranslationsEn = htmlTranslationsEn; }
    public void setActive(boolean active) { this.active = active; }
}
