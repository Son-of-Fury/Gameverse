package com.dev.finalproject.auth.support;

import com.dev.finalproject.auth.dto.PasswordResetConfirmRequest;
import com.dev.finalproject.auth.dto.PasswordResetRequestPayload;
import com.dev.finalproject.i18n.LocalizationService;
import com.dev.finalproject.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class AuthPasswordResetService {
    private static final long RESET_TOKEN_TTL_SECONDS = 15 * 60;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final LocalizationService localizationService;
    private final boolean exposeResetToken;
    private final ResetTokenGenerator resetTokenGenerator;
    private final AuthRequestNormalizer authRequestNormalizer;

    public AuthPasswordResetService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            LocalizationService localizationService,
            @Value("${app.auth.exposeResetToken:true}") boolean exposeResetToken,
            ResetTokenGenerator resetTokenGenerator,
            AuthRequestNormalizer authRequestNormalizer
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.localizationService = localizationService;
        this.exposeResetToken = exposeResetToken;
        this.resetTokenGenerator = resetTokenGenerator;
        this.authRequestNormalizer = authRequestNormalizer;
    }

    public ResponseEntity<?> requestPasswordReset(PasswordResetRequestPayload req) {
        String email = authRequestNormalizer.normalizeEmail(req.email);
        String[] exposedToken = new String[1];

        userRepository.findByEmail(email).ifPresent(user -> {
            String resetToken = resetTokenGenerator.generateResetToken();
            user.setPasswordResetTokenHash(passwordEncoder.encode(resetToken));
            user.setPasswordResetTokenExpiresAt(Instant.now().plusSeconds(RESET_TOKEN_TTL_SECONDS));
            userRepository.save(user);
            exposedToken[0] = resetToken;
        });

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", localizationService.get("auth.passwordResetRequested"));

        if (exposeResetToken && exposedToken[0] != null) {
            response.put("resetToken", exposedToken[0]);
            response.put("resetTokenLabel", localizationService.get("auth.passwordResetTokenLabel"));
        }

        return ResponseEntity.ok(response);
    }

    public ResponseEntity<?> resetPassword(PasswordResetConfirmRequest request) {
        String email = authRequestNormalizer.normalizeEmail(request.email);
        String resetToken = request.resetToken.trim();

        return userRepository.findByEmail(email)
                .filter(user -> user.getPasswordResetTokenHash() != null)
                .filter(user -> user.getPasswordResetTokenExpiresAt() != null)
                .filter(user -> user.getPasswordResetTokenExpiresAt().isAfter(Instant.now()))
                .filter(user -> passwordEncoder.matches(resetToken, user.getPasswordResetTokenHash()))
                .map(user -> {
                    user.setPassword(passwordEncoder.encode(request.newPassword));
                    user.setPasswordResetTokenHash(null);
                    user.setPasswordResetTokenExpiresAt(null);
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of("message", localizationService.get("auth.passwordResetSuccess")));
                })
                .orElseGet(() -> ResponseEntity.status(400).body(Map.of("error", localizationService.get("auth.invalidResetToken"))));
    }
}
