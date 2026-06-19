package com.hospital.service;

import java.util.List;
import java.util.Optional;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.AccessDeniedException;

import com.hospital.entity.Bill;
import com.hospital.entity.Patient;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.BillRepository;
import com.hospital.repository.PatientRepository;

@Service
public class BillServiceImpl implements BillService {

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private PatientRepository patientRepository;

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
                throw new AccessDeniedException("Access Denied: You do not own this bill");
            }
        }
    }

    @Override
    public Bill saveBill(Bill bill) {
        // Fetch complete patient from database
        Patient patient = patientRepository
                .findById(bill.getPatient().getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Patient not found"));

        bill.setPatient(patient);

        // Calculate total amount safely
        double consult = bill.getConsultationFee() != null ? bill.getConsultationFee() : 0.0;
        double meds = bill.getMedicineCharges() != null ? bill.getMedicineCharges() : 0.0;
        double lab = bill.getLabCharges() != null ? bill.getLabCharges() : 0.0;

        bill.setTotalAmount(consult + meds + lab);

        return billRepository.save(bill);
    }

    @Override
    public List<Bill> getAllBills() {
        if (isPatient()) {
            Optional<Patient> pOpt = patientRepository.findByUserUsername(getCurrentUsername());
            if (pOpt.isEmpty()) {
                return Collections.emptyList();
            }
            return billRepository.findByPatientId(pOpt.get().getId());
        }
        return billRepository.findAll();
    }

    @Override
    public Bill getBillById(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id " + id));

        if (bill.getPatient() != null) {
            verifyPatientOwnership(bill.getPatient().getId());
        }
        return bill;
    }

    @Override
    public void deleteBill(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with id " + id));

        if (bill.getPatient() != null) {
            verifyPatientOwnership(bill.getPatient().getId());
        }
        billRepository.delete(bill);
    }
}