package com.hospital.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.hospital.dto.DashboardResponse;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.BillRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private BillRepository billRepository;

    @GetMapping
    public DashboardResponse getDashboardData() {

        long totalPatients = patientRepository.count();

        long totalDoctors = doctorRepository.count();

        long totalAppointments = appointmentRepository.count();

        double totalRevenue = billRepository.getTotalRevenue();

        return new DashboardResponse(
                totalPatients,
                totalDoctors,
                totalAppointments,
                totalRevenue);
    }
}