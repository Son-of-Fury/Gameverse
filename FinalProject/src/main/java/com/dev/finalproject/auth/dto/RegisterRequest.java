package com.dev.finalproject.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class RegisterRequest {
    @NotBlank public String username;
    @Email @NotBlank public String email;
    @NotBlank public String password;
}
