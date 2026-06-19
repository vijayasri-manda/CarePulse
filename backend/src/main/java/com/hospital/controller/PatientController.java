package com.hospital.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.hospital.entity.Patient;
import com.hospital.service.PatientService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/patients")
@Tag(name = "Patient Controller",
     description = "Patient Management APIs")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @Operation(summary = "Create New Patient")
    @PostMapping
    public Patient savePatient(
            @Valid @RequestBody Patient patient) {

        return patientService.savePatient(patient);
    }

    @Operation(summary = "Get All Patients")
    @GetMapping
    public List<Patient> getAllPatients() {

        return patientService.getAllPatients();
    }

    @Operation(summary = "Get Patient By ID")
    @GetMapping("/{id}")
    public Patient getPatientById(
            @PathVariable Long id) {

        return patientService.getPatientById(id);
    }

    @Operation(summary = "Update Patient")
    @PutMapping("/{id}")
    public Patient updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody Patient patient) {

        return patientService.updatePatient(id, patient);
    }

    @Operation(summary = "Delete Patient")
    @DeleteMapping("/{id}")
    public String deletePatient(
            @PathVariable Long id) {

        patientService.deletePatient(id);

        return "Patient Deleted Successfully";
    }

    @Operation(summary = "Test API")
    @GetMapping("/test")
    public String test() {

        return "Controller Working";
    }
}