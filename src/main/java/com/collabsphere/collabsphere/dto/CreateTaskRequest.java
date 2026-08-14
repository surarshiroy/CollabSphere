package com.collabsphere.collabsphere.dto;

import com.collabsphere.collabsphere.entity.TaskPriority;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CreateTaskRequest {

    private String title;

    private String description;

    private TaskPriority priority;

    private LocalDateTime deadline;

}