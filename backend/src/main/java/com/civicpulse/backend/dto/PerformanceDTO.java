package com.civicpulse.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceDTO {
    private Long officerId;
    private String officerName;
    private String department;
    private Double averageRating;
    private Integer feedbackCount;
    private Integer warningsCount;
    private Integer appreciationsCount;
    private Integer resolvedCount;
    private Integer assignedCount;
}
