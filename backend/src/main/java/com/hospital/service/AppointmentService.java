package com.hospital.service;

import java.util.List;
import com.hospital.entity.Appointment;

public interface AppointmentService {

    Appointment saveAppointment(Appointment appointment);

    List<Appointment> getAllAppointments();

    Appointment getAppointmentById(Long id);

    void deleteAppointment(Long id);

    Appointment updateAppointment(Long id, Appointment appointment);
}