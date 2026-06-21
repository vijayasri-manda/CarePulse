# CarePulse - Healthcare Management System

## 🏥 Overview

CarePulse is a modern healthcare management platform designed to streamline patient management, appointment scheduling, doctor administration, and healthcare services. The system provides a secure and user-friendly environment for patients, doctors, and administrators.

The application enables healthcare organizations to efficiently manage patient records, appointments, medical information, and healthcare operations through a centralized platform.

---

## 🚀 Features

### 👨‍⚕️ Patient Management

* Patient Registration
* Patient Profile Management
* View Medical History
* Update Personal Information
* Secure Authentication

### 📅 Appointment Management

* Book Appointments Online
* Reschedule Appointments
* Cancel Appointments
* View Appointment History
* Appointment Status Tracking

### 🩺 Doctor Management

* Doctor Registration
* Manage Doctor Profiles
* Specialization Management
* Availability Scheduling
* Doctor Dashboard

### 🔐 Authentication & Security

* JWT Authentication
* Role-Based Authorization
* Secure Password Encryption
* Protected APIs
* Session Management

### 📊 Admin Dashboard

* Manage Patients
* Manage Doctors
* View Appointments
* Generate Reports
* Monitor System Activities

### 📱 Responsive Design

* Mobile Friendly Interface
* Modern UI/UX
* Interactive Dashboards
* Cross-Browser Compatibility

---

## 🛠️ Technology Stack

### Frontend

* React.js
* HTML5
* CSS3
* JavaScript (ES6+)
* Axios
* React Router

### Backend

* Spring Boot
* Spring Security
* Spring Data JPA
* Hibernate
* JWT Authentication

### Database

* MySQL

### Build Tools

* Maven
* npm

### Version Control

* Git
* GitHub

---

## 📂 Project Structure

```text
CarePulse/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── backend/
│   ├── src/main/java/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── model/
│   │   ├── security/
│   │   └── exception/
│   │
│   ├── src/main/resources/
│   │   └── application.properties
│   │
│   └── pom.xml
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/carepulse.git
cd carepulse
```

---

## Backend Setup

### Configure MySQL

Create a database:

```sql
CREATE DATABASE carepulse;
```

Update `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/carepulse
spring.datasource.username=root
spring.datasource.password=root

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### Run Backend

```bash
cd backend
mvn spring-boot:run
```

Server will start on:

```text
http://localhost:8080
```

---

## Frontend Setup

Install dependencies:

```bash
cd frontend
npm install
```

Start React Application:

```bash
npm start
```

Frontend runs on:

```text
http://localhost:3000
```

---

## 🔑 API Endpoints

### Authentication

| Method | Endpoint           | Description   |
| ------ | ------------------ | ------------- |
| POST   | /api/auth/register | Register User |
| POST   | /api/auth/login    | Login User    |

### Patients

| Method | Endpoint           |
| ------ | ------------------ |
| GET    | /api/patients      |
| GET    | /api/patients/{id} |
| POST   | /api/patients      |
| PUT    | /api/patients/{id} |
| DELETE | /api/patients/{id} |

### Doctors

| Method | Endpoint          |
| ------ | ----------------- |
| GET    | /api/doctors      |
| POST   | /api/doctors      |
| PUT    | /api/doctors/{id} |
| DELETE | /api/doctors/{id} |

### Appointments

| Method | Endpoint               |
| ------ | ---------------------- |
| GET    | /api/appointments      |
| POST   | /api/appointments      |
| PUT    | /api/appointments/{id} |
| DELETE | /api/appointments/{id} |

---

## 📸 Screenshots

### Home Page

* Modern Healthcare Dashboard
* Patient Statistics
* Appointment Overview

### Patient Portal

* Patient Registration
* Medical Records
* Appointment Tracking

### Admin Dashboard

* User Management
* Doctor Management
* System Analytics

---

## 🔮 Future Enhancements

* AI-Based Health Recommendations
* Video Consultation
* Online Payments
* Prescription Management
* Email Notifications
* SMS Alerts
* Medical Report Uploads
* Telemedicine Support

---

## 🤝 Contributing

1. Fork the Repository
2. Create a Feature Branch
3. Commit Changes
4. Push to GitHub
5. Create a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👩‍💻 Author

**Vijaya Sri Manda**

Final Year B.Tech Student (AI & Data Science)

Seshadri Rao Gudlavalleru Engineering College

Passionate Full Stack Developer | Java Developer | AI Enthusiast

---

⭐ If you like this project, don't forget to star the repository!
