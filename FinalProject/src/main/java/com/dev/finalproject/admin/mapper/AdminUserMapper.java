package com.dev.finalproject.admin.mapper;

import com.dev.finalproject.user.User;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class AdminUserMapper {
    public Map<String, Object> toUserResponse(User user) {
        return Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "profileImage", user.getProfileImage() == null ? "" : user.getProfileImage(),
                "createdAt", user.getCreatedAt(),
                "role", "USER"
        );
    }

    public String normalizeEmail(String email) {
        return email == null ? "" : email.trim();
    }

    public String normalizeProfileImage(String profileImage) {
        return profileImage == null ? "" : profileImage.trim();
    }
}
