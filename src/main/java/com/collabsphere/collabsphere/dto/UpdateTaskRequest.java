package com.collabsphere.collabsphere.dto;

import com.collabsphere.collabsphere.entity.TaskPriority;
import com.collabsphere.collabsphere.entity.TaskStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UpdateTaskRequest {

    private String title;

    private String description;

    private TaskPriority priority;

    private TaskStatus status;

    private LocalDateTime deadline;
}