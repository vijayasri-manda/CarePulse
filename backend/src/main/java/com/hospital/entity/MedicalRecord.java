package com.hospital.entity;

import jakarta.persistence.*;

@Entity
@Table(name="medical_record")
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String diagnosis;

    private String treatment;

    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd")
    private java.time.LocalDate recordDate;

    @ManyToOne
    @JoinColumn(name="patient_id")
    private Patient patient;

    @Lob
    @Column(name = "report_pdf", columnDefinition = "LONGTEXT")
    private String reportPdf;

    private String reportName;

    public MedicalRecord() {
    }

    public MedicalRecord(Long id, String diagnosis, String treatment, java.time.LocalDate recordDate, Patient patient, String reportPdf, String reportName) {
        this.id = id;
        this.diagnosis = diagnosis;
        this.treatment = treatment;
        this.recordDate = recordDate;
        this.patient = patient;
        this.reportPdf = reportPdf;
        this.reportName = reportName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getTreatment() {
        return treatment;
    }

    public void setTreatment(String treatment) {
        this.treatment = treatment;
    }

    public java.time.LocalDate getRecordDate() {
        return recordDate;
    }

    public void setRecordDate(java.time.LocalDate recordDate) {
        this.recordDate = recordDate;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public String getReportPdf() {
        return reportPdf;
    }

    public void setReportPdf(String reportPdf) {
        this.reportPdf = reportPdf;
    }

    public String getReportName() {
        return reportName;
    }

    public void setReportName(String reportName) {
        this.reportName = reportName;
    }
}