package com.collabsphere.collabsphere.dto;

import com.collabsphere.collabsphere.entity.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    private String name;

    private String email;

    private String password;



}