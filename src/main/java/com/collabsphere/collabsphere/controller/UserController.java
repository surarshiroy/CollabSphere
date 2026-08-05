package com.collabsphere.collabsphere.controller;

import com.collabsphere.collabsphere.dto.ChangePasswordRequest;
import com.collabsphere.collabsphere.dto.UpdateProfileRequest;
import com.collabsphere.collabsphere.dto.UserProfileResponse;
import com.collabsphere.collabsphere.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserProfileResponse getMyProfile() {
        return userService.getMyProfile();
    }

    @PutMapping("/me")
    public UserProfileResponse updateMyProfile(
            @RequestBody UpdateProfileRequest request) {

        return userService.updateMyProfile(request);
    }

    @PutMapping("/me/password")
    public ResponseEntity<String> changePassword(
            @RequestBody ChangePasswordRequest request) {

        userService.changePassword(request);

        return ResponseEntity.ok("Password changed successfully");
    }
}