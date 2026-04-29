package com.dev.finalproject.auth.controller;

import com.dev.finalproject.auth.controller.AuthController;
import com.dev.finalproject.auth.security.JwtService;
import com.dev.finalproject.i18n.LocalizationService;
import com.dev.finalproject.upload.ProfileImageStorageService;
import com.dev.finalproject.user.User;
import com.dev.finalproject.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.util.ReflectionTestUtils.setField;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private ProfileImageStorageService profileImageStorageService;
    @Mock
    private LocalizationService localizationService;

    private AuthController controller;

    @BeforeEach
    void setUp() {
        controller = new AuthController(
                userRepository,
                passwordEncoder,
                jwtService,
                profileImageStorageService,
                localizationService,
                "admin@admin.com",
                "admin",
                true
        );
        lenient().when(localizationService.get(anyString())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void requestPasswordResetReturnsDemoTokenWhenEnabled() {
        User user = new User("Player", "player@example.com", "encoded");
        when(userRepository.findByEmail("player@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(anyString())).thenReturn("hashed-token");

        AuthController.PasswordResetRequestRequest request = new AuthController.PasswordResetRequestRequest();
        request.email = "player@example.com";

        ResponseEntity<?> response = controller.requestPasswordReset(request);

        assertEquals(200, response.getStatusCode().value());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertNotNull(body);
        assertEquals("auth.passwordResetRequested", body.get("message"));
        assertTrue(body.containsKey("resetToken"));
        assertEquals("auth.passwordResetTokenLabel", body.get("resetTokenLabel"));
        assertEquals("hashed-token", user.getPasswordResetTokenHash());
        assertNotNull(user.getPasswordResetTokenExpiresAt());
        verify(userRepository).save(user);
    }

    @Test
    void resetPasswordClearsResetFieldsAfterSuccessfulUpdate() {
        User user = new User("Player", "player@example.com", "old-hash");
        user.setPasswordResetTokenHash("stored-reset-hash");
        user.setPasswordResetTokenExpiresAt(Instant.now().plusSeconds(60));
        when(userRepository.findByEmail("player@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("RESET123", "stored-reset-hash")).thenReturn(true);
        when(passwordEncoder.encode("new-secret")).thenReturn("new-password-hash");

        AuthController.PasswordResetConfirmRequest request = new AuthController.PasswordResetConfirmRequest();
        request.email = "player@example.com";
        request.resetToken = "RESET123";
        request.newPassword = "new-secret";

        ResponseEntity<?> response = controller.resetPassword(request);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("new-password-hash", user.getPasswordHash());
        assertNull(user.getPasswordResetTokenHash());
        assertNull(user.getPasswordResetTokenExpiresAt());
        verify(userRepository).save(user);
    }

    @Test
    void loginWithAdminCredentialsReturnsAdminPayload() {
        when(jwtService.generateAdmin("admin@admin.com")).thenReturn("admin-token");

        AuthController.LoginRequest request = new AuthController.LoginRequest();
        request.email = "admin@admin.com";
        request.password = "admin";

        ResponseEntity<?> response = controller.login(request);

        assertEquals(200, response.getStatusCode().value());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertNotNull(body);
        assertEquals("admin-token", body.get("token"));
        assertEquals("ADMIN", body.get("role"));
        assertEquals("Admin", body.get("username"));
    }
}
