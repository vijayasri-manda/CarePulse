package com.hospital.service;

import java.util.List;
import com.hospital.entity.MedicalRecord;

public interface MedicalRecordService {

    MedicalRecord saveMedicalRecord(MedicalRecord medicalRecord);

    List<MedicalRecord> getAllMedicalRecords();

    MedicalRecord getMedicalRecordById(Long id);

    void deleteMedicalRecord(Long id);
}