package com.civicpulse.backend.service;

import com.civicpulse.backend.dto.*;
import com.civicpulse.backend.model.*;
import com.civicpulse.backend.repository.GrievanceRepository;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GrievanceService {
    
    private final GrievanceRepository grievanceRepository;
    private final Random random = new Random();
    
    @Transactional
    public GrievanceDTO createGrievance(CreateGrievanceRequest request, Long userId, String userName) {
        String grievanceId = "GRV-" + (1000 + random.nextInt(9000));
        
        Grievance grievance = Grievance.builder()
                .grievanceId(grievanceId)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .status(GrievanceStatus.PENDING)
                .priority(GrievancePriority.MEDIUM)
                .submittedBy(userId)
                .submittedAt(LocalDateTime.now())
                .locationLat(request.getLocation().getLat())
                .locationLng(request.getLocation().getLng())
                .locationAddress(request.getLocation().getAddress())
                .image(request.getImage())
                .build();
        
        TimelineEntry initialEntry = TimelineEntry.builder()
                .status(GrievanceStatus.PENDING)
                .timestamp(LocalDateTime.now())
                .message("Grievance submitted by citizen")
                .actor(userName)
                .build();
        
        grievance.addTimelineEntry(initialEntry);
        
        Grievance savedGrievance = grievanceRepository.save(grievance);
        return convertToDTO(savedGrievance);
    }
    
    @Transactional
    public Optional<GrievanceDTO> updateGrievance(String grievanceId, UpdateGrievanceRequest request, String actorName) {
        return grievanceRepository.findByGrievanceId(grievanceId)
                .map(grievance -> {
                    boolean statusChanged = false;
                    
                    if (request.getStatus() != null && request.getStatus() != grievance.getStatus()) {
                        grievance.setStatus(request.getStatus());
                        statusChanged = true;
                    }
                    
                    if (request.getAssignedOfficerId() != null) {
                        grievance.setAssignedOfficerId(request.getAssignedOfficerId());
                        grievance.setAssignedAt(request.getAssignedAt() != null ? 
                                request.getAssignedAt() : LocalDateTime.now());
                    }
                    
                    if (request.getDeadline() != null) {
                        grievance.setDeadline(request.getDeadline());
                    }
                    
                    if (request.getResolutionNote() != null) {
                        grievance.setResolutionNote(request.getResolutionNote());
                    }
                    
                    if (request.getResolutionImage() != null) {
                        grievance.setResolutionImage(request.getResolutionImage());
                    }
                    
                    if (request.getResolvedAt() != null) {
                        grievance.setResolvedAt(request.getResolvedAt());
                    }
                    
                    if (statusChanged) {
                        String message = request.getLogMessage() != null ? 
                                request.getLogMessage() : 
                                "Status changed to " + request.getStatus();
                        
                        TimelineEntry entry = TimelineEntry.builder()
                                .status(request.getStatus())
                                .timestamp(LocalDateTime.now())
                                .message(message)
                                .actor(actorName)
                                .build();
                        
                        grievance.addTimelineEntry(entry);
                    }
                    
                    Grievance updated = grievanceRepository.save(grievance);
                    return convertToDTO(updated);
                });
    }
    
    @Transactional(readOnly = true)
    public List<GrievanceDTO> getAllGrievances() {
        return grievanceRepository.findAllByOrderBySubmittedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<GrievanceDTO> getGrievancesByUser(Long userId) {
        return grievanceRepository.findBySubmittedBy(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<GrievanceDTO> getGrievancesByOfficer(Long officerId) {
        return grievanceRepository.findByAssignedOfficerId(officerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<GrievanceDTO> getGrievancesByStatus(GrievanceStatus status) {
        return grievanceRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Optional<GrievanceDTO> getGrievanceById(String grievanceId) {
        return grievanceRepository.findByGrievanceId(grievanceId)
                .map(this::convertToDTO);
    }
    
    private GrievanceDTO convertToDTO(Grievance grievance) {
        LocationDTO location = LocationDTO.builder()
                .lat(grievance.getLocationLat())
                .lng(grievance.getLocationLng())
                .address(grievance.getLocationAddress())
                .build();
        
        List<TimelineEntryDTO> timeline = grievance.getTimeline().stream()
                .map(entry -> TimelineEntryDTO.builder()
                        .status(entry.getStatus())
                        .timestamp(entry.getTimestamp())
                        .message(entry.getMessage())
                        .actor(entry.getActor())
                        .build())
                .collect(Collectors.toList());
        
        return GrievanceDTO.builder()
                .id(grievance.getGrievanceId())
                .title(grievance.getTitle())
                .description(grievance.getDescription())
                .category(grievance.getCategory())
                .status(grievance.getStatus())
                .priority(grievance.getPriority())
                .submittedBy(String.valueOf(grievance.getSubmittedBy()))
                .submittedAt(grievance.getSubmittedAt())
                .location(location)
                .image(grievance.getImage())
                .assignedOfficerId(grievance.getAssignedOfficerId() != null ? 
                        String.valueOf(grievance.getAssignedOfficerId()) : null)
                .assignedAt(grievance.getAssignedAt())
                .deadline(grievance.getDeadline())
                .resolutionNote(grievance.getResolutionNote())
                .resolutionImage(grievance.getResolutionImage())
                .resolvedAt(grievance.getResolvedAt())
                .timeline(timeline)
                .build();
    }
    
    @Transactional
        public FeedbackDTO submitFeedback(String grievanceId, int rating, String comment, Long userId, String userName) {
                Optional<Grievance> grievance = grievanceRepository.findByGrievanceId(grievanceId);
        if (grievance.isEmpty()) {
            throw new RuntimeException("Grievance not found");
        }
        
        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }
        
        Grievance g = grievance.get();
        Feedback feedback = Feedback.builder()
                .grievance(g)
                .rating(rating)
                .comment(comment)
                .givenBy(userId)
                .givenAt(LocalDateTime.now())
                .build();
        
        g.addFeedback(feedback);
        grievanceRepository.save(g);
        
        return FeedbackDTO.builder()
                .id(feedback.getId())
                .grievanceId(g.getId())
                .rating(feedback.getRating())
                .comment(feedback.getComment())
                .givenBy(feedback.getGivenBy())
                .givenByName(userName)
                .givenAt(feedback.getGivenAt())
                .build();
    }
    
    public List<FeedbackDTO> getGrievanceFeedback(String grievanceId) {
        Optional<Grievance> grievance = grievanceRepository.findByGrievanceId(grievanceId);
        if (grievance.isEmpty()) {
            throw new RuntimeException("Grievance not found");
        }
        
        return grievance.get().getFeedbacks().stream()
                .map(f -> FeedbackDTO.builder()
                        .id(f.getId())
                        .grievanceId(grievance.get().getId())
                        .rating(f.getRating())
                        .comment(f.getComment())
                        .givenBy(f.getGivenBy())
                        .givenAt(f.getGivenAt())
                        .build())
                .collect(Collectors.toList());
    }
    
    public AnalyticsDTO getAnalyticsForAll() {
        List<Grievance> allGrievances = grievanceRepository.findAll();
        
        long resolvedCount = allGrievances.stream()
                .filter(g -> g.getStatus() == GrievanceStatus.RESOLVED)
                .count();
        long pendingCount = allGrievances.stream()
                .filter(g -> g.getStatus() == GrievanceStatus.PENDING)
                .count();
        long inProgressCount = allGrievances.stream()
                .filter(g -> g.getStatus() == GrievanceStatus.IN_PROGRESS)
                .count();
        long assignedCount = allGrievances.stream()
                .filter(g -> g.getStatus() == GrievanceStatus.ASSIGNED)
                .count();
        
        Map<String, Long> byCategory = allGrievances.stream()
                .collect(Collectors.groupingBy(Grievance::getCategory, Collectors.counting()));
        
        Map<String, Long> byStatus = allGrievances.stream()
                .collect(Collectors.groupingBy(g -> g.getStatus().toString(), Collectors.counting()));
        
        double avgResolutionDays = allGrievances.stream()
                .filter(g -> g.getResolvedAt() != null)
                .mapToLong(g -> java.time.temporal.ChronoUnit.DAYS.between(g.getSubmittedAt(), g.getResolvedAt()))
                .average()
                .orElse(0.0);
        
        return AnalyticsDTO.builder()
                .totalGrievances((long) allGrievances.size())
                .resolvedCount(resolvedCount)
                .pendingCount(pendingCount)
                .inProgressCount(inProgressCount)
                .assignedCount(assignedCount)
                .byCategory(byCategory)
                .byStatus(byStatus)
                .averageResolutionDays(avgResolutionDays)
                .build();
    }
    
    public AnalyticsDTO getAnalyticsForOfficer(Long officerId) {
        List<Grievance> officerGrievances = grievanceRepository.findAll().stream()
                .filter(g -> g.getAssignedOfficerId() != null && g.getAssignedOfficerId().equals(officerId))
                .collect(Collectors.toList());
        
        long resolvedCount = officerGrievances.stream()
                .filter(g -> g.getStatus() == GrievanceStatus.RESOLVED)
                .count();
        long inProgressCount = officerGrievances.stream()
                .filter(g -> g.getStatus() == GrievanceStatus.IN_PROGRESS)
                .count();
        
        Map<String, Long> byCategory = officerGrievances.stream()
                .collect(Collectors.groupingBy(Grievance::getCategory, Collectors.counting()));
        
        Map<String, Long> byStatus = officerGrievances.stream()
                .collect(Collectors.groupingBy(g -> g.getStatus().toString(), Collectors.counting()));
        
        double avgResolutionDays = officerGrievances.stream()
                .filter(g -> g.getResolvedAt() != null)
                .mapToLong(g -> java.time.temporal.ChronoUnit.DAYS.between(g.getSubmittedAt(), g.getResolvedAt()))
                .average()
                .orElse(0.0);
        
        return AnalyticsDTO.builder()
                .totalGrievances((long) officerGrievances.size())
                .resolvedCount(resolvedCount)
                .inProgressCount(inProgressCount)
                .byCategory(byCategory)
                .byStatus(byStatus)
                .averageResolutionDays(avgResolutionDays)
                .build();
    }
    
    @Transactional
        public void updateGrievanceImage(String grievanceId, String imagePath) {
                Optional<Grievance> grievance = grievanceRepository.findByGrievanceId(grievanceId);
        if (grievance.isPresent()) {
            Grievance g = grievance.get();
            if (g.getImage() == null) {
                g.setImage(imagePath);
            } else {
                g.setResolutionImage(imagePath);
            }
            grievanceRepository.save(g);
        }
    }
}
