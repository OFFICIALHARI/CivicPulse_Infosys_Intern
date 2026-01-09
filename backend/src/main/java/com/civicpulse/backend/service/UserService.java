package com.civicpulse.backend.service;

import com.civicpulse.backend.dto.*;
import com.civicpulse.backend.model.User;
import com.civicpulse.backend.model.UserRole;
import com.civicpulse.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public Optional<UserDTO> login(LoginRequest request) {
        return userRepository.findByEmailAndRole(request.getEmail(), request.getRole())
                .map(this::convertToDTO);
    }
    
    @Transactional
    public Optional<UserDTO> register(RegisterRequest request) {
        if (userRepository.existsByEmailAndRole(request.getEmail(), request.getRole())) {
            return Optional.empty();
        }
        
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .role(request.getRole())
                .department(request.getDepartment())
                .password(request.getPassword())
                .build();
        
        User savedUser = userRepository.save(user);
        return Optional.of(convertToDTO(savedUser));
    }
    
    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<UserDTO> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Optional<UserDTO> getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::convertToDTO);
    }
    
    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(String.valueOf(user.getId()))
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .department(user.getDepartment())
                .build();
    }
}
