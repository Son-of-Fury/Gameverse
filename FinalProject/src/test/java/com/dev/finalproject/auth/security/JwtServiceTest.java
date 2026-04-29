package com.dev.finalproject.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class JwtServiceTest {

    private static final String SECRET = "12345678901234567890123456789012";

    @Test
    void generateAndParseUserToken() {
        JwtService service = new JwtService(SECRET, 60);

        String token = service.generate(42L, "user@example.com");
        Jws<Claims> parsed = service.parse(token);

        assertEquals("42", parsed.getBody().getSubject());
        assertEquals("user@example.com", parsed.getBody().get("email", String.class));
        assertEquals("USER", parsed.getBody().get("role", String.class));
        assertEquals(42L, parsed.getBody().get("userId", Number.class).longValue());
    }

    @Test
    void generateAndParseAdminTokenWithoutUserId() {
        JwtService service = new JwtService(SECRET, 60);

        String token = service.generateAdmin("admin@example.com");
        Jws<Claims> parsed = service.parse(token);

        assertEquals("admin", parsed.getBody().getSubject());
        assertEquals("ADMIN", parsed.getBody().get("role", String.class));
        assertEquals("admin@example.com", parsed.getBody().get("email", String.class));
        assertNull(parsed.getBody().get("userId", Number.class));
    }
}
