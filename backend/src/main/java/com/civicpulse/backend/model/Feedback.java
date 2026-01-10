package com.civicpulse.backend.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grievance_id", nullable = false)
    @JsonBackReference
    private Grievance grievance;
    
    @Column(nullable = false)
    private int rating;  // 1-5 stars
    
    @Column(length = 1000)
    private String comment;
    
    @Column(nullable = false)
    private Long givenBy;  // User ID of citizen who gave feedback
    
    @Column(nullable = false)
    private LocalDateTime givenAt;
}
