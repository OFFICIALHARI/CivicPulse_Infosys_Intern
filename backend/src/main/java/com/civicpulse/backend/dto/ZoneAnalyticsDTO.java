package com.civicpulse.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ZoneAnalyticsDTO {
    private String zoneName;
    private Long totalGrievances;
    private Long resolvedCount;
    private Long pendingCount;
    private Long inProgressCount;
    private Double averageResolutionDays;
    private Boolean isRedZone;  // True if complaints exceed threshold
    private Double latitude;
    private Double longitude;
    private Double complaintDensity;  // Complaints per square km or similar metric
}
