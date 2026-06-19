package com.hospital.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.BillRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private BillRepository billRepository;

    @GetMapping("/summary")
    public Map<String, Object> getSummary() {

        Map<String, Object> report =
                new HashMap<>();

        report.put(
                "totalPatients",
                patientRepository.getTotalPatients());

        report.put(
                "totalDoctors",
                doctorRepository.getTotalDoctors());

        report.put(
                "totalAppointments",
                appointmentRepository.getTotalAppointments());

        report.put(
                "totalRevenue",
                billRepository.getTotalRevenue());

        return report;
    }
}