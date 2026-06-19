package com.hospital.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "doctor")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", unique = true)
    private User user;

    @Transient
    private String username;

    private String name;

    private String specialization;

    private Integer experience;

    private String phone;

    private String department;

    @Column(name = "cases_solved")
    private Integer casesSolved = 0;

    public Doctor() {
        this.casesSolved = 0;
    }

    public Doctor(Long id, User user, String username, String name, String specialization, Integer experience, String phone, String department) {
        this.id = id;
        this.user = user;
        this.username = username;
        this.name = name;
        this.specialization = specialization;
        this.experience = experience;
        this.phone = phone;
        this.department = department;
        this.casesSolved = 0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getUsername() {
        return user != null ? user.getUsername() : username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public Integer getExperience() {
        return experience;
    }

    public void setExperience(Integer experience) {
        this.experience = experience;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Integer getCasesSolved() {
        return casesSolved != null ? casesSolved : 0;
    }

    public void setCasesSolved(Integer casesSolved) {
        this.casesSolved = casesSolved;
    }
}