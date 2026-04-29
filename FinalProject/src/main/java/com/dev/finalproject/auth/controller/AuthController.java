package com.dev.finalproject.auth.controller;

import com.dev.finalproject.auth.dto.LoginRequest;
import com.dev.finalproject.auth.dto.PasswordResetConfirmRequest;
import com.dev.finalproject.auth.dto.PasswordResetRequestPayload;
import com.dev.finalproject.auth.dto.RegisterRequest;
import com.dev.finalproject.auth.dto.UpdateProfileRequest;
import com.dev.finalproject.auth.security.AuthPrincipal;
import com.dev.finalproject.auth.security.AuthUser;
import com.dev.finalproject.auth.security.JwtService;
import com.dev.finalproject.auth.support.AuthAccountService;
import com.dev.finalproject.auth.support.AuthPayloadFactory;
import com.dev.finalproject.auth.support.AuthPasswordResetService;
import com.dev.finalproject.auth.support.AuthRequestNormalizer;
import com.dev.finalproject.auth.support.ResetTokenGenerator;
import com.dev.finalproject.auth.support.UserProfileDeletionService;
import com.dev.finalproject.i18n.LocalizationService;
import com.dev.finalproject.upload.ProfileImageStorageService;
import com.dev.finalproject.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final ProfileImageStorageService profileImageStorageService;
    private final AuthAccountService authAccountService;
    private final AuthPasswordResetService authPasswordResetService;
    private final UserProfileDeletionService userProfileDeletionService;

    @Autowired
    public AuthController(
            ProfileImageStorageService profileImageStorageService,
            AuthAccountService authAccountService,
            AuthPasswordResetService authPasswordResetService,
            UserProfileDeletionService userProfileDeletionService
    ) {
        this.profileImageStorageService = profileImageStorageService;
        this.authAccountService = authAccountService;
        this.authPasswordResetService = authPasswordResetService;
        this.userProfileDeletionService = userProfileDeletionService;
    }

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            ProfileImageStorageService profileImageStorageService,
            LocalizationService localizationService,
            String adminEmail,
            String adminPassword,
            boolean exposeResetToken
    ) {
        this(
                profileImageStorageService,
                new AuthAccountService(
                        userRepository,
                        passwordEncoder,
                        jwtService,
                        localizationService,
                        adminEmail,
                        adminPassword,
                        new AuthPayloadFactory(),
                        new AuthRequestNormalizer()
                ),
                new AuthPasswordResetService(
                        userRepository,
                        passwordEncoder,
                        localizationService,
                        exposeResetToken,
                        new ResetTokenGenerator(),
                        new AuthRequestNormalizer()
                ),
                null
        );
    }

    public static class RegisterRequest extends com.dev.finalproject.auth.dto.RegisterRequest {}

    public static class LoginRequest extends com.dev.finalproject.auth.dto.LoginRequest {}

    public static class UpdateProfileRequest extends com.dev.finalproject.auth.dto.UpdateProfileRequest {}

    public static class PasswordResetRequestRequest extends PasswordResetRequestPayload {}

    public static class PasswordResetConfirmRequest extends com.dev.finalproject.auth.dto.PasswordResetConfirmRequest {}

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        return authAccountService.register(req);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        return authAccountService.login(req);
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return authAccountService.me(auth);
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@AuthUser Long userId, @Valid @RequestBody UpdateProfileRequest req) {
        return authAccountService.updateProfile(userId, req);
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteProfile(@AuthUser Long userId) {
        return userProfileDeletionService.deleteProfile(userId);
    }

    @PostMapping("/me/profile-image")
    public ResponseEntity<?> uploadProfileImage(@AuthUser Long userId, @RequestParam("file") MultipartFile file) throws IOException {
        try {
            return ResponseEntity.ok(profileImageStorageService.storeProfileImage(userId, file));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/request-password-reset")
    public ResponseEntity<?> requestPasswordReset(@Valid @RequestBody PasswordResetRequestPayload req) {
        return authPasswordResetService.requestPasswordReset(req);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody PasswordResetConfirmRequest request) {
        return authPasswordResetService.resetPassword(request);
    }
}
