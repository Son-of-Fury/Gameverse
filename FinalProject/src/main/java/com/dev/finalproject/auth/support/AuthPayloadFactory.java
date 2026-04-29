package com.dev.finalproject.auth.support;

import com.dev.finalproject.user.User;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class AuthPayloadFactory {
    public Map<String, Object> authenticationPayload(User user, String token) {
        Map<String, Object> response = new LinkedHashMap<>(profilePayload(user));
        response.put("token", token);
        return response;
    }

    public Map<String, Object> adminAuthenticationPayload(String adminEmail, String token) {
        Map<String, Object> response = new LinkedHashMap<>(adminProfilePayload(adminEmail));
        response.put("token", token);
        return response;
    }

    public Map<String, Object> profilePayload(User user) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("userId", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("profileImage", normalizeProfileImage(user.getProfileImage()));
        response.put("role", "USER");
        return response;
    }

    public Map<String, Object> adminProfilePayload(String adminEmail) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("userId", "");
        response.put("username", "Admin");
        response.put("email", adminEmail);
        response.put("profileImage", "");
        response.put("role", "ADMIN");
        return response;
    }

    public String normalizeProfileImage(String profileImage) {
        return profileImage == null ? "" : profileImage.trim();
    }
}
