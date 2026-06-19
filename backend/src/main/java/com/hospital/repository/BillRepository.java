package com.hospital.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.hospital.entity.Bill;

public interface BillRepository
        extends JpaRepository<Bill, Long> {

    @Query("SELECT COALESCE(SUM(b.totalAmount),0) FROM Bill b")
    double getTotalRevenue();

    java.util.List<Bill> findByPatientId(Long patientId);
}