package com.dev.finalproject.upload;

import com.dev.finalproject.i18n.LocalizationService;
import com.dev.finalproject.user.User;
import com.dev.finalproject.user.UserRepository;
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
// profile upload
public class ProfileImageStorageService {
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private final Path uploadDir;
    private final UserRepository userRepository;
    private final ProfileImageUploadRepository uploadRepository;
    private final LocalizationService localizationService;

    public ProfileImageStorageService(
            @Value("${app.upload.dir:uploads/profile-images}") String uploadDir,
            UserRepository userRepository,
            ProfileImageUploadRepository uploadRepository,
            LocalizationService localizationService
    ) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.userRepository = userRepository;
        this.uploadRepository = uploadRepository;
        this.localizationService = localizationService;
    }

    // store image
    public Map<String, Object> storeProfileImage(Long userId, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(localizationService.get("upload.selectImage"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(localizationService.get("upload.invalidType"));
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(localizationService.get("user.notFound")));

        Files.createDirectories(uploadDir);

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "image" : file.getOriginalFilename());
        String extension = extractExtension(originalFileName);
        String baseName = extractBaseName(originalFileName);
        String storedFileName = sanitizeBaseName(baseName) + "-" + UUID.randomUUID() + extension;

        Path destination = uploadDir.resolve(storedFileName).normalize();
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

        long sizeBytes = file.getSize();
        BigDecimal sizeMb = BigDecimal.valueOf(sizeBytes)
                .divide(BigDecimal.valueOf(1024 * 1024L), 3, RoundingMode.HALF_UP);

        ProfileImageUpload upload = new ProfileImageUpload();
        upload.setUser(user);
        upload.setOriginalFileName(originalFileName);
        upload.setStoredFileName(storedFileName);
        upload.setSizeBytes(sizeBytes);
        upload.setSizeMb(sizeMb);
        uploadRepository.save(upload);

        user.setProfileImage("/uploads/profile-images/" + storedFileName);
        userRepository.save(user);

        return Map.of(
                "message", localizationService.get("upload.success"),
                "profileImage", user.getProfileImage(),
                "originalFileName", upload.getOriginalFileName(),
                "storedFileName", upload.getStoredFileName(),
                "sizeBytes", upload.getSizeBytes(),
                "sizeMb", upload.getSizeMb(),
                "uploadedAt", upload.getUploadedAt()
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

        return normalized.isBlank() ? "profile-image" : normalized.toLowerCase();
    }
}
