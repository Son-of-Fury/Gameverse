package com.dev.finalproject.upload;

import com.dev.finalproject.i18n.LocalizationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GameImageStorageServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void storeGameImageSavesFileAndReturnsMetadata() throws IOException {
        LocalizationService localizationService = mock(LocalizationService.class);
        when(localizationService.get("admin.gameImageUploaded")).thenReturn("uploaded");
        GameImageStorageService service = new GameImageStorageService(tempDir.toString(), localizationService);
        MockMultipartFile file = new MockMultipartFile("file", "árvíztűrő logo.png", "image/png", new byte[]{1, 2, 3});

        Map<String, Object> result = service.storeGameImage(file);

        assertEquals("uploaded", result.get("message"));
        String storedFileName = (String) result.get("storedFileName");
        assertTrue(storedFileName.endsWith(".png"));
        assertTrue(storedFileName.startsWith("arvizturo-logo-"));
        assertTrue(Files.exists(service.getUploadDir().resolve(storedFileName)));
    }

    @Test
    void storeGameImageRejectsUnsupportedType() {
        LocalizationService localizationService = mock(LocalizationService.class);
        when(localizationService.get("upload.invalidType")).thenReturn("bad type");
        GameImageStorageService service = new GameImageStorageService(tempDir.toString(), localizationService);
        MockMultipartFile file = new MockMultipartFile("file", "doc.txt", "text/plain", new byte[]{1});

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> service.storeGameImage(file));

        assertEquals("bad type", exception.getMessage());
    }
}
