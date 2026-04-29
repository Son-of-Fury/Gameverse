package com.dev.finalproject.admin.controller;

import com.dev.finalproject.admin.dto.AdminCreateUserRequest;
import com.dev.finalproject.admin.dto.AdminUpdateUserRequest;
import com.dev.finalproject.admin.mapper.AdminUserMapper;
import com.dev.finalproject.i18n.LocalizationService;
import com.dev.finalproject.user.User;
import com.dev.finalproject.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class AdminController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final LocalizationService localizationService;
    private final String adminEmail;
    private final AdminUserMapper adminUserMapper;

    @Autowired
    public AdminController(UserRepository userRepository, PasswordEncoder passwordEncoder, LocalizationService localizationService,
                           @Value("${app.admin.email:admin@admin.com}") String adminEmail,
                           AdminUserMapper adminUserMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.localizationService = localizationService;
        this.adminEmail = adminEmail;
        this.adminUserMapper = adminUserMapper;
    }

    public AdminController(UserRepository userRepository, PasswordEncoder passwordEncoder, LocalizationService localizationService,
                           String adminEmail) {
        this(userRepository, passwordEncoder, localizationService, adminEmail, new AdminUserMapper());
    }

    public static class AdminCreateUserRequest extends com.dev.finalproject.admin.dto.AdminCreateUserRequest {}

    public static class AdminUpdateUserRequest extends com.dev.finalproject.admin.dto.AdminUpdateUserRequest {}

    @GetMapping
    public List<Map<String, Object>> listUsers() {
        return userRepository.findAll().stream()
                .map(adminUserMapper::toUserResponse)
                .toList();
    }

    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody AdminCreateUserRequest req) {
        String normalizedEmail = adminUserMapper.normalizeEmail(req.email);
        if (adminEmail.equalsIgnoreCase(normalizedEmail) || userRepository.existsByEmail(normalizedEmail)) {
            return conflict("auth.emailTaken");
        }

        User user = new User(req.username.trim(), normalizedEmail, passwordEncoder.encode(req.password));
        user.setProfileImage(adminUserMapper.normalizeProfileImage(req.profileImage));
        userRepository.save(user);

        return success("admin.userCreated", user);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @Valid @RequestBody AdminUpdateUserRequest req) {
        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> {
                    String normalizedEmail = adminUserMapper.normalizeEmail(req.email);
                    if (adminEmail.equalsIgnoreCase(normalizedEmail) || userRepository.existsByEmailAndIdNot(normalizedEmail, userId)) {
                        return conflict("auth.emailTaken");
                    }

                    user.setUsername(req.username.trim());
                    user.setEmail(normalizedEmail);
                    user.setProfileImage(adminUserMapper.normalizeProfileImage(req.profileImage));
                    userRepository.save(user);

                    return success("admin.userUpdated", user);
                })
                .orElseGet(() -> notFound("user.notFound"));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(user -> {
                    userRepository.delete(user);
                    return ResponseEntity.ok(Map.of("message", localizationService.get("admin.userDeleted")));
                })
                .orElseGet(() -> notFound("user.notFound"));
    }

    private ResponseEntity<?> success(String messageKey, User user) {
        return ResponseEntity.ok(Map.of(
                "message", localizationService.get(messageKey),
                "user", adminUserMapper.toUserResponse(user)
        ));
    }

    private ResponseEntity<?> conflict(String messageKey) {
        return ResponseEntity.status(409).body(Map.of("error", localizationService.get(messageKey)));
    }

    private ResponseEntity<?> notFound(String messageKey) {
        return ResponseEntity.status(404).body(Map.of("error", localizationService.get(messageKey)));
    }
}
