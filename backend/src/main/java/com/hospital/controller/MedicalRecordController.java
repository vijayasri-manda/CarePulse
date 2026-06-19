package com.hospital.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.hospital.entity.MedicalRecord;
import com.hospital.service.MedicalRecordService;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    @Autowired
    private MedicalRecordService medicalRecordService;

    @PostMapping
    public MedicalRecord saveMedicalRecord(
            @RequestBody MedicalRecord medicalRecord) {

        return medicalRecordService.saveMedicalRecord(medicalRecord);
    }

    @GetMapping
    public List<MedicalRecord> getAllMedicalRecords() {

        return medicalRecordService.getAllMedicalRecords();
    }

    @GetMapping("/{id}")
    public MedicalRecord getMedicalRecordById(
            @PathVariable Long id) {

        return medicalRecordService.getMedicalRecordById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteMedicalRecord(
            @PathVariable Long id) {

        medicalRecordService.deleteMedicalRecord(id);

        return "Medical Record Deleted Successfully";
    }
}