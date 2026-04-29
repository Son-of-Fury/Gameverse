package com.dev.finalproject.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AdminCreateUserRequest {
    @NotBlank public String username;
    @Email @NotBlank public String email;
    @NotBlank public String password;
    public String profileImage;
}
