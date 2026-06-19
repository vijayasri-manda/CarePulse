import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { Plus, FileSpreadsheet, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const formatDoctorName = (name) => {
  if (!name) return 'Unknown Doctor';
  let cleanName = name;
  if (name.includes('@')) {
    cleanName = name.split('@')[0];
  }
  const rawClean = cleanName.replace(/\d/g, '');
  let formatted = rawClean
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
  
  if (!formatted.toLowerCase().startsWith('dr.')) {
    if (formatted.toLowerCase().startsWith('dr')) {
      const rest = formatted.slice(2).trim();
      return 'Dr. ' + rest;
    }
    return 'Dr. ' + formatted;
  }
  return formatted;
};

export default function Prescriptions({ showToast }) {
  const { username, isPatient, isDoctor } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    medicine: '',
    dosage: '',
    instructions: ''
  });

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const data = await api.prescriptions.getAll();
      setPrescriptions(data);
    } catch (err) {
      showToast('Failed to fetch prescriptions: ' + err.message, 'error');
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
      fetchPrescriptions();
      fetchDropdownData();
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    if (patients.length === 0) {
      showToast('Please register at least one patient first.', 'warning');
      return;
    }
    if (doctors.length === 0) {
      showToast('Please add at least one doctor first.', 'warning');
      return;
    }
    
    let defaultDoctorId = doctors[0].id.toString();
    if (isDoctor) {
      const myDoc = doctors.find(d => d.username === username);
      if (myDoc) {
        defaultDoctorId = myDoc.id.toString();
      }
    }

    setFormData({
      patientId: patients[0].id.toString(),
      doctorId: defaultDoctorId,
      medicine: '',
      dosage: '',
      instructions: ''
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.medicine.trim()) {
      showToast('Medicine name is required', 'error');
      return;
    }
    if (!formData.dosage.trim()) {
      showToast('Dosage details are required', 'error');
      return;
    }

    try {
      const payload = {
        medicine: formData.medicine,
        dosage: formData.dosage,
        instructions: formData.instructions,
        patient: { id: parseInt(formData.patientId) },
        doctor: { id: parseInt(formData.doctorId) }
      };

      await api.prescriptions.create(payload);
      showToast('Prescription written successfully!', 'success');
      setIsModalOpen(false);
      fetchPrescriptions();
    } catch (err) {
      showToast('Failed to write prescription: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this prescription record?')) {
      try {
        const res = await api.prescriptions.delete(id);
        showToast(res || 'Prescription deleted successfully', 'success');
        fetchPrescriptions();
      } catch (err) {
        showToast('Failed to delete prescription: ' + err.message, 'error');
      }
    }
  };

  const filteredPrescriptions = prescriptions.filter((p) => {
    if (isPatient) {
      return p.patient && p.patient.username === username;
    }
    if (isDoctor) {
      return p.doctor && p.doctor.username === username;
    }
    return true; // Admin sees all
  });

  return (
    <div style={styles.container}>
      <div style={styles.actionBar}>
        <div>
          <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
            {isPatient ? 'Review medical drug prescriptions issued for your account' : 'Track and write prescriptions issued by medical officers'}
          </p>
        </div>
        
        {!isPatient && (
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            <span>Write Prescription</span>
          </button>
        )}
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <div className="animate-spin" style={styles.spinner}></div>
          <span style={{ color: 'var(--text-secondary)' }}>Loading prescriptions cabinet...</span>
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div style={styles.emptyContainer} className="glass-panel">
          <FileSpreadsheet size={48} color="var(--text-tertiary)" />
          <h4>No Prescriptions Found</h4>
          <p>{isPatient ? 'You do not have any active prescription plans.' : 'Click "Write Prescription" to log a drug schedule.'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Rx ID</th>
                <th>Patient</th>
                <th>Prescribed By</th>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Instructions</th>
                {!isPatient && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredPrescriptions.map((p) => (
                <tr key={p.id}>
                  <td>#Rx-{p.id}</td>
                  <td style={{ fontWeight: '600' }}>{p.patient ? p.patient.name : <span style={{color: 'var(--text-tertiary)'}}>Unknown</span>}</td>
                  <td>{p.doctor ? formatDoctorName(p.doctor.name) : <span style={{color: 'var(--text-tertiary)'}}>Unassigned</span>}</td>
                  <td style={{ fontWeight: '600', color: 'var(--accent-cyan)' }}>{p.medicine}</td>
                  <td>
                    <span className="badge badge-success">{p.dosage}</span>
                  </td>
                  <td>{p.instructions || <span style={{color: 'var(--text-tertiary)'}}>No additional info</span>}</td>
                  {!isPatient && (
                    <td>
                      <button 
                        style={styles.actionBtn} 
                        className="btn btn-danger btn-icon"
                        onClick={() => handleDelete(p.id)}
                        title="Delete Prescription"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Write Prescription Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Write Medical Prescription">
        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Patient *</label>
            <select
              name="patientId"
              className="form-control form-select"
              value={formData.patientId}
              onChange={handleChange}
              required
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (ID: #{p.id})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Prescribed By Doctor *</label>
            <select
              name="doctorId"
              className="form-control form-select"
              value={formData.doctorId}
              onChange={handleChange}
              required
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {formatDoctorName(d.name)} ({d.specialization})
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formRow}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Medicine Name *</label>
              <input
                type="text"
                name="medicine"
                className="form-control"
                placeholder="e.g. Paracetamol or Amoxicillin"
                value={formData.medicine}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Dosage Schedule *</label>
              <input
                type="text"
                name="dosage"
                className="form-control"
                placeholder="e.g. 500mg, twice a day"
                value={formData.dosage}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Usage Instructions</label>
            <textarea
              name="instructions"
              className="form-control"
              placeholder="e.g. Take after meals, complete the full course"
              value={formData.instructions}
              onChange={handleChange}
              rows="3"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={styles.formActions}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Issue Prescription
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
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    height: '240px'
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(255,255,255,0.05)',
    borderTopColor: 'var(--primary)',
    borderRadius: '50%'
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    gap: '12px',
    textAlign: 'center'
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formRow: {
    display: 'flex',
    gap: '16px'
  },
  formActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-color)'
  }
};
