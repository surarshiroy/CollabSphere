package com.collabsphere.collabsphere.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CreateProjectRequest {

    private String name;
    private String description;
    private LocalDateTime deadline;

}