package com.civicpulse.backend.controller;

import com.civicpulse.backend.dto.*;
import com.civicpulse.backend.model.GrievanceStatus;
import com.civicpulse.backend.service.GrievanceService;
import com.civicpulse.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/grievances")
@RequiredArgsConstructor
public class GrievanceController {
    
    private final GrievanceService grievanceService;
    private final UserService userService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<GrievanceDTO>> createGrievance(
            @Valid @RequestBody CreateGrievanceRequest request,
            @RequestHeader("User-Id") Long userId) {
        
        String userName = userService.getUserById(userId)
                .map(UserDTO::getName)
                .orElse("Citizen");
        
        GrievanceDTO grievance = grievanceService.createGrievance(request, userId, userName);
        return ResponseEntity.ok(ApiResponse.success("Grievance created successfully", grievance));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<GrievanceDTO>>> getAllGrievances() {
        List<GrievanceDTO> grievances = grievanceService.getAllGrievances();
        return ResponseEntity.ok(ApiResponse.success(grievances));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GrievanceDTO>> getGrievanceById(@PathVariable String id) {
        return grievanceService.getGrievanceById(id)
                .map(grievance -> ResponseEntity.ok(ApiResponse.success(grievance)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<GrievanceDTO>>> getGrievancesByUser(@PathVariable Long userId) {
        List<GrievanceDTO> grievances = grievanceService.getGrievancesByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(grievances));
    }
    
    @GetMapping("/officer/{officerId}")
    public ResponseEntity<ApiResponse<List<GrievanceDTO>>> getGrievancesByOfficer(@PathVariable Long officerId) {
        List<GrievanceDTO> grievances = grievanceService.getGrievancesByOfficer(officerId);
        return ResponseEntity.ok(ApiResponse.success(grievances));
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<GrievanceDTO>>> getGrievancesByStatus(@PathVariable GrievanceStatus status) {
        List<GrievanceDTO> grievances = grievanceService.getGrievancesByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(grievances));
    }
    
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<GrievanceDTO>> updateGrievance(
            @PathVariable String id,
            @Valid @RequestBody UpdateGrievanceRequest request,
            @RequestHeader("User-Id") Long userId) {
        
        String actorName = userService.getUserById(userId)
                .map(UserDTO::getName)
                .orElse("System");
        
        return grievanceService.updateGrievance(id, request, actorName)
                .map(grievance -> ResponseEntity.ok(ApiResponse.success("Grievance updated successfully", grievance)))
                .orElse(ResponseEntity.notFound().build());
    }
}
