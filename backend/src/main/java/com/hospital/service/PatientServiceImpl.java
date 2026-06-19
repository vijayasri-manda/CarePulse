package com.hospital.service;

import java.util.List;
import java.util.Optional;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.AccessDeniedException;

import com.hospital.entity.Patient;
import com.hospital.entity.User;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;

@Service
public class PatientServiceImpl implements PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

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

    private void verifyPatientProfileOwnership(Long patientId) {
        if (isPatient()) {
            Patient currentPatient = patientRepository.findByUserUsername(getCurrentUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient profile not completed"));
            if (!currentPatient.getId().equals(patientId)) {
                throw new AccessDeniedException("Access Denied: You do not own this profile");
            }
        }
    }

    @Override
    public Patient savePatient(Patient patient) {
        if (patient.getUsername() != null) {
            User user = userRepository.findByUsername(patient.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with username " + patient.getUsername()));
            patient.setUser(user);
        }
        return patientRepository.save(patient);
    }

    @Override
    public List<Patient> getAllPatients() {
        if (isPatient()) {
            Optional<Patient> pOpt = patientRepository.findByUserUsername(getCurrentUsername());
            if (pOpt.isPresent()) {
                return List.of(pOpt.get());
            } else {
                return Collections.emptyList();
            }
        }
        return patientRepository.findAll();
    }

    @Override
    public Patient getPatientById(Long id) {
        verifyPatientProfileOwnership(id);
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id " + id));
    }

    @Override
    public Patient updatePatient(Long id, Patient patient) {
        verifyPatientProfileOwnership(id);
        Patient existingPatient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id " + id));

        existingPatient.setName(patient.getName());
        existingPatient.setAge(patient.getAge());
        existingPatient.setGender(patient.getGender());
        existingPatient.setPhone(patient.getPhone());
        existingPatient.setAddress(patient.getAddress());
        existingPatient.setBloodGroup(patient.getBloodGroup());
        existingPatient.setInsuranceProvider(patient.getInsuranceProvider());

        if (patient.getUsername() != null) {
            User user = userRepository.findByUsername(patient.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with username " + patient.getUsername()));
            existingPatient.setUser(user);
        }

        return patientRepository.save(existingPatient);
    }

    @Override
    public void deletePatient(Long id) {
        verifyPatientProfileOwnership(id);
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id " + id));
        patientRepository.delete(patient);
    }
}