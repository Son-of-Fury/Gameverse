package com.dev.finalproject.auth;

// auth user
public class AuthPrincipal {
    private final Long userId;
    private final String email;
    private final String role;

    // auth user
    public AuthPrincipal(Long userId, String email, String role) {
        this.userId = userId;
        this.email = email;
        this.role = role;
    }

    // user id
    public Long getUserId() {
        return userId;
    }

    // user email
    public String getEmail() {
        return email;
    }

    // user role
    public String getRole() {
        return role;
    }

    // admin check
    public boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(role);
    }
}
