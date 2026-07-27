package com.collabsphere.collabsphere.dto;

import com.collabsphere.collabsphere.entity.TeamRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TeamResponse {

    private Long id;
    private String name;
    private String description;
    private TeamRole role;

}