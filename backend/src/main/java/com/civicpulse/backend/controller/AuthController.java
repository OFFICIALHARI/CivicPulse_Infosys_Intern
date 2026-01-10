package com.civicpulse.backend.controller;

import com.civicpulse.backend.dto.*;
import com.civicpulse.backend.service.UserService;
import com.civicpulse.backend.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final UserService userService;
    private final JwtUtil jwtUtil;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        return userService.login(request)
                .map(user -> {
                    String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().toString());
                    AuthResponse response = AuthResponse.builder()
                            .token(token)
                            .user(user)
                            .message("Login successful")
                            .build();
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity
                        .badRequest()
                        .body(ApiResponse.error("Invalid credentials for selected role")));
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        return userService.register(request)
                .map(user -> {
                    String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().toString());
                    AuthResponse response = AuthResponse.builder()
                            .token(token)
                            .user(user)
                            .message("Registration successful")
                            .build();
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity
                        .badRequest()
                        .body(ApiResponse.error("Email already registered for this role")));
    }
}
