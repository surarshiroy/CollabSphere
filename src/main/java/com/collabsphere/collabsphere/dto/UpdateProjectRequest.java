package com.collabsphere.collabsphere.dto;

import com.collabsphere.collabsphere.entity.ProjectStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UpdateProjectRequest {

    private String name;

    private String description;

    private ProjectStatus status;

    private LocalDateTime deadline;

}