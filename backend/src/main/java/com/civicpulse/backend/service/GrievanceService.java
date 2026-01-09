package com.civicpulse.backend.service;

import com.civicpulse.backend.dto.*;
import com.civicpulse.backend.model.*;
import com.civicpulse.backend.repository.GrievanceRepository;
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
}
