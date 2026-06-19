package com.hospital.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "bill")
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double consultationFee;

    private Double medicineCharges;

    private Double labCharges;

    private Double totalAmount;

    private String paymentStatus;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    public Bill() {
    }

    public Bill(Long id, Double consultationFee, Double medicineCharges, Double labCharges, Double totalAmount, String paymentStatus, Patient patient) {
        this.id = id;
        this.consultationFee = consultationFee;
        this.medicineCharges = medicineCharges;
        this.labCharges = labCharges;
        this.totalAmount = totalAmount;
        this.paymentStatus = paymentStatus;
        this.patient = patient;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(Double consultationFee) {
        this.consultationFee = consultationFee;
    }

    public Double getMedicineCharges() {
        return medicineCharges;
    }

    public void setMedicineCharges(Double medicineCharges) {
        this.medicineCharges = medicineCharges;
    }

    public Double getLabCharges() {
        return labCharges;
    }

    public void setLabCharges(Double labCharges) {
        this.labCharges = labCharges;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }
}