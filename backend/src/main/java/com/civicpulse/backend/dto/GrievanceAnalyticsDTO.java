package com.civicpulse.backend.dto;

import lombok.*;
import java.util.HashMap;
import java.util.Map;

/**
 * DTO for Grievance Analysis
 * Contains comprehensive metrics about grievances including status, priority, and category breakdowns
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrievanceAnalyticsDTO {
    
    // Status Distribution
    @Builder.Default
    private Map<String, Long> statusDistribution = new HashMap<>();
    
    // Priority Distribution
    @Builder.Default
    private Map<String, Long> priorityDistribution = new HashMap<>();
    
    // Category Distribution
    @Builder.Default
    private Map<String, Long> categoryDistribution = new HashMap<>();
    
    // Time-based Metrics
    @Builder.Default
    private Long todayCount = 0L;
    
    @Builder.Default
    private Long weekCount = 0L;
    
    @Builder.Default
    private Long monthCount = 0L;
    
    // Summary Metrics
    @Builder.Default
    private Long totalGrievances = 0L;
    
    @Builder.Default
    private Long resolvedCount = 0L;
    
    @Builder.Default
    private Long pendingCount = 0L;
    
    @Builder.Default
    private Long inProgressCount = 0L;
    
    @Builder.Default
    private Long assignedCount = 0L;
    
    // Performance Metrics
    @Builder.Default
    private Double averageResolutionDays = 0.0;
    
    @Builder.Default
    private Double resolutionRate = 0.0;
    
    // Priority Metrics
    @Builder.Default
    private Long highPriorityCount = 0L;
    
    @Builder.Default
    private Long mediumPriorityCount = 0L;
    
    @Builder.Default
    private Long lowPriorityCount = 0L;
    
    // Category Performance
    @Builder.Default
    private String topCategory = "N/A";
    
    @Builder.Default
    private Long topCategoryCount = 0L;
}
