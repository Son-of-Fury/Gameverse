package com.dev.finalproject.upload;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileImageUploadRepository extends JpaRepository<ProfileImageUpload, Long> {
    void deleteByUserId(Long userId);
}
