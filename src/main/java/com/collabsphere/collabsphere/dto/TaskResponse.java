package com.collabsphere.collabsphere.dto;

import com.collabsphere.collabsphere.entity.TaskPriority;
import com.collabsphere.collabsphere.entity.TaskStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TaskResponse {

    private Long id;

    private String title;

    private String description;

    private TaskStatus status;

    private TaskPriority priority;

    private String createdBy;

    private String assignee;

    private LocalDateTime createdAt;

    private LocalDateTime deadline;
}