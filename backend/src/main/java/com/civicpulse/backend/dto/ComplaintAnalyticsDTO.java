package com.civicpulse.backend.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintAnalyticsDTO {
    // Category Distribution
    private Map<String, Long> categoryDistribution;
    private Map<String, Double> categoryPercentage;
    
    // Zone Distribution
    private List<ZoneAnalyticsDTO> zoneAnalytics;
    
    // SLA Performance
    private SLAMetricsDTO slaMetrics;
    
    // Heat Map Data
    private List<HeatMapDTO> heatMapData;
    
    // Overall Metrics
    private Long totalGrievances;
    private Long resolvedCount;
    private Long pendingCount;
    private Double averageResolutionDays;
    
    // Status Distribution
    private Map<String, Long> statusDistribution;
}
