package com.dev.finalproject.auth.support;

import com.dev.finalproject.auth.dto.LoginRequest;
import com.dev.finalproject.auth.dto.RegisterRequest;
import com.dev.finalproject.auth.dto.UpdateProfileRequest;
import com.dev.finalproject.auth.security.AuthPrincipal;
import com.dev.finalproject.auth.security.JwtService;
import com.dev.finalproject.i18n.LocalizationService;
import com.dev.finalproject.user.User;
import com.dev.finalproject.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthAccountService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final LocalizationService localizationService;
    private final String adminEmail;
    private final String adminPassword;
    private final AuthPayloadFactory authPayloadFactory;
    private final AuthRequestNormalizer authRequestNormalizer;

    public AuthAccountService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            LocalizationService localizationService,
            @Value("${app.admin.email:admin@admin.com}") String adminEmail,
            @Value("${app.admin.password:admin}") String adminPassword,
            AuthPayloadFactory authPayloadFactory,
            AuthRequestNormalizer authRequestNormalizer
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.localizationService = localizationService;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.authPayloadFactory = authPayloadFactory;
        this.authRequestNormalizer = authRequestNormalizer;
    }

    public ResponseEntity<?> register(RegisterRequest req) {
        String normalizedEmail = authRequestNormalizer.normalizeEmail(req.email);
        if (authRequestNormalizer.isAdminEmail(adminEmail, normalizedEmail) || userRepository.existsByEmail(normalizedEmail)) {
            return conflict("auth.emailTaken");
        }

        User user = new User(req.username.trim(), normalizedEmail, passwordEncoder.encode(req.password));
        userRepository.save(user);

        return ResponseEntity.ok(authPayloadFactory.authenticationPayload(user, jwtService.generate(user.getId(), user.getEmail())));
    }

    public ResponseEntity<?> login(LoginRequest req) {
        String normalizedEmail = authRequestNormalizer.normalizeEmail(req.email);
        if (authRequestNormalizer.isAdminCredentials(adminEmail, adminPassword, normalizedEmail, req.password)) {
            return ResponseEntity.ok(authPayloadFactory.adminAuthenticationPayload(adminEmail, jwtService.generateAdmin(adminEmail)));
        }

        return userRepository.findByEmail(normalizedEmail)
                .filter(user -> passwordEncoder.matches(req.password, user.getPasswordHash()))
                .map(user -> ResponseEntity.ok(authPayloadFactory.authenticationPayload(user, jwtService.generate(user.getId(), user.getEmail()))))
                .orElseGet(() -> unauthorized("auth.invalidCredentials"));
    }

    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthPrincipal principal)) {
            return unauthorized("auth.unauthorized");
        }

        if (principal.isAdmin()) {
            return ResponseEntity.ok(authPayloadFactory.adminProfilePayload(adminEmail));
        }

        return userRepository.findById(principal.getUserId())
                .map(user -> ResponseEntity.ok(authPayloadFactory.profilePayload(user)))
                .orElseGet(() -> notFound("user.notFound"));
    }

    public ResponseEntity<?> updateProfile(Long userId, UpdateProfileRequest req) {
        return userRepository.findById(userId)
                .map(user -> {
                    String normalizedEmail = authRequestNormalizer.normalizeEmail(req.email);
                    if (userRepository.existsByEmailAndIdNot(normalizedEmail, userId)) {
                        return conflict("auth.emailTaken");
                    }

                    user.setUsername(req.username.trim());
                    user.setEmail(normalizedEmail);
                    user.setProfileImage(authRequestNormalizer.normalizeProfileImage(req.profileImage));

                    if (req.password != null && !req.password.isBlank()) {
                        user.setPassword(passwordEncoder.encode(req.password));
                    }

                    userRepository.save(user);

                    return ResponseEntity.ok(Map.of(
                            "message", localizationService.get("profile.updated"),
                            "userId", user.getId(),
                            "username", user.getUsername(),
                            "email", user.getEmail(),
                            "profileImage", authPayloadFactory.normalizeProfileImage(user.getProfileImage())
                    ));
                })
                .orElseGet(() -> notFound("user.notFound"));
    }

    private ResponseEntity<Map<String, Object>> unauthorized(String messageKey) {
        return ResponseEntity.status(401).body(Map.of("error", localizationService.get(messageKey)));
    }

    private ResponseEntity<Map<String, Object>> conflict(String messageKey) {
        return ResponseEntity.status(409).body(Map.of("error", localizationService.get(messageKey)));
    }

    private ResponseEntity<Map<String, Object>> notFound(String messageKey) {
        return ResponseEntity.status(404).body(Map.of("error", localizationService.get(messageKey)));
    }
}
