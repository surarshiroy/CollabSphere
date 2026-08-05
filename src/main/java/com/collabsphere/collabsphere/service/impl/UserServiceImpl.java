package com.collabsphere.collabsphere.service.impl;

import com.collabsphere.collabsphere.dto.LoginRequest;
import com.collabsphere.collabsphere.dto.LoginResponse;
import com.collabsphere.collabsphere.dto.RegisterRequest;
import com.collabsphere.collabsphere.dto.RegisterResponse;
import com.collabsphere.collabsphere.entity.User;
import com.collabsphere.collabsphere.exception.InvalidCredentialsException;
import com.collabsphere.collabsphere.exception.ResourceAlreadyExistsException;
import com.collabsphere.collabsphere.repository.UserRepository;
import com.collabsphere.collabsphere.security.CustomUserDetails;
import com.collabsphere.collabsphere.security.JwtService;
import com.collabsphere.collabsphere.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.collabsphere.collabsphere.entity.Role;
import java.time.LocalDateTime;
import com.collabsphere.collabsphere.dto.UserProfileResponse;
import com.collabsphere.collabsphere.dto.UpdateProfileRequest;
import com.collabsphere.collabsphere.dto.ChangePasswordRequest;
import com.collabsphere.collabsphere.util.SecurityUtil;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public RegisterResponse registerUser(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.DEVELOPER)
                .createdAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);

        return RegisterResponse.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .message("User registered successfully")
                .build();
    }

    @Override
    public LoginResponse loginUser(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        UserDetails userDetails = new CustomUserDetails(user);

        String token = jwtService.generateToken(userDetails);

        return LoginResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
    @Override
    public UserProfileResponse getMyProfile() {

        String email = SecurityUtil.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
    @Override
    public UserProfileResponse updateMyProfile(UpdateProfileRequest request) {

        String email = SecurityUtil.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(request.getName());

        user = userRepository.save(user);

        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
    @Override
    public void changePassword(ChangePasswordRequest request) {

        String email = SecurityUtil.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword())) {

            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(
                passwordEncoder.encode(request.getNewPassword()));

        userRepository.save(user);
    }
}