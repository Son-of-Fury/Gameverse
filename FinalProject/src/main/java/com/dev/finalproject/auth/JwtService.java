package com.dev.finalproject.auth;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Date;

@Service
// jwt service
public class JwtService {

    private final Key key;
    private final long expirationMinutes;

    // jwt config
    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expirationMinutes}") long expirationMinutes) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMinutes = expirationMinutes;
    }

    // user token
    public String generate(Long userId, String email) {
        return generateToken(String.valueOf(userId), userId, email, "USER");
    }

    // admin token
    public String generateAdmin(String email) {
        return generateToken("admin", null, email, "ADMIN");
    }

    // token build
    private String generateToken(String subject, Long userId, String email, String role) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(expirationMinutes * 60);

        JwtBuilder builder = Jwts.builder()
                .setSubject(subject)
                .claim("email", email)
                .claim("role", role)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(exp))
                .signWith(key, SignatureAlgorithm.HS256);

        if (userId != null) {
            builder.claim("userId", userId);
        }

        return builder.compact();
    }

    // token parse
    public Jws<Claims> parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
    }
}
