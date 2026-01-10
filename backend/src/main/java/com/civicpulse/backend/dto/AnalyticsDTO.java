package com.civicpulse.backend.dto;

import lombok.*;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsDTO {
    private Long totalGrievances;
    private Long resolvedCount;
    private Long pendingCount;
    private Long inProgressCount;
    private Long assignedCount;
    private Map<String, Long> byCategory;
    private Map<String, Long> byStatus;
    private Double averageResolutionDays;
}
