package com.collabsphere.collabsphere.dto;

import com.collabsphere.collabsphere.entity.Role;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserProfileResponse {

    private Long id;

    private String name;

    private String email;

    private Role role;

    private LocalDateTime createdAt;
}