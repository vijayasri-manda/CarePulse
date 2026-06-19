package com.hospital.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.hospital.entity.Bill;
import com.hospital.service.BillService;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    @Autowired
    private BillService billService;

    @PostMapping
    public Bill saveBill(@RequestBody Bill bill) {

        return billService.saveBill(bill);
    }

    @GetMapping
    public List<Bill> getAllBills() {

        return billService.getAllBills();
    }

    @GetMapping("/{id}")
    public Bill getBillById(@PathVariable Long id) {

        return billService.getBillById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteBill(@PathVariable Long id) {

        billService.deleteBill(id);

        return "Bill Deleted Successfully";
    }
}