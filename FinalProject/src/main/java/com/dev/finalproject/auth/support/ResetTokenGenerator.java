package com.dev.finalproject.auth.support;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class ResetTokenGenerator {
    private static final String RESET_TOKEN_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int RESET_TOKEN_LENGTH = 8;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public String generateResetToken() {
        StringBuilder token = new StringBuilder(RESET_TOKEN_LENGTH);
        for (int i = 0; i < RESET_TOKEN_LENGTH; i++) {
            token.append(RESET_TOKEN_CHARS.charAt(SECURE_RANDOM.nextInt(RESET_TOKEN_CHARS.length())));
        }
        return token.toString();
    }
}
