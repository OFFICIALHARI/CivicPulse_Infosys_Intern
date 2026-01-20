package com.civicpulse.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SLAMetricsDTO {
    private Long totalGrievances;
    private Long onTimeCount;
    private Long delayedCount;
    private Long overdueCount;
    private Double onTimePercentage;
    private Double delayedPercentage;
    private Double overduePercentage;
    private Double averageResolutionHours;
}
