package com.collabsphere.collabsphere.service;

import com.collabsphere.collabsphere.dto.LoginRequest;
import com.collabsphere.collabsphere.dto.LoginResponse;
import com.collabsphere.collabsphere.dto.RegisterRequest;
import com.collabsphere.collabsphere.dto.RegisterResponse;


public interface UserService {

    RegisterResponse registerUser(RegisterRequest request);
    LoginResponse loginUser(LoginRequest request);

}