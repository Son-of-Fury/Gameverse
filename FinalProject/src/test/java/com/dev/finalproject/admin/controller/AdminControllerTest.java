package com.dev.finalproject.admin.controller;

import com.dev.finalproject.admin.controller.AdminController;
import com.dev.finalproject.i18n.LocalizationService;
import com.dev.finalproject.user.User;
import com.dev.finalproject.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private LocalizationService localizationService;

    private AdminController controller;

    @BeforeEach
    void setUp() {
        controller = new AdminController(userRepository, passwordEncoder, localizationService, "admin@admin.com");
        lenient().when(localizationService.get(anyString())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void createUserRejectsReservedAdminEmail() {
        AdminController.AdminCreateUserRequest request = new AdminController.AdminCreateUserRequest();
        request.username = "Player";
        request.email = "admin@admin.com";
        request.password = "secret";

        ResponseEntity<?> response = controller.createUser(request);

        assertEquals(409, response.getStatusCode().value());
        assertEquals("auth.emailTaken", ((Map<?, ?>) response.getBody()).get("error"));
    }

    @Test
    void updateUserPersistsTrimmedFields() {
        User user = new User("Old", "old@example.com", "hash");
        ReflectionTestUtils.setField(user, "id", 11L);
        ReflectionTestUtils.setField(user, "createdAt", java.time.Instant.parse("2026-03-12T12:00:00Z"));
        when(userRepository.findById(11L)).thenReturn(Optional.of(user));
        when(userRepository.existsByEmailAndIdNot("new@example.com", 11L)).thenReturn(false);

        AdminController.AdminUpdateUserRequest request = new AdminController.AdminUpdateUserRequest();
        request.username = "  New Name  ";
        request.email = "new@example.com";
        request.profileImage = "  /img.png  ";

        ResponseEntity<?> response = controller.updateUser(11L, request);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("New Name", user.getUsername());
        assertEquals("new@example.com", user.getEmail());
        assertEquals("/img.png", user.getProfileImage());
        verify(userRepository).save(user);
    }
}
