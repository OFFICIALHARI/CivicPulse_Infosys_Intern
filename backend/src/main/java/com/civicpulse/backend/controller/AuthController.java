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
        var userOpt = userService.login(request);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid credentials for selected role"));
        }
        return buildAuthResponse(userOpt.get(), "Login successful");
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        var userOpt = userService.register(request);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email already registered for this role"));
        }
        return buildAuthResponse(userOpt.get(), "Registration successful");
    }

        private ResponseEntity<?> buildAuthResponse(UserDTO user, String message) {
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().toString());
        AuthResponse response = AuthResponse.builder()
            .token(token)
            .user(user)
            .message(message)
            .build();
        return ResponseEntity.ok(response);
        }
}
