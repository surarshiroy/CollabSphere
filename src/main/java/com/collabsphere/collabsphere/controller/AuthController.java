package com.collabsphere.collabsphere.controller;

import com.collabsphere.collabsphere.dto.LoginRequest;
import com.collabsphere.collabsphere.dto.LoginResponse;
import com.collabsphere.collabsphere.dto.RegisterRequest;
import com.collabsphere.collabsphere.dto.RegisterResponse;
import com.collabsphere.collabsphere.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public RegisterResponse registerUser(@RequestBody RegisterRequest request) {
        return userService.registerUser(request);
    }

    @PostMapping("/login")
    public LoginResponse loginUser(@RequestBody LoginRequest request) {
        return userService.loginUser(request);
    }
}