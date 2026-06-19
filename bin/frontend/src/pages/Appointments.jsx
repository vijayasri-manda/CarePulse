import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { Plus, Calendar, Trash2, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Appointments({ showToast }) {
  const { username, isPatient } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    appointmentDate: '',
    status: 'Scheduled',
    patientId: '',
    doctorId: ''
  });

  const fetchAppointments = async () => {
    try {
      const data = await api.appointments.getAll();
      setAppointments(data);
    } catch (err) {
      showToast('Failed to fetch appointments: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const patientsData = await api.patients.getAll();
      const doctorsData = await api.doctors.getAll();
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (err) {
      showToast('Error loading doctor/patient lists: ' + err.message, 'error');
    }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.resolve();
      fetchAppointments();
      fetchDropdownData();
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    if (doctors.length === 0) {
      showToast('Please add at least one doctor first.', 'warning');
      return;
    }
    
    const generalDoc = doctors.find(d => d.department && d.department.toLowerCase().includes('general')) || doctors[0];

    if (isPatient) {
      const myProfile = patients.find(p => p.username === username);
      if (!myProfile) {
        showToast('Please complete your medical profile in the Dashboard first.', 'warning');
        return;
      }
      setFormData({
        appointmentDate: '',
        status: 'Scheduled',
        patientId: myProfile.id.toString(),
        doctorId: generalDoc.id.toString()
      });
    } else {
      if (patients.length === 0) {
        showToast('Please register at least one patient first.', 'warning');
        return;
      }
      setFormData({
        appointmentDate: '',
        status: 'Scheduled',
        patientId: patients[0].id.toString(),
        doctorId: generalDoc.id.toString()
      });
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.appointmentDate) {
      showToast('Appointment date and time are required', 'error');
      return;
    }

    try {
      const payload = {
        appointmentDate: formData.appointmentDate,
        status: formData.status,
        patient: { id: parseInt(formData.patientId) },
        doctor: { id: parseInt(formData.doctorId) }
      };

      await api.appointments.create(payload);
      showToast('Appointment scheduled successfully!', 'success');
      setIsModalOpen(false);
      fetchAppointments();
    } catch (err) {
      showToast('Failed to schedule: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to cancel and delete this appointment?')) {
      try {
        const res = await api.appointments.delete(id);
        showToast(res || 'Appointment cancelled successfully', 'success');
        fetchAppointments();
      } catch (err) {
        showToast('Failed to cancel: ' + err.message, 'error');
      }
    }
  };

  const handleComplete = async (appt) => {
    try {
      const payload = {
        appointmentDate: appt.appointmentDate,
        status: 'Completed',
        patient: appt.patient ? { id: appt.patient.id } : null,
        doctor: appt.doctor ? { id: appt.doctor.id } : null
      };
      await api.appointments.update(appt.id, payload);
      showToast('Appointment completed successfully!', 'success');
      fetchAppointments();
    } catch (err) {
      showToast('Failed to complete appointment: ' + err.message, 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="badge badge-success" style={{ gap: '4px' }}><CheckCircle size={12} /> Completed</span>;
      case 'Cancelled':
        return <span className="badge badge-danger" style={{ gap: '4px' }}><XCircle size={12} /> Cancelled</span>;
      default:
        return <span className="badge badge-warning" style={{ gap: '4px' }}><Clock size={12} /> Scheduled</span>;
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch =
      (a.patient?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.doctor?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = filterStatus === 'All' || a.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const paginatedAppointments = filteredAppointments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.actionBar}>
        <div style={styles.searchAndFilters}>
          <div style={styles.searchWrapper} className="glass-panel">
            <Search size={18} color="var(--text-tertiary)" />
            <input
              type="text"
              placeholder="Search by doctor or patient name..."
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <select
            className="form-control form-select"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            style={styles.filterSelect}
          >
            <option value="All">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          <span>Book Appointment</span>
        </button>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <div className="animate-spin" style={styles.spinner}></div>
          <span style={{ color: 'var(--text-secondary)' }}>Loading clinic calendars...</span>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div style={styles.emptyContainer} className="glass-panel">
          <Calendar size={48} color="var(--text-tertiary)" />
          <h4>No Appointments Found</h4>
          <p>Schedule a new medical consultation to get started.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Appointment Date/Time</th>
                  <th>Patient Name</th>
                  <th>Assigned Doctor</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAppointments.map((appt) => (
                  <tr key={appt.id}>
                    <td style={{ fontWeight: '600' }}>{formatDateTime(appt.appointmentDate)}</td>
                    <td>{appt.patient ? appt.patient.name : 'Unknown'}</td>
                    <td>{appt.doctor ? appt.doctor.name : 'Unknown'}</td>
                    <td>{getStatusBadge(appt.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {!isPatient && appt.status === 'Scheduled' && (
                          <button 
                            style={styles.actionBtn} 
                            className="btn btn-success btn-icon glow-hover"
                            onClick={() => handleComplete(appt)}
                            title="Complete Appointment"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                        <button 
                          style={styles.actionBtn} 
                          className="btn btn-danger btn-icon glow-hover"
                          onClick={() => handleDelete(appt.id)}
                          title="Cancel Appointment"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={styles.paginationContainer}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span style={styles.paginationText}>
                Page {currentPage} of {totalPages}
              </span>
              <button 
                className="btn btn-secondary" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Add Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Schedule Consultation Appointment"
      >
        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Appointment Date & Time</label>
            <input
              type="datetime-local"
              name="appointmentDate"
              className="form-control"
              value={formData.appointmentDate}
              onChange={handleChange}
            />
          </div>
          
          {!isPatient && (
            <div className="form-group">
              <label className="form-label">Select Patient</label>
              <select
                name="patientId"
                className="form-control form-select"
                value={formData.patientId}
                onChange={handleChange}
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (ID: #{p.id})</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Select Doctor Practitioner</label>
            <select
              name="doctorId"
              className="form-control form-select"
              value={formData.doctorId}
              onChange={handleChange}
            >
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              name="status"
              className="form-control form-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          
          <div style={styles.formActions}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Schedule Appointment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  actionBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px'
  },
  searchAndFilters: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '4px 16px',
    borderRadius: 'var(--border-radius-md)',
    flex: 1,
    maxWidth: '320px'
  },
  searchInput: {
    border: 'none',
    background: 'none',
    color: 'var(--text-primary)',
    outline: 'none',
    width: '100%',
    padding: '8px 0',
    fontSize: '0.9rem'
  },
  filterSelect: {
    maxWidth: '180px',
    padding: '8px 12px',
    borderRadius: 'var(--border-radius-md)',
    backgroundColor: 'var(--glass-bg)',
    borderColor: 'var(--border-color)',
    color: 'var(--text-primary)',
    outline: 'none',
    cursor: 'pointer'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 0',
    gap: '16px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(129, 140, 248, 0.1)',
    borderTopColor: 'var(--primary)',
    borderRadius: '50%'
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
    gap: '12px',
    color: 'var(--text-secondary)'
  },
  actionBtn: {
    padding: '6px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '12px'
  },
  paginationContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-color)'
  },
  paginationText: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    fontWeight: '500'
  }
};
