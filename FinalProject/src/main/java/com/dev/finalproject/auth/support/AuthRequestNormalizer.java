package com.dev.finalproject.auth.support;

import org.springframework.stereotype.Component;

@Component
public class AuthRequestNormalizer {
    public String normalizeEmail(String email) {
        return email == null ? "" : email.trim();
    }

    public String normalizeProfileImage(String profileImage) {
        return profileImage == null ? "" : profileImage.trim();
    }

    public boolean isAdminEmail(String adminEmail, String email) {
        return adminEmail.equalsIgnoreCase(normalizeEmail(email));
    }

    public boolean isAdminCredentials(String adminEmail, String adminPassword, String email, String password) {
        return isAdminEmail(adminEmail, email) && adminPassword.equals(password);
    }
}
