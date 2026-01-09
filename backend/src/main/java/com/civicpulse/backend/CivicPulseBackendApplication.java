package com.civicpulse.backend;

import com.civicpulse.backend.model.*;
import com.civicpulse.backend.repository.GrievanceRepository;
import com.civicpulse.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDateTime;

@SpringBootApplication
@RequiredArgsConstructor
public class CivicPulseBackendApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(CivicPulseBackendApplication.class, args);
    }
    
    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, GrievanceRepository grievanceRepository) {
        return args -> {
            // Initialize mock users
            User citizen = User.builder()
                    .name("Citizen User")
                    .email("citizen@civicpulse.com")
                    .role(UserRole.CITIZEN)
                    .password("password")
                    .build();
            
            User admin = User.builder()
                    .name("Super Admin")
                    .email("admin@civicpulse.com")
                    .role(UserRole.ADMIN)
                    .password("password")
                    .build();
            
            User officer1 = User.builder()
                    .name("John Doe (Roads)")
                    .email("roads@civicpulse.com")
                    .role(UserRole.OFFICER)
                    .department("Road Maintenance")
                    .password("password")
                    .build();
            
            User officer2 = User.builder()
                    .name("Jane Smith (Waste)")
                    .email("waste@civicpulse.com")
                    .role(UserRole.OFFICER)
                    .department("Waste Management")
                    .password("password")
                    .build();
            
            userRepository.save(citizen);
            userRepository.save(admin);
            userRepository.save(officer1);
            userRepository.save(officer2);
            
            System.out.println("✅ Database initialized with mock users");
            System.out.println("🚀 CivicPulse Backend is running on http://localhost:8080/api");
            System.out.println("📊 H2 Console available at http://localhost:8080/api/h2-console");
        };
    }
}
