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
                .zone("Default Zone")  // Default zone - can be updated
                .image(request.getImage())
                .build();
        
        // Calculate SLA deadline based on priority
        calculateAndSetSLADeadline(grievance);
        
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
        
        List<FeedbackDTO> feedbacks = grievance.getFeedbacks().stream()
                .map(f -> FeedbackDTO.builder()
                        .id(f.getId())
                        .grievanceId(grievance.getId())
                        .rating(f.getRating())
                        .comment(f.getComment())
                        .givenBy(f.getGivenBy())
                        .givenAt(f.getGivenAt())
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
                .slaHours(grievance.getSlaHours())
                .slaStatus(grievance.getSlaStatus())
                .zone(grievance.getZone())
                .resolutionNote(grievance.getResolutionNote())
                .resolutionImage(grievance.getResolutionImage())
                .resolvedAt(grievance.getResolvedAt())
                .timeline(timeline)
                .feedbacks(feedbacks)
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
    
    // ==================== ANALYTICS METHODS ====================
    
    @Transactional(readOnly = true)
    public ComplaintAnalyticsDTO getCompleteAnalytics() {
        List<Grievance> allGrievances = grievanceRepository.findAll();
        
        // Category Distribution
        Map<String, Long> categoryDistribution = allGrievances.stream()
                .collect(Collectors.groupingBy(Grievance::getCategory, Collectors.counting()));
        
        Long totalGrievances = (long) allGrievances.size();
        Map<String, Double> categoryPercentage = categoryDistribution.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> (e.getValue() * 100.0) / totalGrievances
                ));
        
        // Zone Analytics
        List<ZoneAnalyticsDTO> zoneAnalytics = generateZoneAnalytics(allGrievances);
        
        // SLA Metrics
        SLAMetricsDTO slaMetrics = generateSLAMetrics(allGrievances);
        
        // Heat Map Data
        List<HeatMapDTO> heatMapData = generateHeatMapData(zoneAnalytics);
        
        // Overall metrics
        long resolvedCount = allGrievances.stream()
                .filter(g -> g.getStatus() == GrievanceStatus.RESOLVED)
                .count();
        long pendingCount = allGrievances.stream()
                .filter(g -> g.getStatus() == GrievanceStatus.PENDING)
                .count();
        
        double avgResolutionDays = allGrievances.stream()
                .filter(g -> g.getResolvedAt() != null)
                .mapToLong(g -> java.time.temporal.ChronoUnit.DAYS.between(g.getSubmittedAt(), g.getResolvedAt()))
                .average()
                .orElse(0.0);
        
        Map<String, Long> statusDistribution = allGrievances.stream()
                .collect(Collectors.groupingBy(g -> g.getStatus().toString(), Collectors.counting()));
        
        return ComplaintAnalyticsDTO.builder()
                .categoryDistribution(categoryDistribution)
                .categoryPercentage(categoryPercentage)
                .zoneAnalytics(zoneAnalytics)
                .slaMetrics(slaMetrics)
                .heatMapData(heatMapData)
                .totalGrievances(totalGrievances)
                .resolvedCount(resolvedCount)
                .pendingCount(pendingCount)
                .averageResolutionDays(avgResolutionDays)
                .statusDistribution(statusDistribution)
                .build();
    }
    
    private List<ZoneAnalyticsDTO> generateZoneAnalytics(List<Grievance> allGrievances) {
        Map<String, List<Grievance>> grievancesByZone = allGrievances.stream()
                .filter(g -> g.getZone() != null && !g.getZone().isEmpty())
                .collect(Collectors.groupingBy(Grievance::getZone));
        
        List<String> redZones = getRedZones(allGrievances);
        
        return grievancesByZone.entrySet().stream()
                .map(entry -> {
                    String zone = entry.getKey();
                    List<Grievance> zoneGrievances = entry.getValue();
                    
                    long resolvedCount = zoneGrievances.stream()
                            .filter(g -> g.getStatus() == GrievanceStatus.RESOLVED)
                            .count();
                    long pendingCount = zoneGrievances.stream()
                            .filter(g -> g.getStatus() == GrievanceStatus.PENDING)
                            .count();
                    long inProgressCount = zoneGrievances.stream()
                            .filter(g -> g.getStatus() == GrievanceStatus.IN_PROGRESS)
                            .count();
                    
                    double avgResolutionDays = zoneGrievances.stream()
                            .filter(g -> g.getResolvedAt() != null)
                            .mapToLong(g -> java.time.temporal.ChronoUnit.DAYS.between(g.getSubmittedAt(), g.getResolvedAt()))
                            .average()
                            .orElse(0.0);
                    
                    // Calculate average coordinates for the zone
                    double avgLat = zoneGrievances.stream()
                            .mapToDouble(Grievance::getLocationLat)
                            .average()
                            .orElse(0.0);
                    
                    double avgLng = zoneGrievances.stream()
                            .mapToDouble(Grievance::getLocationLng)
                            .average()
                            .orElse(0.0);
                    
                    Boolean isRedZone = redZones.contains(zone);
                    
                    return ZoneAnalyticsDTO.builder()
                            .zoneName(zone)
                            .totalGrievances((long) zoneGrievances.size())
                            .resolvedCount(resolvedCount)
                            .pendingCount(pendingCount)
                            .inProgressCount(inProgressCount)
                            .averageResolutionDays(avgResolutionDays)
                            .isRedZone(isRedZone)
                            .latitude(avgLat)
                            .longitude(avgLng)
                            .complaintDensity((double) zoneGrievances.size() / Math.max(1, zoneGrievances.size()))
                            .build();
                })
                .collect(Collectors.toList());
    }
    
    private List<String> getRedZones(List<Grievance> allGrievances) {
        Map<String, Long> zoneComplaintCount = allGrievances.stream()
                .filter(g -> g.getZone() != null && !g.getZone().isEmpty())
                .collect(Collectors.groupingBy(Grievance::getZone, Collectors.counting()));
        
        double averageComplaints = zoneComplaintCount.values().stream()
                .mapToLong(Long::longValue)
                .average()
                .orElse(1.0);
        
        // Red zone threshold: 1.5x average complaints
        double redZoneThreshold = Math.max(1.0, averageComplaints * 1.5);
        
        return zoneComplaintCount.entrySet().stream()
                .filter(e -> e.getValue() >= redZoneThreshold)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }
    
    public SLAMetricsDTO generateSLAMetrics(List<Grievance> allGrievances) {
        // Update SLA status for all grievances
        updateAllSLAStatus(allGrievances);
        
        long onTimeCount = allGrievances.stream()
                .filter(g -> g.getSlaStatus() == SLAStatus.ON_TIME)
                .count();
        long delayedCount = allGrievances.stream()
                .filter(g -> g.getSlaStatus() == SLAStatus.DELAYED)
                .count();
        long overdueCount = allGrievances.stream()
                .filter(g -> g.getSlaStatus() == SLAStatus.OVERDUE)
                .count();
        
        long totalGrievances = allGrievances.size();
        
        double onTimePercentage = totalGrievances > 0 ? (onTimeCount * 100.0) / totalGrievances : 0;
        double delayedPercentage = totalGrievances > 0 ? (delayedCount * 100.0) / totalGrievances : 0;
        double overduePercentage = totalGrievances > 0 ? (overdueCount * 100.0) / totalGrievances : 0;
        
        double avgResolutionHours = allGrievances.stream()
                .filter(g -> g.getResolvedAt() != null && g.getSubmittedAt() != null)
                .mapToLong(g -> java.time.temporal.ChronoUnit.HOURS.between(g.getSubmittedAt(), g.getResolvedAt()))
                .average()
                .orElse(0.0);
        
        return SLAMetricsDTO.builder()
                .totalGrievances((long) totalGrievances)
                .onTimeCount(onTimeCount)
                .delayedCount(delayedCount)
                .overdueCount(overdueCount)
                .onTimePercentage(onTimePercentage)
                .delayedPercentage(delayedPercentage)
                .overduePercentage(overduePercentage)
                .averageResolutionHours(avgResolutionHours)
                .build();
    }
    
    private void updateAllSLAStatus(List<Grievance> grievances) {
        grievances.forEach(g -> {
            if (g.getDeadline() == null) {
                calculateAndSetSLADeadline(g);
            }
            updateSLAStatus(g);
        });
    }
    
    @Transactional
    public void calculateAndSetSLADeadline(Grievance grievance) {
        if (grievance.getDeadline() != null) {
            return;  // Already set
        }
        
        int slaHours = getSLAHoursByPriority(grievance.getPriority());
        grievance.setSlaHours(slaHours);
        grievance.setDeadline(grievance.getSubmittedAt().plusHours(slaHours));
        grievanceRepository.save(grievance);
    }
    
    private int getSLAHoursByPriority(GrievancePriority priority) {
        switch (priority) {
            case URGENT:
                return 4;  // 4 hours SLA
            case HIGH:
                return 24;  // 24 hours SLA
            case MEDIUM:
                return 72;  // 72 hours SLA
            case LOW:
                return 168;  // 7 days SLA
            default:
                return 72;
        }
    }
    
    private void updateSLAStatus(Grievance grievance) {
        if (grievance.getDeadline() == null) {
            grievance.setSlaStatus(SLAStatus.ON_TIME);
            return;
        }
        
        LocalDateTime now = LocalDateTime.now();
        
        if (grievance.getStatus() == GrievanceStatus.RESOLVED) {
            if (grievance.getResolvedAt() != null && grievance.getResolvedAt().isBefore(grievance.getDeadline())) {
                grievance.setSlaStatus(SLAStatus.ON_TIME);
            } else if (grievance.getResolvedAt() != null) {
                grievance.setSlaStatus(SLAStatus.DELAYED);
            }
        } else {
            if (now.isAfter(grievance.getDeadline())) {
                grievance.setSlaStatus(SLAStatus.OVERDUE);
            } else if (now.isAfter(grievance.getDeadline().minusHours(6))) {
                grievance.setSlaStatus(SLAStatus.DELAYED);
            } else {
                grievance.setSlaStatus(SLAStatus.ON_TIME);
            }
        }
    }
    
    private List<HeatMapDTO> generateHeatMapData(List<ZoneAnalyticsDTO> zoneAnalytics) {
        if (zoneAnalytics.isEmpty()) {
            return new java.util.ArrayList<>();
        }
        
        long maxComplaints = zoneAnalytics.stream()
                .mapToLong(ZoneAnalyticsDTO::getTotalGrievances)
                .max()
                .orElse(1);
        
        return zoneAnalytics.stream()
                .map(zone -> {
                    double intensity = zone.getTotalGrievances() * 1.0 / maxComplaints;
                    String status;
                    
                    if (zone.getIsRedZone()) {
                        status = "RED_ZONE";
                    } else if (intensity > 0.6) {
                        status = "AMBER_ZONE";
                    } else {
                        status = "GREEN_ZONE";
                    }
                    
                    return HeatMapDTO.builder()
                            .zoneId(zone.getZoneName().replaceAll("\\s+", "_"))
                            .zoneName(zone.getZoneName())
                            .latitude(zone.getLatitude())
                            .longitude(zone.getLongitude())
                            .complaintCount(zone.getTotalGrievances())
                            .intensity(intensity)
                            .status(status)
                            .build();
                })
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public SLAMetricsDTO getSLAMetricsForOfficer(Long officerId) {
        List<Grievance> officerGrievances = grievanceRepository.findByAssignedOfficerId(officerId);
        return generateSLAMetrics(officerGrievances);
    }
    
    @Transactional(readOnly = true)
    public List<ZoneAnalyticsDTO> getZoneAnalytics() {
        List<Grievance> allGrievances = grievanceRepository.findAll();
        return generateZoneAnalytics(allGrievances);
    }
    
    @Transactional(readOnly = true)
    public List<HeatMapDTO> getHeatMapData() {
        List<Grievance> allGrievances = grievanceRepository.findAll();
        List<ZoneAnalyticsDTO> zoneAnalytics = generateZoneAnalytics(allGrievances);
        return generateHeatMapData(zoneAnalytics);
    }
    
    /**
     * Get comprehensive grievance analysis for all grievances
     */
    @Transactional(readOnly = true)
    public GrievanceAnalyticsDTO getGrievanceAnalysis() {
        List<Grievance> allGrievances = grievanceRepository.findAll();
        return generateGrievanceAnalysis(allGrievances);
    }
    
    /**
     * Get grievance analysis for a specific officer
     */
    @Transactional(readOnly = true)
    public GrievanceAnalyticsDTO getGrievanceAnalysisForOfficer(Long officerId) {
        List<Grievance> officerGrievances = grievanceRepository.findByAssignedOfficerId(officerId);
        return generateGrievanceAnalysis(officerGrievances);
    }
    
    /**
     * Generate grievance analysis from a list of grievances
     */
    private GrievanceAnalyticsDTO generateGrievanceAnalysis(List<Grievance> grievances) {
        if (grievances.isEmpty()) {
            return GrievanceAnalyticsDTO.builder().build();
        }
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = now.toLocalDate().atStartOfDay();
        LocalDateTime weekStart = now.minusDays(7);
        LocalDateTime monthStart = now.minusDays(30);
        
        // Status Distribution
        Map<String, Long> statusDistribution = grievances.stream()
                .collect(Collectors.groupingBy(
                        g -> g.getStatus().toString(),
                        Collectors.counting()
                ));
        
        // Priority Distribution
        Map<String, Long> priorityDistribution = grievances.stream()
                .collect(Collectors.groupingBy(
                        g -> g.getPriority().toString(),
                        Collectors.counting()
                ));
        
        // Category Distribution
        Map<String, Long> categoryDistribution = grievances.stream()
                .collect(Collectors.groupingBy(
                        Grievance::getCategory,
                        Collectors.counting()
                ));
        
        // Time-based counts
        long todayCount = grievances.stream()
                .filter(g -> g.getSubmittedAt().isAfter(todayStart))
                .count();
        
        long weekCount = grievances.stream()
                .filter(g -> g.getSubmittedAt().isAfter(weekStart))
                .count();
        
        long monthCount = grievances.stream()
                .filter(g -> g.getSubmittedAt().isAfter(monthStart))
                .count();
        
        // Status counts
        long totalGrievances = grievances.size();
        long resolvedCount = grievances.stream()
                .filter(g -> g.getStatus() == GrievanceStatus.RESOLVED)
                .count();
        long pendingCount = grievances.stream()
                .filter(g -> g.getStatus() == GrievanceStatus.PENDING)
                .count();
        long inProgressCount = grievances.stream()
                .filter(g -> g.getStatus() == GrievanceStatus.IN_PROGRESS)
                .count();
        long assignedCount = grievances.stream()
                .filter(g -> g.getStatus() == GrievanceStatus.ASSIGNED)
                .count();
        
        // Priority counts
        long highPriorityCount = grievances.stream()
                .filter(g -> g.getPriority() == GrievancePriority.HIGH)
                .count();
        long mediumPriorityCount = grievances.stream()
                .filter(g -> g.getPriority() == GrievancePriority.MEDIUM)
                .count();
        long lowPriorityCount = grievances.stream()
                .filter(g -> g.getPriority() == GrievancePriority.LOW)
                .count();
        
        // Calculate average resolution days
        double averageResolutionDays = grievances.stream()
                .filter(g -> g.getStatus() == GrievanceStatus.RESOLVED && g.getResolvedAt() != null)
                .mapToDouble(g -> java.time.Duration.between(g.getSubmittedAt(), g.getResolvedAt()).toDays())
                .average()
                .orElse(0.0);
        
        // Calculate resolution rate
        double resolutionRate = totalGrievances > 0 ? 
                (resolvedCount * 100.0 / totalGrievances) : 0.0;
        
        // Find top category
        Map.Entry<String, Long> topCategoryEntry = categoryDistribution.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .orElse(null);
        
        String topCategory = topCategoryEntry != null ? topCategoryEntry.getKey() : "N/A";
        Long topCategoryCount = topCategoryEntry != null ? topCategoryEntry.getValue() : 0L;
        
        return GrievanceAnalyticsDTO.builder()
                .statusDistribution(statusDistribution)
                .priorityDistribution(priorityDistribution)
                .categoryDistribution(categoryDistribution)
                .todayCount(todayCount)
                .weekCount(weekCount)
                .monthCount(monthCount)
                .totalGrievances(totalGrievances)
                .resolvedCount(resolvedCount)
                .pendingCount(pendingCount)
                .inProgressCount(inProgressCount)
                .assignedCount(assignedCount)
                .averageResolutionDays(Math.round(averageResolutionDays * 100.0) / 100.0)
                .resolutionRate(Math.round(resolutionRate * 100.0) / 100.0)
                .highPriorityCount(highPriorityCount)
                .mediumPriorityCount(mediumPriorityCount)
                .lowPriorityCount(lowPriorityCount)
                .topCategory(topCategory)
                .topCategoryCount(topCategoryCount)
                .build();
    }
}
