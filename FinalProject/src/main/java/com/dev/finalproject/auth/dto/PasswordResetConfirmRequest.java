package com.dev.finalproject.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class PasswordResetConfirmRequest {
    @Email @NotBlank public String email;
    @NotBlank public String resetToken;
    @NotBlank public String newPassword;
}
