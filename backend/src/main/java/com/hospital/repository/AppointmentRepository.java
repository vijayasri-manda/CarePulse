package com.hospital.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.hospital.entity.Appointment;

public interface AppointmentRepository
        extends JpaRepository<Appointment, Long> {

    @Query("SELECT COUNT(a) FROM Appointment a")
    long getTotalAppointments();

    java.util.List<Appointment> findByPatientId(Long patientId);

    boolean existsByDoctorIdAndAppointmentDate(Long doctorId, java.time.LocalDateTime date);

    boolean existsByDoctorIdAndAppointmentDateAndIdNot(Long doctorId, java.time.LocalDateTime date, Long id);
}