package com.hospital.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hospital.entity.Doctor;
import com.hospital.entity.User;
import com.hospital.entity.Appointment;
import com.hospital.entity.Prescription;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.UserRepository;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.PrescriptionRepository;

@Service
public class DoctorServiceImpl implements DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Override
    public Doctor saveDoctor(Doctor doctor) {
        if (doctor.getUsername() != null) {
            User user = userRepository.findByUsername(doctor.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with username " + doctor.getUsername()));
            doctor.setUser(user);
        }
        if (doctor.getCasesSolved() == null) {
            doctor.setCasesSolved(0);
        }
        return doctorRepository.save(doctor);
    }

    @Override
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    @Override
    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id " + id));
    }

    @Override
    public Doctor updateDoctor(Long id, Doctor doctor) {
        Doctor existingDoctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id " + id));

        existingDoctor.setName(doctor.getName());
        existingDoctor.setSpecialization(doctor.getSpecialization());
        existingDoctor.setExperience(doctor.getExperience());
        existingDoctor.setPhone(doctor.getPhone());
        existingDoctor.setDepartment(doctor.getDepartment());
        
        if (doctor.getCasesSolved() != null) {
            existingDoctor.setCasesSolved(doctor.getCasesSolved());
        }

        if (doctor.getUsername() != null) {
            User user = userRepository.findByUsername(doctor.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with username " + doctor.getUsername()));
            existingDoctor.setUser(user);
        }

        return doctorRepository.save(existingDoctor);
    }

    @Override
    @Transactional
    public void deleteDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id " + id));

        // Cascade delete appointments
        List<Appointment> appointments = appointmentRepository.findAll();
        for (Appointment appt : appointments) {
            if (appt.getDoctor() != null && appt.getDoctor().getId().equals(id)) {
                appointmentRepository.delete(appt);
            }
        }

        // Cascade delete prescriptions
        List<Prescription> prescriptions = prescriptionRepository.findAll();
        for (Prescription prescription : prescriptions) {
            if (prescription.getDoctor() != null && prescription.getDoctor().getId().equals(id)) {
                prescriptionRepository.delete(prescription);
            }
        }

        doctorRepository.delete(doctor);
    }
}