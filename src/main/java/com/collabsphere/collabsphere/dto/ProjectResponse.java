package com.collabsphere.collabsphere.dto;

import com.collabsphere.collabsphere.entity.ProjectStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ProjectResponse {

    private Long id;

    private String name;

    private String description;

    private ProjectStatus status;

    private String createdBy;

    private LocalDateTime createdAt;

    private LocalDateTime deadline;

}