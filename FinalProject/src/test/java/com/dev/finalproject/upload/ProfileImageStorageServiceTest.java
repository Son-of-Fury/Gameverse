package com.dev.finalproject.upload;

import com.dev.finalproject.i18n.LocalizationService;
import com.dev.finalproject.user.User;
import com.dev.finalproject.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ProfileImageStorageServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void storeProfileImagePersistsUploadAndUpdatesUser() throws IOException {
        UserRepository userRepository = mock(UserRepository.class);
        ProfileImageUploadRepository uploadRepository = mock(ProfileImageUploadRepository.class);
        LocalizationService localizationService = mock(LocalizationService.class);
        when(localizationService.get("upload.success")).thenReturn("ok");

        User user = new User("Player", "user@example.com", "hash");
        ReflectionTestUtils.setField(user, "id", 4L);
        when(userRepository.findById(4L)).thenReturn(Optional.of(user));
        when(uploadRepository.save(any(ProfileImageUpload.class))).thenAnswer(invocation -> {
            ProfileImageUpload upload = invocation.getArgument(0);
            ReflectionTestUtils.setField(upload, "uploadedAt", Instant.parse("2026-03-12T12:00:00Z"));
            return upload;
        });

        ProfileImageStorageService service = new ProfileImageStorageService(tempDir.toString(), userRepository, uploadRepository, localizationService);
        MockMultipartFile file = new MockMultipartFile("file", "profil kép.webp", "image/webp", new byte[]{9, 8, 7, 6});

        Map<String, Object> result = service.storeProfileImage(4L, file);

        ArgumentCaptor<ProfileImageUpload> captor = ArgumentCaptor.forClass(ProfileImageUpload.class);
        verify(uploadRepository).save(captor.capture());
        verify(userRepository).save(user);
        assertEquals("ok", result.get("message"));
        String storedFileName = captor.getValue().getStoredFileName();
        assertTrue(storedFileName.startsWith("profil-kep-"));
        assertTrue(storedFileName.endsWith(".webp"));
        assertEquals("/uploads/profile-images/" + storedFileName, user.getProfileImage());
        assertTrue(Files.exists(service.getUploadDir().resolve(storedFileName)));
    }

    @Test
    void storeProfileImageRejectsMissingUser() {
        UserRepository userRepository = mock(UserRepository.class);
        ProfileImageUploadRepository uploadRepository = mock(ProfileImageUploadRepository.class);
        LocalizationService localizationService = mock(LocalizationService.class);
        when(localizationService.get("user.notFound")).thenReturn("missing user");
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        ProfileImageStorageService service = new ProfileImageStorageService(tempDir.toString(), userRepository, uploadRepository, localizationService);
        MockMultipartFile file = new MockMultipartFile("file", "image.png", "image/png", new byte[]{1, 2});

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> service.storeProfileImage(99L, file));

        assertEquals("missing user", exception.getMessage());
    }
}
