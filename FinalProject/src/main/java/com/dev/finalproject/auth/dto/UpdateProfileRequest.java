package com.dev.finalproject.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class UpdateProfileRequest {
    @NotBlank public String username;
    @Email @NotBlank public String email;
    public String password;
    public String profileImage;
}
