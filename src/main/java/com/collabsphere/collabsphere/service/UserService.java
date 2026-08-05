package com.collabsphere.collabsphere.service;

import com.collabsphere.collabsphere.dto.LoginRequest;
import com.collabsphere.collabsphere.dto.LoginResponse;
import com.collabsphere.collabsphere.dto.RegisterRequest;
import com.collabsphere.collabsphere.dto.RegisterResponse;
import com.collabsphere.collabsphere.dto.ChangePasswordRequest;
import com.collabsphere.collabsphere.dto.UpdateProfileRequest;
import com.collabsphere.collabsphere.dto.UserProfileResponse;


public interface UserService {

    RegisterResponse registerUser(RegisterRequest request);
    LoginResponse loginUser(LoginRequest request);

    UserProfileResponse getMyProfile();

    UserProfileResponse updateMyProfile(UpdateProfileRequest request);

    void changePassword(ChangePasswordRequest request);

}