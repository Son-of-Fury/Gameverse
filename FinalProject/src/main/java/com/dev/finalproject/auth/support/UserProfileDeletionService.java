package com.dev.finalproject.auth.support;

import com.dev.finalproject.i18n.LocalizationService;
import com.dev.finalproject.rating.RatingRepository;
import com.dev.finalproject.score.ScoreRepository;
import com.dev.finalproject.upload.ProfileImageUploadRepository;
import com.dev.finalproject.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class UserProfileDeletionService {
    private final UserRepository userRepository;
    private final ScoreRepository scoreRepository;
    private final RatingRepository ratingRepository;
    private final ProfileImageUploadRepository profileImageUploadRepository;
    private final LocalizationService localizationService;

    public UserProfileDeletionService(
            UserRepository userRepository,
            ScoreRepository scoreRepository,
            RatingRepository ratingRepository,
            ProfileImageUploadRepository profileImageUploadRepository,
            LocalizationService localizationService
    ) {
        this.userRepository = userRepository;
        this.scoreRepository = scoreRepository;
        this.ratingRepository = ratingRepository;
        this.profileImageUploadRepository = profileImageUploadRepository;
        this.localizationService = localizationService;
    }

    @Transactional
    public ResponseEntity<?> deleteProfile(Long userId) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(404).body(Map.of("error", localizationService.get("user.notFound")));
        }

        profileImageUploadRepository.deleteByUserId(userId);
        ratingRepository.deleteByUserId(userId);
        scoreRepository.deleteByUserId(userId);
        userRepository.deleteById(userId);

        return ResponseEntity.ok(Map.of("message", localizationService.get("profile.deleted")));
    }
}
