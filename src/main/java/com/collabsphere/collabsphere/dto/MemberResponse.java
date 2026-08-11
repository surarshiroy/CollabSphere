package com.collabsphere.collabsphere.dto;

import com.collabsphere.collabsphere.entity.TeamRole;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MemberResponse {

    private Long id;
    private String name;
    private String email;
    private TeamRole role;
    private LocalDateTime joinedAt;
}