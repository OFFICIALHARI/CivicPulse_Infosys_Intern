package com.civicpulse.backend.controller;

import com.civicpulse.backend.dto.*;
import com.civicpulse.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final UserService userService;
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserDTO>> login(@Valid @RequestBody LoginRequest request) {
        return userService.login(request)
                .map(user -> ResponseEntity.ok(ApiResponse.success("Login successful", user)))
                .orElse(ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid credentials for selected role")));
    }
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDTO>> register(@Valid @RequestBody RegisterRequest request) {
        return userService.register(request)
                .map(user -> ResponseEntity.ok(ApiResponse.success("Registration successful", user)))
                .orElse(ResponseEntity.badRequest()
                        .body(ApiResponse.error("Email already registered for this role")));
    }
}
