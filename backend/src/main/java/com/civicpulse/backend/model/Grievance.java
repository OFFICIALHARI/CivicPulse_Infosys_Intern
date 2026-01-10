package com.civicpulse.backend.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "grievances")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Grievance {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String grievanceId;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false, length = 2000)
    private String description;
    
    @Column(nullable = false)
    private String category;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GrievanceStatus status;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GrievancePriority priority;
    
    @Column(nullable = false)
    private Long submittedBy;
    
    @Column(nullable = false)
    private LocalDateTime submittedAt;
    
    @Column(nullable = false)
    private Double locationLat;
    
    @Column(nullable = false)
    private Double locationLng;
    
    @Column(nullable = false)
    private String locationAddress;
    
    @Column
    private String image;
    
    @Column
    private Long assignedOfficerId;
    
    @Column
    private LocalDateTime assignedAt;
    
    @Column
    private LocalDateTime deadline;
    
    @Column(length = 2000)
    private String resolutionNote;
    
    @Column
    private String resolutionImage;
    
    @Column
    private LocalDateTime resolvedAt;
    
    @OneToMany(mappedBy = "grievance", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<TimelineEntry> timeline = new ArrayList<>();
    
    @OneToMany(mappedBy = "grievance", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<Feedback> feedbacks = new ArrayList<>();
    
    public void addTimelineEntry(TimelineEntry entry) {
        timeline.add(entry);
        entry.setGrievance(this);
    }
    
    public void addFeedback(Feedback feedback) {
        feedbacks.add(feedback);
        feedback.setGrievance(this);
    }
}
