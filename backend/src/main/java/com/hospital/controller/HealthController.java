package com.hospital.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hospital.repository.UserRepository;

@RestController
public class HealthController {

    private final UserRepository userRepository;

    public HealthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        long userCount = userRepository.count();

        return Map.of(
                "status", "UP",
                "database", "UP",
                "users", userCount);
    }
}
