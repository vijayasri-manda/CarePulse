package com.hospital.service;

import java.util.List;

import com.hospital.entity.Bill;

public interface BillService {

    Bill saveBill(Bill bill);

    List<Bill> getAllBills();

    Bill getBillById(Long id);

    void deleteBill(Long id);
}