package com.hospital.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Collections;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.AccessDeniedException;

import com.hospital.entity.Appointment;
import com.hospital.entity.Patient;
import com.hospital.entity.Doctor;
import com.hospital.entity.Bill;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.exception.ConflictingAppointmentException;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.BillRepository;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private BillRepository billRepository;

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
                throw new AccessDeniedException("Access Denied: You do not own this appointment");
            }
        }
    }

    private void createBillForAppointment(Appointment appointment) {
        if (appointment.getPatient() != null) {
            Bill bill = new Bill();
            bill.setPatient(appointment.getPatient());
            
            double consultFee = 50.0;
            if (appointment.getDoctor() != null && appointment.getDoctor().getExperience() != null) {
                consultFee = Math.max(50.0, appointment.getDoctor().getExperience() * 10.0);
            }
            bill.setConsultationFee(consultFee);
            bill.setMedicineCharges(0.0);
            bill.setLabCharges(0.0);
            bill.setTotalAmount(consultFee);
            bill.setPaymentStatus("Pending");
            
            billRepository.save(bill);
        }
    }

    @Override
    public Appointment saveAppointment(Appointment appointment) {
        if (isPatient()) {
            Patient patient = patientRepository.findByUserUsername(getCurrentUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient profile not completed"));
            appointment.setPatient(patient);
        } else if (appointment.getPatient() != null) {
            Patient patient = patientRepository.findById(appointment.getPatient().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
            appointment.setPatient(patient);
        }

        if (appointment.getDoctor() != null) {
            Doctor doctor = doctorRepository.findById(appointment.getDoctor().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
            appointment.setDoctor(doctor);
        }

        if (appointment.getDoctor() != null && appointment.getAppointmentDate() != null) {
            boolean conflicting = appointmentRepository.existsByDoctorIdAndAppointmentDate(
                    appointment.getDoctor().getId(), appointment.getAppointmentDate());
            if (conflicting) {
                throw new ConflictingAppointmentException("Doctor is already booked at this time");
            }
        }

        Appointment savedAppt = appointmentRepository.save(appointment);
        if ("Completed".equals(savedAppt.getStatus())) {
            Doctor doctor = savedAppt.getDoctor();
            if (doctor != null) {
                doctor.setCasesSolved((doctor.getCasesSolved() != null ? doctor.getCasesSolved() : 0) + 1);
                doctorRepository.save(doctor);
            }
            createBillForAppointment(savedAppt);
        }
        return savedAppt;
    }

    @Override
    public List<Appointment> getAllAppointments() {
        if (isPatient()) {
            Optional<Patient> pOpt = patientRepository.findByUserUsername(getCurrentUsername());
            if (pOpt.isEmpty()) {
                return Collections.emptyList();
            }
            return appointmentRepository.findByPatientId(pOpt.get().getId());
        }
        return appointmentRepository.findAll();
    }

    @Override
    public Appointment getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id " + id));
        
        if (appointment.getPatient() != null) {
            verifyPatientOwnership(appointment.getPatient().getId());
        }
        return appointment;
    }

    @Override
    public void deleteAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id " + id));

        if (appointment.getPatient() != null) {
            verifyPatientOwnership(appointment.getPatient().getId());
        }
        
        // If deleting a Completed appointment, decrement Cases Solved
        if ("Completed".equals(appointment.getStatus())) {
            Doctor doctor = appointment.getDoctor();
            if (doctor != null) {
                int currentSolved = doctor.getCasesSolved() != null ? doctor.getCasesSolved() : 0;
                doctor.setCasesSolved(Math.max(0, currentSolved - 1));
                doctorRepository.save(doctor);
            }
        }
        appointmentRepository.delete(appointment);
    }

    @Override
    public Appointment updateAppointment(Long id, Appointment appointment) {
        Appointment existingAppointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id " + id));

        if (existingAppointment.getPatient() != null) {
            verifyPatientOwnership(existingAppointment.getPatient().getId());
        }

        if (appointment.getDoctor() != null && appointment.getAppointmentDate() != null) {
            boolean conflicting = appointmentRepository.existsByDoctorIdAndAppointmentDateAndIdNot(
                    appointment.getDoctor().getId(), appointment.getAppointmentDate(), id);
            if (conflicting) {
                throw new ConflictingAppointmentException("Doctor is already booked at this time");
            }
        }

        existingAppointment.setAppointmentDate(appointment.getAppointmentDate());
        
        boolean statusTransitionedToCompleted = "Completed".equals(appointment.getStatus()) && !"Completed".equals(existingAppointment.getStatus());
        boolean statusTransitionedFromCompleted = !"Completed".equals(appointment.getStatus()) && "Completed".equals(existingAppointment.getStatus());
        
        existingAppointment.setStatus(appointment.getStatus());
        
        if (!isPatient() && appointment.getPatient() != null) {
            Patient patient = patientRepository.findById(appointment.getPatient().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
            existingAppointment.setPatient(patient);
        }
        if (appointment.getDoctor() != null) {
            Doctor doctor = doctorRepository.findById(appointment.getDoctor().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
            existingAppointment.setDoctor(doctor);
        }

        Appointment savedAppt = appointmentRepository.save(existingAppointment);
        if (statusTransitionedToCompleted) {
            Doctor doctor = savedAppt.getDoctor();
            if (doctor != null) {
                doctor.setCasesSolved((doctor.getCasesSolved() != null ? doctor.getCasesSolved() : 0) + 1);
                doctorRepository.save(doctor);
            }
            createBillForAppointment(savedAppt);
        } else if (statusTransitionedFromCompleted) {
            Doctor doctor = savedAppt.getDoctor();
            if (doctor != null) {
                int currentSolved = doctor.getCasesSolved() != null ? doctor.getCasesSolved() : 0;
                doctor.setCasesSolved(Math.max(0, currentSolved - 1));
                doctorRepository.save(doctor);
            }
        }
        return savedAppt;
    }
}