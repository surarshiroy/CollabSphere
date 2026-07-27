package com.collabsphere.collabsphere.dto;

import com.collabsphere.collabsphere.entity.TeamRole;
import lombok.Data;

@Data
public class AddMemberRequest {

    private String email;

    private TeamRole role;

}