package com.hospital.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.hospital.entity.Prescription;

public interface PrescriptionRepository
        extends JpaRepository<Prescription, Long> {

    java.util.List<Prescription> findByPatientId(Long patientId);
}