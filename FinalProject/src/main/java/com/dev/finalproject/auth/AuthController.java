package com.dev.finalproject.auth;

import com.dev.finalproject.i18n.LocalizationService;
import com.dev.finalproject.upload.ProfileImageStorageService;
import com.dev.finalproject.user.User;
import com.dev.finalproject.user.UserRepository;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import jakarta.validation.Valid;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
// auth api
public class AuthController {
    private static final String RESET_TOKEN_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int RESET_TOKEN_LENGTH = 8;
    private static final long RESET_TOKEN_TTL_SECONDS = 15 * 60;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ProfileImageStorageService profileImageStorageService;
    private final LocalizationService localizationService;
    private final String adminEmail;
    private final String adminPassword;
    private final boolean exposeResetToken;

    // auth setup
    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            ProfileImageStorageService profileImageStorageService,
            LocalizationService localizationService,
            @Value("${app.admin.email:admin@admin.com}") String adminEmail,
            @Value("${app.admin.password:admin}") String adminPassword,
            @Value("${app.auth.exposeResetToken:true}") boolean exposeResetToken
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.profileImageStorageService = profileImageStorageService;
        this.localizationService = localizationService;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.exposeResetToken = exposeResetToken;
    }

    public static class RegisterRequest {
        @NotBlank public String username;
        @Email @NotBlank public String email;
        @NotBlank public String password;
    }

    public static class LoginRequest {
        @Email @NotBlank public String email;
        @NotBlank public String password;
    }

    public static class UpdateProfileRequest {
        @NotBlank public String username;
        @Email @NotBlank public String email;
        public String password;
        public String profileImage;
    }

    public static class PasswordResetRequestRequest {
        @Email @NotBlank public String email;
    }

    public static class PasswordResetConfirmRequest {
        @Email @NotBlank public String email;
        @NotBlank public String resetToken;
        @NotBlank public String newPassword;
    }

    @PostMapping("/register")
    // register
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        String normalizedEmail = normalizeEmail(req.email);
        if (isAdminEmail(normalizedEmail) || userRepository.existsByEmail(normalizedEmail)) {
            return conflict("auth.emailTaken");
        }

        User user = new User(req.username.trim(), normalizedEmail, passwordEncoder.encode(req.password));
        userRepository.save(user);

        return ResponseEntity.ok(authenticationPayload(user, jwtService.generate(user.getId(), user.getEmail())));
    }

    @PostMapping("/login")
    // login
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        String normalizedEmail = normalizeEmail(req.email);
        if (isAdminCredentials(normalizedEmail, req.password)) {
            return ResponseEntity.ok(adminAuthenticationPayload(jwtService.generateAdmin(adminEmail)));
        }

        return userRepository.findByEmail(normalizedEmail)
                .filter(user -> passwordEncoder.matches(req.password, user.getPasswordHash()))
                .map(user -> ResponseEntity.ok(authenticationPayload(user, jwtService.generate(user.getId(), user.getEmail()))))
                .orElseGet(() -> unauthorized("auth.invalidCredentials"));
    }

    @GetMapping("/me")
    // profile
    public ResponseEntity<?> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthPrincipal principal)) {
            return unauthorized("auth.unauthorized");
        }

        if (principal.isAdmin()) {
            return ResponseEntity.ok(adminProfilePayload());
        }

        Long userId = principal.getUserId();
        return userRepository.findById(userId)
                .map(user -> ResponseEntity.ok(profilePayload(user)))
                .orElseGet(() -> notFound("user.notFound"));
    }

    @PutMapping("/me")
    // profile save
    public ResponseEntity<?> updateProfile(@AuthUser Long userId, @Valid @RequestBody UpdateProfileRequest req) {
        return userRepository.findById(userId)
                .map(user -> {
                    String normalizedEmail = normalizeEmail(req.email);
                    if (userRepository.existsByEmailAndIdNot(normalizedEmail, userId)) {
                        return conflict("auth.emailTaken");
                    }

                    user.setUsername(req.username.trim());
                    user.setEmail(normalizedEmail);
                    user.setProfileImage(normalizeProfileImage(req.profileImage));

                    if (req.password != null && !req.password.isBlank()) {
                        user.setPassword(passwordEncoder.encode(req.password));
                    }

                    userRepository.save(user);

                    return ResponseEntity.ok(Map.of(
                            "message", localizationService.get("profile.updated"),
                            "userId", user.getId(),
                            "username", user.getUsername(),
                            "email", user.getEmail(),
                            "profileImage", user.getProfileImage() == null ? "" : user.getProfileImage()
                    ));
                })
                .orElseGet(() -> notFound("user.notFound"));
    }

    @PostMapping("/me/profile-image")
    // image upload
    public ResponseEntity<?> uploadProfileImage(@AuthUser Long userId, @RequestParam("file") MultipartFile file) throws IOException {
        try {
            return ResponseEntity.ok(profileImageStorageService.storeProfileImage(userId, file));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/request-password-reset")
    // token request
    public ResponseEntity<?> requestPasswordReset(@Valid @RequestBody PasswordResetRequestRequest req) {
        String email = normalizeEmail(req.email);
        String[] exposedToken = new String[1];

        userRepository.findByEmail(email).ifPresent(user -> {
            String resetToken = generateResetToken();
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

    @PostMapping("/reset-password")
    // password reset
    public ResponseEntity<?> resetPassword(@Valid @RequestBody PasswordResetConfirmRequest request) {
        String email = normalizeEmail(request.email);
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

    // user payload
    private Map<String, Object> authenticationPayload(User user, String token) {
        Map<String, Object> response = new LinkedHashMap<>(profilePayload(user));
        response.put("token", token);
        return response;
    }

    // admin payload
    private Map<String, Object> adminAuthenticationPayload(String token) {
        Map<String, Object> response = new LinkedHashMap<>(adminProfilePayload());
        response.put("token", token);
        return response;
    }

    // profile payload
    private Map<String, Object> profilePayload(User user) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("userId", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("profileImage", normalizeProfileImage(user.getProfileImage()));
        response.put("role", "USER");
        return response;
    }

    // admin profile
    private Map<String, Object> adminProfilePayload() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("userId", "");
        response.put("username", "Admin");
        response.put("email", adminEmail);
        response.put("profileImage", "");
        response.put("role", "ADMIN");
        return response;
    }

    // auth error
    private ResponseEntity<Map<String, Object>> unauthorized(String messageKey) {
        return ResponseEntity.status(401).body(Map.of("error", localizationService.get(messageKey)));
    }

    // conflict error
    private ResponseEntity<Map<String, Object>> conflict(String messageKey) {
        return ResponseEntity.status(409).body(Map.of("error", localizationService.get(messageKey)));
    }

    // missing error
    private ResponseEntity<Map<String, Object>> notFound(String messageKey) {
        return ResponseEntity.status(404).body(Map.of("error", localizationService.get(messageKey)));
    }

    // email trim
    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim();
    }

    // image trim
    private String normalizeProfileImage(String profileImage) {
        return profileImage == null ? "" : profileImage.trim();
    }

    // admin email
    private boolean isAdminEmail(String email) {
        return adminEmail.equalsIgnoreCase(email == null ? "" : email.trim());
    }

    // admin login
    private boolean isAdminCredentials(String email, String password) {
        return isAdminEmail(email) && adminPassword.equals(password);
    }

    // reset token
    private String generateResetToken() {
        StringBuilder token = new StringBuilder(RESET_TOKEN_LENGTH);
        for (int i = 0; i < RESET_TOKEN_LENGTH; i++) {
            token.append(RESET_TOKEN_CHARS.charAt(SECURE_RANDOM.nextInt(RESET_TOKEN_CHARS.length())));
        }
        return token.toString();
    }
}
