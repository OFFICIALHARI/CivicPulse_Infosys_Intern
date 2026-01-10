package com.civicpulse.backend.controller;

import com.civicpulse.backend.dto.*;
import com.civicpulse.backend.model.GrievanceStatus;
import com.civicpulse.backend.service.GrievanceService;
import com.civicpulse.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

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
    
        @PostMapping("/{id}/feedback")
    public ResponseEntity<ApiResponse<FeedbackDTO>> submitFeedback(
            @PathVariable String id,
            @RequestBody FeedbackDTO feedbackDTO,
            @RequestHeader("User-Id") Long userId) {
        
        String userName = userService.getUserById(userId)
                .map(UserDTO::getName)
                .orElse("User");
        
        FeedbackDTO feedback = grievanceService.submitFeedback(
                id, 
                feedbackDTO.getRating(), 
                feedbackDTO.getComment(), 
                userId, 
                userName
        );
        
        return ResponseEntity.ok(ApiResponse.success("Feedback submitted successfully", feedback));
    }
    
    @GetMapping("/{id}/feedback")
    public ResponseEntity<ApiResponse<List<FeedbackDTO>>> getGrievanceFeedback(@PathVariable String id) {
        List<FeedbackDTO> feedbacks = grievanceService.getGrievanceFeedback(id);
        return ResponseEntity.ok(ApiResponse.success(feedbacks));
    }
    
    @GetMapping("/analytics/all")
    public ResponseEntity<ApiResponse<AnalyticsDTO>> getAnalyticsForAll() {
        AnalyticsDTO analytics = grievanceService.getAnalyticsForAll();
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }
    
    @GetMapping("/analytics/officer/{officerId}")
    public ResponseEntity<ApiResponse<AnalyticsDTO>> getOfficerAnalytics(@PathVariable Long officerId) {
        AnalyticsDTO analytics = grievanceService.getAnalyticsForOfficer(officerId);
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }
    
        @PostMapping("/{id}/upload")
    public ResponseEntity<ApiResponse<String>> uploadFile(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("File is empty"));
            }
            
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Only image files are allowed"));
            }
            
            if (file.getSize() > 5 * 1024 * 1024) { // 5MB limit
                return ResponseEntity.badRequest().body(ApiResponse.error("File size exceeds 5MB limit"));
            }
            
            // Create uploads directory if it doesn't exist
            String uploadDir = "./uploads";
            Files.createDirectories(Paths.get(uploadDir));
            
            // Save file with unique name
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir, fileName);
            Files.write(filePath, file.getBytes());
            
            // Update grievance with file path
            grievanceService.updateGrievanceImage(id, filePath.toString());
            
            return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", filePath.toString()));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File upload failed: " + e.getMessage()));
        }
    }
}
