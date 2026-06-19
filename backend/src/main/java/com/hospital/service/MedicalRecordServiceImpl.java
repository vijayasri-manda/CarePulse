package com.hospital.service;

import java.util.List;
import java.util.Optional;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.AccessDeniedException;

import com.hospital.entity.MedicalRecord;
import com.hospital.entity.Patient;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.MedicalRecordRepository;
import com.hospital.repository.PatientRepository;

@Service
public class MedicalRecordServiceImpl implements MedicalRecordService {

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private PatientRepository patientRepository;

    private boolean isPatient() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT") || a.getAuthority().equals("PATIENT"));
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : null;
    }

    private void verifyPatientOwnership(Long recordPatientId) {
        if (isPatient()) {
            Patient patient = patientRepository.findByUserUsername(getCurrentUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient profile not completed"));
            if (!patient.getId().equals(recordPatientId)) {
                throw new AccessDeniedException("Access Denied: You do not own this medical record");
            }
        }
    }

    @Override
    public MedicalRecord saveMedicalRecord(MedicalRecord medicalRecord) {
        if (medicalRecord.getPatient() != null) {
            Patient patient = patientRepository.findById(medicalRecord.getPatient().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
            medicalRecord.setPatient(patient);
        }
        return medicalRecordRepository.save(medicalRecord);
    }

    @Override
    public List<MedicalRecord> getAllMedicalRecords() {
        if (isPatient()) {
            Optional<Patient> pOpt = patientRepository.findByUserUsername(getCurrentUsername());
            if (pOpt.isEmpty()) {
                return Collections.emptyList();
            }
            return medicalRecordRepository.findByPatientId(pOpt.get().getId());
        }
        return medicalRecordRepository.findAll();
    }

    @Override
    public MedicalRecord getMedicalRecordById(Long id) {
        MedicalRecord medicalRecord = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found with id " + id));

        if (medicalRecord.getPatient() != null) {
            verifyPatientOwnership(medicalRecord.getPatient().getId());
        }
        return medicalRecord;
    }

    @Override
    public void deleteMedicalRecord(Long id) {
        MedicalRecord medicalRecord = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found with id " + id));

        if (medicalRecord.getPatient() != null) {
            verifyPatientOwnership(medicalRecord.getPatient().getId());
        }
        medicalRecordRepository.delete(medicalRecord);
    }
}