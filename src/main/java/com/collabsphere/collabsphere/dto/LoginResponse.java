package com.collabsphere.collabsphere.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private String token;

    private Long id;

    private String name;

    private String email;

    private String role;
}