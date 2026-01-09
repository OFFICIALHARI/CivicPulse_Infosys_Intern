package com.civicpulse.backend.repository;

import com.civicpulse.backend.model.Grievance;
import com.civicpulse.backend.model.GrievanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GrievanceRepository extends JpaRepository<Grievance, Long> {
    
    Optional<Grievance> findByGrievanceId(String grievanceId);
    
    List<Grievance> findBySubmittedBy(Long userId);
    
    List<Grievance> findByAssignedOfficerId(Long officerId);
    
    List<Grievance> findByStatus(GrievanceStatus status);
    
    List<Grievance> findAllByOrderBySubmittedAtDesc();
}
