package com.hospital.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.hospital.entity.Patient;

public interface PatientRepository
        extends JpaRepository<Patient, Long> {

    @Query("SELECT COUNT(p) FROM Patient p")
    long getTotalPatients();

    java.util.Optional<Patient> findByUserUsername(String username);
}