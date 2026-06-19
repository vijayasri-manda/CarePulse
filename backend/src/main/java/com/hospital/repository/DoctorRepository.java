package com.hospital.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.hospital.entity.Doctor;

public interface DoctorRepository
        extends JpaRepository<Doctor, Long> {

    @Query("SELECT COUNT(d) FROM Doctor d")
    long getTotalDoctors();

    java.util.Optional<Doctor> findByUserUsername(String username);
}