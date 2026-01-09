package com.civicpulse.backend.dto;

import com.civicpulse.backend.model.GrievanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateGrievanceRequest {
    private GrievanceStatus status;
    private Long assignedOfficerId;
    private LocalDateTime assignedAt;
    private LocalDateTime deadline;
    private String resolutionNote;
    private String resolutionImage;
    private LocalDateTime resolvedAt;
    private String logMessage;
}
