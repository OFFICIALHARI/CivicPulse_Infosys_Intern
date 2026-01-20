package com.civicpulse.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeatMapDTO {
    private String zoneId;
    private String zoneName;
    private Double latitude;
    private Double longitude;
    private Long complaintCount;
    private Double intensity;  // 0-1 scale for color intensity
    private String status;  // RED_ZONE, AMBER_ZONE, GREEN_ZONE
}
