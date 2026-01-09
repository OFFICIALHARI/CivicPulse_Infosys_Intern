package com.civicpulse.backend.dto;

import com.civicpulse.backend.model.GrievancePriority;
import com.civicpulse.backend.model.GrievanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrievanceDTO {
    private String id;
    private String title;
    private String description;
    private String category;
    private GrievanceStatus status;
    private GrievancePriority priority;
    private String submittedBy;
    private LocalDateTime submittedAt;
    private LocationDTO location;
    private String image;
    private String assignedOfficerId;
    private LocalDateTime assignedAt;
    private LocalDateTime deadline;
    private String resolutionNote;
    private String resolutionImage;
    private LocalDateTime resolvedAt;
    private List<TimelineEntryDTO> timeline;
}
