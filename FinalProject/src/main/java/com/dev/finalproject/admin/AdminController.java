package com.dev.finalproject.admin;

import com.dev.finalproject.i18n.LocalizationService;
import com.dev.finalproject.user.User;
import com.dev.finalproject.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
// admin users
public class AdminController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final LocalizationService localizationService;
    private final String adminEmail;

    public AdminController(UserRepository userRepository, PasswordEncoder passwordEncoder, LocalizationService localizationService,
                           @Value("${app.admin.email:admin@admin.com}") String adminEmail) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.localizationService = localizationService;
        this.adminEmail = adminEmail;
    }

    public static class AdminCreateUserRequest {
        @NotBlank public String username;
        @Email @NotBlank public String email;
        @NotBlank public String password;
        public String profileImage;
    }

    public static class AdminUpdateUserRequest {
        @NotBlank public String username;
        @Email @NotBlank public String email;
        public String profileImage;
    }

    @GetMapping
    // user list
    public List<Map<String, Object>> listUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserResponse)
                .toList();
    }

    @PostMapping
    // user create
    public ResponseEntity<?> createUser(@Valid @RequestBody AdminCreateUserRequest req) {
        String normalizedEmail = normalizeEmail(req.email);
        if (adminEmail.equalsIgnoreCase(normalizedEmail) || userRepository.existsByEmail(normalizedEmail)) {
            return conflict("auth.emailTaken");
        }

        User user = new User(req.username.trim(), normalizedEmail, passwordEncoder.encode(req.password));
        user.setProfileImage(normalizeProfileImage(req.profileImage));
        userRepository.save(user);

        return success("admin.userCreated", user);
    }

    @PutMapping("/{userId}")
    // user update
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @Valid @RequestBody AdminUpdateUserRequest req) {
        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> {
                    String normalizedEmail = normalizeEmail(req.email);
                    if (adminEmail.equalsIgnoreCase(normalizedEmail) || userRepository.existsByEmailAndIdNot(normalizedEmail, userId)) {
                        return conflict("auth.emailTaken");
                    }

                    user.setUsername(req.username.trim());
                    user.setEmail(normalizedEmail);
                    user.setProfileImage(normalizeProfileImage(req.profileImage));
                    userRepository.save(user);

                    return success("admin.userUpdated", user);
                })
                .orElseGet(() -> notFound("user.notFound"));
    }

    @DeleteMapping("/{userId}")
    // user delete
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> {
                    userRepository.delete(user);
                    return ResponseEntity.ok(Map.of("message", localizationService.get("admin.userDeleted")));
                })
                .orElseGet(() -> notFound("user.notFound"));
    }

    // success body
    private ResponseEntity<?> success(String messageKey, User user) {
        return ResponseEntity.ok(Map.of(
                "message", localizationService.get(messageKey),
                "user", toUserResponse(user)
        ));
    }

    // conflict body
    private ResponseEntity<?> conflict(String messageKey) {
        return ResponseEntity.status(409).body(Map.of("error", localizationService.get(messageKey)));
    }

    // missing body
    private ResponseEntity<?> notFound(String messageKey) {
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

    // user body
    private Map<String, Object> toUserResponse(User user) {
        return Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "profileImage", user.getProfileImage() == null ? "" : user.getProfileImage(),
                "createdAt", user.getCreatedAt(),
                "role", "USER"
        );
    }
}
