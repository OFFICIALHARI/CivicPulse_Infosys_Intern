package com.civicpulse.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DistributionDTO {
    private Long categoryName;
    private Long count;
    private Double percentage;
}
