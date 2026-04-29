package com.dev.finalproject.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AdminUpdateUserRequest {
    @NotBlank public String username;
    @Email @NotBlank public String email;
    public String profileImage;
}
