package com.civicpulse.backend.repository;

import com.civicpulse.backend.model.Grievance;
import com.civicpulse.backend.model.GrievanceStatus;
import com.civicpulse.backend.model.SLAStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface GrievanceRepository extends JpaRepository<Grievance, Long> {
    
    Optional<Grievance> findByGrievanceId(String grievanceId);
    
    List<Grievance> findBySubmittedBy(Long userId);
    
    List<Grievance> findByAssignedOfficerId(Long officerId);
    
    List<Grievance> findByStatus(GrievanceStatus status);
    
    List<Grievance> findAllByOrderBySubmittedAtDesc();
    
    // Zone-based queries
    List<Grievance> findByZone(String zone);
    
    List<Grievance> findByZoneAndStatus(String zone, GrievanceStatus status);
    
    @Query("SELECT g FROM Grievance g WHERE g.zone = :zone AND g.submittedAt >= :startDate")
    List<Grievance> findGrievancesByZoneAndDateRange(
            @Param("zone") String zone,
            @Param("startDate") LocalDateTime startDate
    );
    
    // SLA-based queries
    List<Grievance> findBySlaStatus(SLAStatus slaStatus);
    
    @Query("SELECT g FROM Grievance g WHERE g.slaStatus = 'OVERDUE' AND g.status != 'RESOLVED'")
    List<Grievance> findOverdueGrievances();
    
    @Query("SELECT g FROM Grievance g WHERE g.deadline IS NOT NULL AND g.deadline < CURRENT_TIMESTAMP AND g.status != 'RESOLVED'")
    List<Grievance> findGrievancesNearDeadline();
    
    // Category-based queries
    @Query("SELECT DISTINCT g.category FROM Grievance g")
    List<String> findAllCategories();
    
    List<Grievance> findByCategory(String category);
    
    // Red zone detection - zones with high complaint count
    @Query("SELECT g.zone FROM Grievance g GROUP BY g.zone HAVING COUNT(g) > :threshold ORDER BY COUNT(g) DESC")
    List<String> findRedZones(@Param("threshold") Long threshold);
    
    // Zone statistics
    @Query("SELECT g.zone, COUNT(g) FROM Grievance g GROUP BY g.zone")
    List<Object[]> getComplaintCountByZone();
    
    // Average resolution time by zone (in hours) using native DATEDIFF for H2/MySQL compatibility
    @Query(value = "SELECT g.zone, AVG(DATEDIFF('HOUR', g.submitted_at, g.resolved_at)) " +
            "FROM grievances g " +
            "WHERE g.resolved_at IS NOT NULL AND g.zone IS NOT NULL " +
            "GROUP BY g.zone", nativeQuery = true)
    List<Object[]> getAverageResolutionTimeByZone();
}
