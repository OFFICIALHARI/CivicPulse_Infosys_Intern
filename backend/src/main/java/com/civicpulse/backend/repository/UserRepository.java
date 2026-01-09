package com.civicpulse.backend.repository;

import com.civicpulse.backend.model.User;
import com.civicpulse.backend.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmailAndRole(String email, UserRole role);
    
    List<User> findByRole(UserRole role);
    
    boolean existsByEmailAndRole(String email, UserRole role);
}
