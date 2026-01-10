package com.civicpulse.backend.config;

import com.civicpulse.backend.filter.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {
    
    private final JwtAuthFilter jwtAuthFilter;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Interceptors can be added here if needed
    }
}
