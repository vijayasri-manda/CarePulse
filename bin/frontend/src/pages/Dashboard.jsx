import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  DollarSign, 
  Activity, 
  CalendarCheck, 
  HeartHandshake,
  ClipboardList,
  FileText,
  FolderHeart,
  UserPlus,
  CheckCircle
} from 'lucide-react';

const getNameFromEmail = (email) => {
  if (!email) return 'User';
  const namePart = email.includes('@') ? email.split('@')[0] : email;
  const cleanName = namePart.replace(/\d/g, '');
  if (!cleanName.trim()) return 'User';
  return cleanName
    .split(/[._-]/)
    .filter(Boolean)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
};

export default function Dashboard({ showToast, setActiveTab }) {
  const { username, role, isPatient, isDoctor, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [selectedOffer, setSelectedOffer] = useState(() => {
    try {
      const saved = localStorage.getItem('selectedOffer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [data, setData] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalRevenue: 0.0
  });
  
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for profile completion forms
  const [profileData, setProfileData] = useState({
    name: username,
    age: '',
    gender: 'Male',
    phone: '',
    address: '',
    bloodGroup: 'O+',
    insuranceProvider: '',
    specialization: '',
    experience: '',
    department: ''
  });

  const fetchAllDashboardData = async () => {
    try {
      setLoading(true);
      
      if (isAdmin) {
        try {
          const res = await api.dashboard.getData();
          setData(res);
        } catch (e) {
          console.error("Admin stats fetch failed, falling back", e);
        }
      }
      
      const [pts, docs, appts, rxs, invoices, mrRecords] = await Promise.all([
        api.patients.getAll().catch(() => []),
        api.doctors.getAll().catch(() => []),
        api.appointments.getAll().catch(() => []),
        api.prescriptions.getAll().catch(() => []),
        api.bills.getAll().catch(() => []),
        api.medicalRecords.getAll().catch(() => [])
      ]);
      
      setPatients(pts);
      setDoctors(docs);
      setAppointments(appts);
      setPrescriptions(rxs);
      setBills(invoices);
      setMedicalRecords(mrRecords);
    } catch (err) {
      showToast('Error loading dashboard: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.resolve();
      fetchAllDashboardData();
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCleanRole = () => {
    if (!role) return '';
    return role.replace('ROLE_', '');
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePatientProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      showToast('Patient full name is required', 'error');
      return;
    }
    if (!profileData.age || isNaN(profileData.age) || parseInt(profileData.age) <= 0) {
      showToast('Please enter a valid age', 'error');
      return;
    }
    if (!profileData.phone.trim() || profileData.phone.length !== 10) {
      showToast('Phone number must be exactly 10 digits', 'error');
      return;
    }

    try {
      const payload = {
        name: profileData.name,
        age: parseInt(profileData.age),
        gender: profileData.gender,
        phone: profileData.phone,
        address: profileData.address,
        bloodGroup: profileData.bloodGroup,
        insuranceProvider: profileData.insuranceProvider,
        username: username
      };

      await api.patients.create(payload);
      showToast('Medical Patient Profile saved successfully!', 'success');
      fetchAllDashboardData();
    } catch (err) {
      showToast('Profile save failed: ' + err.message, 'error');
    }
  };

  const handleDoctorProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      showToast('Doctor full name is required', 'error');
      return;
    }
    if (!profileData.specialization.trim()) {
      showToast('Specialization is required', 'error');
      return;
    }
    if (!profileData.experience || isNaN(profileData.experience) || parseInt(profileData.experience) < 0) {
      showToast('Experience must be a positive number', 'error');
      return;
    }
    if (!profileData.phone.trim()) {
      showToast('Phone number is required', 'error');
      return;
    }

    try {
      const payload = {
        name: profileData.name,
        specialization: profileData.specialization,
        experience: parseInt(profileData.experience),
        phone: profileData.phone,
        department: profileData.department,
        username: username
      };

      await api.doctors.create(payload);
      showToast('Doctor Clinical Profile saved successfully!', 'success');
      fetchAllDashboardData();
    } catch (err) {
      showToast('Profile save failed: ' + err.message, 'error');
    }
  };

  const handleCompleteAppointment = async (appt) => {
    try {
      const payload = {
        appointmentDate: appt.appointmentDate,
        status: 'Completed',
        patient: appt.patient ? { id: appt.patient.id } : null,
        doctor: appt.doctor ? { id: appt.doctor.id } : null
      };
      await api.appointments.update(appt.id, payload);
      showToast('Appointment completed successfully!', 'success');
      fetchAllDashboardData();
    } catch (err) {
      showToast('Failed to complete appointment: ' + err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Activity className="animate-spin" size={48} color="var(--primary)" />
        <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Loading dashboard metrics...</p>
      </div>
    );
  }

  const myPatient = patients.find(p => p.username === username);
  const myDoctor = doctors.find(d => d.username === username);

  // Common welcome banner component
  const welcomeBanner = (
    <div style={styles.welcomeBanner} className="glass-panel">
      <div style={styles.welcomeInfo}>
        <h2 style={styles.welcomeTitle}>
          Hello, <span className="gradient-text">{getNameFromEmail(username)}</span>!
        </h2>
        <p style={styles.welcomeText}>
          Welcome to the CarePulse Hospital Management Portal. You are logged in as{' '}
          <strong style={{ color: 'var(--accent-cyan)' }}>{getCleanRole()}</strong>. Here is your hospital metrics snapshot for today.
        </p>
      </div>
      <div style={styles.welcomeIconContainer}>
        <HeartHandshake size={64} className="animated-heart" />
      </div>

      {/* Animated glowing EKG wave line */}
      <div style={styles.ekgWaveContainer}>
        <svg viewBox="0 0 400 30" style={styles.ekgWaveSvg} preserveAspectRatio="none">
          <path 
            d="M0 15 h150 l5 -6 l5 6 l4 -16 l4 20 l4 -10 l3 6 h225" 
            fill="none" 
            stroke="url(#ekgGradient)" 
            strokeWidth="1.5" 
            className="ekg-path"
          />
          <defs>
            <linearGradient id="ekgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.1" />
              <stop offset="50%" stopColor="var(--accent-cyan)" stopOpacity="0.85" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );

  // 1. Patient Dashboard Layout
  if (isPatient) {
    if (!myPatient) {
      return (
        <div style={styles.container}>
          {welcomeBanner}
          <div className="glass-panel" style={styles.profileFormCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <UserPlus size={32} color="var(--accent-violet)" />
              <h3 className="gradient-text" style={{ fontSize: '1.4rem', fontWeight: '700', margin: 0 }}>Create Patient Medical Card</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
              Welcome to CarePulse! Please complete your medical registration profile below to enable booking appointments, viewing prescriptions, and checking invoices.
            </p>
            <form onSubmit={handlePatientProfileSubmit} style={styles.form}>
              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="e.g. Alice Cooper"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Age *</label>
                  <input
                    type="number"
                    name="age"
                    className="form-control"
                    placeholder="e.g. 28"
                    value={profileData.age}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Gender *</label>
                  <select
                    name="gender"
                    className="form-control form-select"
                    value={profileData.gender}
                    onChange={handleProfileChange}
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Phone Number (10 Digits) *</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    placeholder="e.g. 9876543210"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Residential Address</label>
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  placeholder="e.g. 123 Health Ave, NY"
                  value={profileData.address}
                  onChange={handleProfileChange}
                />
              </div>

              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Blood Group</label>
                  <select
                    name="bloodGroup"
                    className="form-control form-select"
                    value={profileData.bloodGroup}
                    onChange={handleProfileChange}
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Insurance Provider</label>
                  <input
                    type="text"
                    name="insuranceProvider"
                    className="form-control"
                    placeholder="e.g. BlueCross Shield"
                    value={profileData.insuranceProvider}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary glow-hover" style={{ marginTop: '12px', width: '220px' }}>
                Save Profile Card
              </button>
            </form>
          </div>
        </div>
      );
    }

    // Patient profile exists: show stats and records
    const myAppts = appointments.filter(a => a.patient && a.patient.id === myPatient.id && a.status !== 'Cancelled');
    const myUnpaidBills = bills.filter(b => b.patient && b.patient.id === myPatient.id && b.paymentStatus !== 'Paid');
    const myPrescriptions = prescriptions.filter(p => p.patient && p.patient.id === myPatient.id);
    const myMedicalRecords = medicalRecords.filter(m => m.patient && m.patient.id === myPatient.id);

    const outstandingBalance = myUnpaidBills.reduce((sum, b) => sum + (b.totalAmount || (b.consultationFee + b.medicineCharges + b.labCharges)), 0);

    const myScheduledAppts = myAppts.filter(a => a.status === 'Scheduled');

    const patientStats = [
      { title: 'Next Visit', value: myScheduledAppts.length ? myScheduledAppts[0].appointmentDate.replace('T', ' ') : 'None Scheduled', icon: Calendar, color: '#4f46e5' },
      { title: 'Outstanding Bills', value: `$${outstandingBalance.toFixed(2)}`, icon: DollarSign, color: '#ef4444' },
      { title: 'Prescriptions', value: myPrescriptions.length, icon: ClipboardList, color: '#10b981' },
      { title: 'Clinical Records', value: myMedicalRecords.length, icon: FolderHeart, color: '#06b6d4' }
    ];

    return (
      <div style={styles.container}>
        {welcomeBanner}

        <div className="stats-grid">
          {patientStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="stat-card glass-panel">
                <div className="stat-info">
                  <span className="stat-title">{stat.title}</span>
                  <span className="stat-value" style={{ fontSize: stat.value.toString().length > 12 ? '1.15rem' : '1.8rem' }}>{stat.value}</span>
                </div>
                <div className="stat-icon" style={{ backgroundColor: `${stat.color}1e`, color: stat.color }}>
                  <Icon size={22} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={styles.dashboardGrid}>
          {/* Claimed Health Package */}
          {selectedOffer && (
            <div style={styles.panel} className="glass-panel">
              <h3 style={styles.panelTitle}>Claimed Health Package</h3>
              <p style={styles.panelSubtitle}>Wellness package selected from the Home page</p>
              <div style={{
                padding: '20px',
                borderRadius: 'var(--border-radius-md)',
                background: selectedOffer.bg || 'rgba(6, 182, 212, 0.05)',
                border: `1px solid ${selectedOffer.color || 'var(--border-color)'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative',
                overflow: 'hidden',
                marginTop: '10px'
              }}>
                <span className="badge" style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  backgroundColor: selectedOffer.color,
                  color: '#fff',
                  fontSize: '0.8rem'
                }}>
                  {selectedOffer.badge}
                </span>
                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {selectedOffer.title}
                </h4>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    ${selectedOffer.discountPrice}
                  </span>
                  <span style={{ fontSize: '1rem', textDecoration: 'line-through', color: 'var(--text-tertiary)' }}>
                    ${selectedOffer.originalPrice}
                  </span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {selectedOffer.features && selectedOffer.features.map((feat, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{feat}</li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button 
                    className="btn btn-success glow-hover" 
                    style={{ flex: 1, padding: '10px' }}
                    onClick={async () => {
                      try {
                        const generalDoctor = doctors.find(d => d.department && d.department.toLowerCase().includes('general'));
                        if (!generalDoctor) {
                          showToast('No doctor is currently registered in the General department. Please register one first.', 'warning');
                          return;
                        }

                        await api.bills.create({
                          patient: { id: myPatient.id },
                          consultationFee: 0.0,
                          medicineCharges: 0.0,
                          labCharges: parseFloat(selectedOffer.discountPrice),
                          totalAmount: parseFloat(selectedOffer.discountPrice),
                          paymentStatus: 'Pending'
                        });

                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        const apptDateStr = tomorrow.toISOString().split('T')[0] + 'T10:00';

                        await api.appointments.create({
                          appointmentDate: apptDateStr,
                          status: 'Scheduled',
                          patient: { id: myPatient.id },
                          doctor: { id: generalDoctor.id }
                        });

                        showToast(`Successfully booked ${selectedOffer.title} with Dr. ${generalDoctor.name}! A pending invoice for $${selectedOffer.discountPrice} has been added to your ledger.`, 'success');
                        localStorage.removeItem('selectedOffer');
                        setSelectedOffer(null);
                        fetchAllDashboardData();
                      } catch (e) {
                        showToast('Failed to book package: ' + e.message, 'error');
                      }
                    }}
                  >
                    Confirm & Schedule
                  </button>
                  <button 
                    className="btn btn-danger" 
                    style={{ padding: '10px 16px' }}
                    onClick={() => {
                      localStorage.removeItem('selectedOffer');
                      setSelectedOffer(null);
                      showToast('Offer selection removed.', 'info');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Booked Appointments */}
          <div style={styles.panel} className="glass-panel">
            <h3 style={styles.panelTitle}>Booked Appointments</h3>
            <p style={styles.panelSubtitle}>Your upcoming scheduled medical consultations</p>
            {myAppts.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>No active bookings scheduled.</p>
            ) : (
              <div style={styles.listGroup}>
                {myAppts.slice(0, 3).map((a) => (
                  <div key={a.id} style={styles.historyRow}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>
                        {a.doctor ? `Dr. ${a.doctor.name}` : 'General Consultation'}
                      </strong>
                      <span className={`badge ${a.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                        {a.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span>Specialization: {a.doctor ? a.doctor.specialization : 'GP'}</span>
                      <span>{a.appointmentDate ? a.appointmentDate.replace('T', ' ') : 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Prescriptions */}
          <div style={styles.panel} className="glass-panel">
            <h3 style={styles.panelTitle}>Active Prescriptions</h3>
            <p style={styles.panelSubtitle}>Medications prescribed by your doctors</p>
            {myPrescriptions.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginBottom: '20px' }}>No active prescriptions.</p>
            ) : (
              <div style={{ ...styles.listGroup, marginBottom: '20px' }}>
                {myPrescriptions.slice(0, 3).map((p) => (
                  <div key={p.id} style={styles.historyRow}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ color: 'var(--accent-cyan)' }}>{p.medicine}</strong>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>{p.dosage}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '2px 0 6px 0' }}>
                      Prescribed By: <strong style={{ color: 'var(--text-secondary)' }}>{p.doctor ? p.doctor.name : 'Unassigned'}</strong>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Instructions: {p.instructions}</p>
                  </div>
                ))}
              </div>
            )}
            
            <button className="btn btn-primary glow-hover" style={{ width: '100%' }} onClick={() => navigate('/appointments')}>
              <Calendar size={16} />
              <span>Book Doctor Consultation</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Doctor Dashboard Layout
  if (isDoctor) {
    if (!myDoctor) {
      return (
        <div style={styles.container}>
          {welcomeBanner}
          <div className="glass-panel" style={styles.profileFormCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <UserPlus size={32} color="var(--accent-violet)" />
              <h3 className="gradient-text" style={{ fontSize: '1.4rem', fontWeight: '700', margin: 0 }}>Create Doctor Clinical Profile</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
              Please complete your doctor profile below to start managing assigned patient appointments, diagnoses, and pharmacy prescription schedules.
            </p>
            <form onSubmit={handleDoctorProfileSubmit} style={styles.form}>
              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="e.g. Dr. Jane Doe"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Specialization *</label>
                  <input
                    type="text"
                    name="specialization"
                    className="form-control"
                    placeholder="e.g. Cardiologist"
                    value={profileData.specialization}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Experience (Years) *</label>
                  <input
                    type="number"
                    name="experience"
                    className="form-control"
                    placeholder="e.g. 10"
                    value={profileData.experience}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    placeholder="Contact phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Department</label>
                <input
                  type="text"
                  name="department"
                  className="form-control"
                  placeholder="e.g. Cardiology"
                  value={profileData.department}
                  onChange={handleProfileChange}
                />
              </div>

              <button type="submit" className="btn btn-primary glow-hover" style={{ marginTop: '12px', width: '220px' }}>
                Save Doctor Profile
              </button>
            </form>
          </div>
        </div>
      );
    }

    // Doctor profile exists: show assigned tasks
    const myAppts = appointments.filter(a => a.doctor && a.doctor.username === username);
    const scheduledApptsCount = myAppts.filter(a => a.status === 'Scheduled').length;
    const completedApptsCount = myAppts.filter(a => a.status === 'Completed').length;
    const myWrittenPrescriptions = prescriptions.filter(p => p.doctor && p.doctor.username === username);
    const myWrittenPrescriptionsCount = myWrittenPrescriptions.length;

    // Filter patients assigned to this doctor (unique patients in myAppts)
    const myPatientsMap = {};
    myAppts.forEach(appt => {
      if (appt.patient) {
        myPatientsMap[appt.patient.id] = appt.patient;
      }
    });
    const myPatients = Object.values(myPatientsMap);

    // Filter medical records of doctor's patients
    const myPatientRecords = medicalRecords.filter(mr => mr.patient && myPatientsMap[mr.patient.id]);

    const doctorStats = [
      { title: 'Scheduled Visits', value: scheduledApptsCount, icon: Calendar, color: '#4f46e5' },
      { title: 'Prescriptions Issued', value: myWrittenPrescriptionsCount, icon: FileText, color: '#06b6d4' },
      { title: 'Department', value: myDoctor.department || 'General', icon: Stethoscope, color: '#8b5cf6' }
    ];

    return (
      <div style={styles.container}>
        {welcomeBanner}

        <div className="stats-grid">
          {doctorStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="stat-card glass-panel">
                <div className="stat-info">
                  <span className="stat-title">{stat.title}</span>
                  <span className="stat-value" style={{ fontSize: stat.value.toString().length > 12 ? '1.15rem' : '1.8rem' }}>{stat.value}</span>
                </div>
                <div className="stat-icon" style={{ backgroundColor: `${stat.color}1e`, color: stat.color }}>
                  <Icon size={22} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={styles.dashboardGrid}>
          {/* Scheduled Appointments */}
          <div style={styles.panel} className="glass-panel">
            <h3 style={styles.panelTitle}>Scheduled Appointments</h3>
            <p style={styles.panelSubtitle}>Your upcoming scheduled clinical visits calendar</p>
            {myAppts.filter(a => a.status === 'Scheduled').length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>No pending scheduled appointments.</p>
            ) : (
              <div style={styles.listGroup}>
                {myAppts.filter(a => a.status === 'Scheduled').slice(0, 5).map((a) => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>{a.patient ? a.patient.name : 'Unknown Patient'}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.appointmentDate.replace('T', ' ')}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="badge badge-warning">
                        Scheduled
                      </span>
                      {a.status === 'Scheduled' && (
                        <button 
                          className="btn btn-success btn-icon btn-sm glow-hover"
                          onClick={() => handleCompleteAppointment(a)}
                          title="Mark as Completed"
                          style={{ padding: '6px', borderRadius: '50%' }}
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Checkups */}
          <div style={styles.panel} className="glass-panel">
            <h3 style={styles.panelTitle}>Completed Checkups</h3>
            <p style={styles.panelSubtitle}>Your completed consultations and clinical checkups</p>
            {myAppts.filter(a => a.status === 'Completed').length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>No completed cases yet.</p>
            ) : (
              <div style={styles.listGroup}>
                {myAppts.filter(a => a.status === 'Completed').slice(0, 5).map((a) => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                      <strong style={{ color: 'var(--success)' }}>{a.patient ? a.patient.name : 'Unknown Patient'}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Completed on: {a.appointmentDate.replace('T', ' ')}</div>
                    </div>
                    <span className="badge badge-success">Completed</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Administrator Dashboard Layout
  const statCards = [
    { title: 'Total Patients', value: data.totalPatients, icon: Users, color: '#06b6d4', tab: 'patients' },
    { title: 'Active Doctors', value: data.totalDoctors, icon: Stethoscope, color: '#8b5cf6', tab: 'doctors' },
    { title: 'Appointments', value: data.totalAppointments, icon: Calendar, color: '#4f46e5', tab: 'appointments' },
    { title: 'Total Revenue', value: `$${data.totalRevenue.toLocaleString()}`, icon: DollarSign, color: '#10b981', tab: 'bills' }
  ];

  return (
    <div style={styles.container}>
      {welcomeBanner}

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx} 
              className="stat-card glass-panel glow-hover" 
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/${stat.tab}`)}
            >
              <div className="stat-info">
                <span className="stat-title">{stat.title}</span>
                <span className="stat-value">{stat.value}</span>
              </div>
              <div className="stat-icon" style={{ backgroundColor: `rgba(${parseInt(stat.color.slice(1,3), 16)}, ${parseInt(stat.color.slice(3,5), 16)}, ${parseInt(stat.color.slice(5,7), 16)}, 0.1)`, color: stat.color }}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions & Recent Activity Panel */}
      <div style={styles.dashboardGrid}>
        <div style={styles.panel} className="glass-panel">
          <h3 style={styles.panelTitle}>Quick Services</h3>
          <p style={styles.panelSubtitle}>Common operations for management</p>
          <div style={styles.actionsList}>
            <button style={styles.actionBtn} className="glow-hover" onClick={() => navigate('/patients')}>
              <Users size={18} color="var(--accent-cyan)" />
              <span>Register Patient</span>
            </button>
            <button style={styles.actionBtn} className="glow-hover" onClick={() => navigate('/appointments')}>
              <CalendarCheck size={18} color="var(--primary)" />
              <span>Book Appointment</span>
            </button>
            { (role === 'ADMIN' || role === 'ROLE_ADMIN') && (
              <button style={styles.actionBtn} className="glow-hover" onClick={() => navigate('/bills')}>
                <DollarSign size={18} color="var(--success)" />
                <span>Generate Invoices</span>
              </button>
            )}
          </div>
        </div>

        <div style={styles.panel} className="glass-panel">
          <h3 style={styles.panelTitle}>Scheduled Consultations</h3>
          <p style={styles.panelSubtitle}>Pending appointments to be solved or completed</p>
          {appointments.filter(a => a.status === 'Scheduled').length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>No pending scheduled appointments.</p>
          ) : (
            <div style={styles.listGroup}>
              {appointments.filter(a => a.status === 'Scheduled').slice(0, 4).map((a) => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>{a.patient ? a.patient.name : 'Unknown Patient'}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Doc: {a.doctor ? a.doctor.name : 'Unassigned'} | {a.appointmentDate ? a.appointmentDate.replace('T', ' ') : 'N/A'}
                    </div>
                  </div>
                  <button 
                    className="btn btn-success btn-icon btn-sm glow-hover"
                    onClick={() => handleCompleteAppointment(a)}
                    title="Mark as Completed"
                    style={{ padding: '6px', borderRadius: '50%' }}
                  >
                    <CheckCircle size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.panel} className="glass-panel">
          <h3 style={styles.panelTitle}>General Guidelines</h3>
          <p style={styles.panelSubtitle}>Key protocols and checks</p>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <span style={styles.dot}></span>
              <span>Always verify patient identity and insurance provider upon check-in.</span>
            </li>
            <li style={styles.listItem}>
              <span style={styles.dot}></span>
              <span>Billing calculations are automated by backend logic on save.</span>
            </li>
            <li style={styles.listItem}>
              <span style={styles.dot}></span>
              <span>Prescription and diagnosis histories are automatically archived in Medical Records.</span>
            </li>
          </ul>
        </div>

        {/* Recent Billing Transactions */}
        <div style={styles.panel} className="glass-panel">
          <h3 style={styles.panelTitle}>Recent Transactions</h3>
          <p style={styles.panelSubtitle}>Breakdown of recent invoice states</p>
          {bills.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>No billing transactions found.</p>
          ) : (
            <div style={styles.listGroup}>
              {bills.slice(0, 3).map((b) => (
                <div key={b.id} style={styles.historyRow}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>#INV-{b.id}</strong>
                    <span className={`badge ${b.paymentStatus === 'Paid' ? 'badge-success' : b.paymentStatus === 'Pending' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                      {b.paymentStatus}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <span>Patient: {b.patient ? b.patient.name : 'Unknown'}</span>
                    <span>Total: <strong style={{ color: 'var(--accent-cyan)' }}>${(b.totalAmount || (b.consultationFee + b.medicineCharges + b.labCharges)).toFixed(2)}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clinical Staff Directory Preview */}
        <div style={styles.panel} className="glass-panel">
          <h3 style={styles.panelTitle}>Active Medical Practitioners</h3>
          <p style={styles.panelSubtitle}>Breakdown of registered specialists</p>
          {doctors.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>No doctors registered in database.</p>
          ) : (
            <div style={styles.listGroup}>
              {doctors.slice(0, 3).map((d) => (
                <div key={d.id} style={styles.historyRow}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: 'var(--accent-violet)' }}>{d.name}</strong>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>{d.specialization}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <span>Experience: {d.experience} Years</span>
                    <span>Dept: {d.department || 'General'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px'
  },
  welcomeBanner: {
    padding: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--primary-light) 100%)',
    position: 'relative',
    overflow: 'hidden'
  },
  welcomeInfo: {
    maxWidth: '70%',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    zIndex: 1
  },
  welcomeTitle: {
    fontSize: '2rem',
    fontWeight: '700'
  },
  welcomeText: {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    lineHeight: '1.6'
  },
  welcomeIconContainer: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    padding: '20px',
    borderRadius: 'var(--border-radius-lg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(79, 70, 229, 0.2)'
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px'
  },
  panel: {
    padding: '24px'
  },
  panelTitle: {
    fontSize: '1.15rem',
    fontWeight: '600',
    marginBottom: '4px'
  },
  panelSubtitle: {
    color: 'var(--text-tertiary)',
    fontSize: '0.85rem',
    marginBottom: '20px'
  },
  actionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 20px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'var(--transition-fast)',
    fontSize: '0.95rem',
    fontWeight: '500',
    color: 'var(--text-primary)'
  },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  listItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4'
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-cyan)',
    marginTop: '6px',
    flexShrink: 0
  },
  ekgWaveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '24px',
    overflow: 'hidden',
    borderBottomLeftRadius: 'var(--border-radius-lg)',
    borderBottomRightRadius: 'var(--border-radius-lg)',
    opacity: 0.8
  },
  ekgWaveSvg: {
    width: '100%',
    height: '100%'
  },
  profileFormCard: {
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },
  historyRow: {
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  listGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  }
};
