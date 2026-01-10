package com.civicpulse.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackDTO {
    private Long id;
    private Long grievanceId;
    private int rating;
    private String comment;
    private Long givenBy;
    private String givenByName;
    private LocalDateTime givenAt;
}
