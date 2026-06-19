package com.hospital.service;

import java.util.List;
import java.util.Optional;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.AccessDeniedException;

import com.hospital.entity.Prescription;
import com.hospital.entity.Patient;
import com.hospital.entity.Doctor;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.PrescriptionRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.DoctorRepository;

@Service
public class PrescriptionServiceImpl implements PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

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
                throw new AccessDeniedException("Access Denied: You do not own this prescription");
            }
        }
    }

    @Override
    public Prescription savePrescription(Prescription prescription) {
        if (prescription.getPatient() != null) {
            Patient patient = patientRepository.findById(prescription.getPatient().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
            prescription.setPatient(patient);
        }
        if (prescription.getDoctor() != null) {
            Doctor doctor = doctorRepository.findById(prescription.getDoctor().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
            prescription.setDoctor(doctor);
        }
        return prescriptionRepository.save(prescription);
    }

    @Override
    public List<Prescription> getAllPrescriptions() {
        if (isPatient()) {
            Optional<Patient> pOpt = patientRepository.findByUserUsername(getCurrentUsername());
            if (pOpt.isEmpty()) {
                return Collections.emptyList();
            }
            return prescriptionRepository.findByPatientId(pOpt.get().getId());
        }
        return prescriptionRepository.findAll();
    }

    @Override
    public Prescription getPrescriptionById(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id " + id));

        if (prescription.getPatient() != null) {
            verifyPatientOwnership(prescription.getPatient().getId());
        }
        return prescription;
    }

    @Override
    public void deletePrescription(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id " + id));

        if (prescription.getPatient() != null) {
            verifyPatientOwnership(prescription.getPatient().getId());
        }
        prescriptionRepository.delete(prescription);
    }
}