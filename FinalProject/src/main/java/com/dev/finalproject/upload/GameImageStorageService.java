package com.dev.finalproject.upload;

import com.dev.finalproject.i18n.LocalizationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.Normalizer;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
// game upload
public class GameImageStorageService {
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private final Path uploadDir;
    private final LocalizationService localizationService;

    // upload setup
    public GameImageStorageService(@Value("${app.upload.game-dir:uploads/game-images}") String uploadDir, LocalizationService localizationService) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.localizationService = localizationService;
    }

    // store image
    public Map<String, Object> storeGameImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(localizationService.get("upload.selectImage"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(localizationService.get("upload.invalidType"));
        }

        Files.createDirectories(uploadDir);

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "image" : file.getOriginalFilename());
        String extension = extractExtension(originalFileName);
        String baseName = extractBaseName(originalFileName);
        String storedFileName = sanitizeBaseName(baseName) + "-" + UUID.randomUUID() + extension;

        Path destination = uploadDir.resolve(storedFileName).normalize();
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

        BigDecimal sizeMb = BigDecimal.valueOf(file.getSize())
                .divide(BigDecimal.valueOf(1024 * 1024L), 3, RoundingMode.HALF_UP);

        return Map.of(
                "message", localizationService.get("admin.gameImageUploaded"),
                "imageUrl", "/uploads/game-images/" + storedFileName,
                "originalFileName", originalFileName,
                "storedFileName", storedFileName,
                "sizeMb", sizeMb
        );
    }

    // upload path
    public Path getUploadDir() {
        return uploadDir;
    }

    // file ext
    private String extractExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        return dotIndex >= 0 ? fileName.substring(dotIndex) : "";
    }

    // file name
    private String extractBaseName(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        return dotIndex >= 0 ? fileName.substring(0, dotIndex) : fileName;
    }

    // safe name
    private String sanitizeBaseName(String value) {
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("[^A-Za-z0-9_-]+", "-")
                .replaceAll("-{2,}", "-")
                .replaceAll("^[-_]+|[-_]+$", "");

        return normalized.isBlank() ? "game-image" : normalized.toLowerCase();
    }
}
