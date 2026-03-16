package com.dev.finalproject.config;

import com.dev.finalproject.auth.AuthUserResolver;
import com.dev.finalproject.upload.GameImageStorageService;
import com.dev.finalproject.upload.ProfileImageStorageService;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.*;

import java.nio.file.Path;
import java.util.List;

@Configuration
// web config
public class WebConfig implements WebMvcConfigurer {
    private final ProfileImageStorageService profileImageStorageService;
    private final GameImageStorageService gameImageStorageService;

    public WebConfig(ProfileImageStorageService profileImageStorageService, GameImageStorageService gameImageStorageService) {
        this.profileImageStorageService = profileImageStorageService;
        this.gameImageStorageService = gameImageStorageService;
    }

    @Override
    // arg resolver
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(new AuthUserResolver());
    }

    @Override
    // static files
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadDir = profileImageStorageService.getUploadDir();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadDir.getParent().toUri().toString());
        registry.addResourceHandler("/uploads/game-images/**")
                .addResourceLocations(gameImageStorageService.getUploadDir().toUri().toString());
    }
}
