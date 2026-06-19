import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { Plus, Activity, Trash2, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MedicalRecords({ showToast }) {
  const { username, isPatient } = useAuth();
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    diagnosis: '',
    treatment: '',
    recordDate: '',
    reportPdf: '',
    reportName: ''
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await api.medicalRecords.getAll();
      setRecords(data);
    } catch (err) {
      showToast('Failed to fetch medical records: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const patientsData = await api.patients.getAll();
      setPatients(patientsData);
    } catch (err) {
      showToast('Error loading patients list: ' + err.message, 'error');
    }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.resolve();
      fetchRecords();
      fetchPatients();
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    if (patients.length === 0) {
      showToast('Please register at least one patient first.', 'warning');
      return;
    }
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];

    setFormData({
      patientId: patients[0].id.toString(),
      diagnosis: '',
      treatment: '',
      recordDate: today,
      reportPdf: '',
      reportName: ''
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        showToast('Only PDF files are supported', 'error');
        e.target.value = ''; // Reset input
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showToast('PDF file size must be less than 5MB', 'error');
        e.target.value = ''; // Reset input
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setFormData(prev => ({
          ...prev,
          reportPdf: uploadEvent.target.result,
          reportName: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleViewPdf = (base64Data, filename) => {
    try {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(
          `<iframe src="${base64Data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
        );
        newWindow.document.title = filename || 'Medical Report';
      } else {
        // Fallback to direct download if popup blocked
        const link = document.createElement('a');
        link.href = base64Data;
        link.download = filename || 'medical_report.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Could not open PDF in new tab", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.diagnosis.trim()) {
      showToast(isPatient ? 'Document title is required' : 'Diagnosis summary is required', 'error');
      return;
    }
    if (!formData.treatment.trim()) {
      showToast(isPatient ? 'Description/Notes are required' : 'Treatment description is required', 'error');
      return;
    }
    if (!formData.recordDate) {
      showToast('Record entry date is required', 'error');
      return;
    }

    try {
      const payload = {
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        recordDate: formData.recordDate,
        patient: { id: isPatient ? patients[0].id : parseInt(formData.patientId) },
        reportPdf: formData.reportPdf || null,
        reportName: formData.reportName || null
      };

      await api.medicalRecords.create(payload);
      showToast(isPatient ? 'Medical report uploaded successfully!' : 'Medical record updated successfully!', 'success');
      setIsModalOpen(false);
      fetchRecords();
    } catch (err) {
      showToast('Failed to save record: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this medical record?')) {
      try {
        const res = await api.medicalRecords.delete(id);
        showToast(res || 'Record deleted successfully', 'success');
        fetchRecords();
      } catch (err) {
        showToast('Failed to delete medical record: ' + err.message, 'error');
      }
    }
  };

  const filteredRecords = records.filter((r) => {
    if (isPatient) {
      return r.patient && r.patient.username === username;
    }
    return true; // Staff/Admin sees all
  });

  return (
    <div style={styles.container}>
      <div style={styles.actionBar}>
        <div>
          <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
            {isPatient ? 'Upload or review your personal longitudinal clinical history and medical reports' : 'Maintain longitudinal clinical histories, medical reports and diagnoses for patients'}
          </p>
        </div>
        
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          <span>{isPatient ? 'Upload X-Ray / Report' : 'New Entry'}</span>
        </button>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <div className="animate-spin" style={styles.spinner}></div>
          <span style={{ color: 'var(--text-secondary)' }}>Loading patient clinical logs...</span>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div style={styles.emptyContainer} className="glass-panel">
          <Activity size={48} color="var(--text-tertiary)" />
          <h4>No Medical Records Found</h4>
          <p>{isPatient ? 'You do not have any clinical logs or uploaded reports.' : 'Create a clinical log to record a medical checkup and diagnosis.'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Patient</th>
                <th>Entry Date</th>
                <th>{isPatient ? 'Report Title' : 'Diagnosis Summary'}</th>
                <th>Notes / Treatment</th>
                <th>Attachment</th>
                {!isPatient && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r) => (
                <tr key={r.id}>
                  <td>#REC-{r.id}</td>
                  <td style={{ fontWeight: '600' }}>{r.patient ? r.patient.name : <span style={{color: 'var(--text-tertiary)'}}>Unknown</span>}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={12} color="var(--text-tertiary)" />
                      <span>{r.recordDate}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: '600', color: 'var(--accent-violet)' }}>{r.diagnosis}</td>
                  <td style={{ whiteSpace: 'pre-wrap' }}>{r.treatment}</td>
                  <td>
                    {r.reportPdf ? (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
                        onClick={() => handleViewPdf(r.reportPdf, r.reportName)}
                        title="View PDF Report"
                      >
                        <FileText size={14} color="var(--accent-cyan)" />
                        <span style={{ fontSize: '0.8rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.reportName || 'View PDF'}
                        </span>
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>No Attachment</span>
                    )}
                  </td>
                  {!isPatient && (
                    <td>
                      <button 
                        style={styles.actionBtn} 
                        className="btn btn-danger btn-icon"
                        onClick={() => handleDelete(r.id)}
                        title="Remove Record"
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

      {/* Add Record Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isPatient ? "Upload X-Ray / Medical Report" : "Add Clinical Record Entry"}>
        <form onSubmit={handleSubmit} style={styles.form}>
          {!isPatient ? (
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
          ) : (
            <div className="form-group">
              <label className="form-label">Patient Medical Card</label>
              <input
                type="text"
                className="form-control"
                value={patients[0] ? `${patients[0].name} (ID: #${patients[0].id})` : ''}
                disabled
              />
            </div>
          )}

          <div style={styles.formRow}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">
                {isPatient ? 'Document Title / Report Name *' : 'Diagnosis Summary *'}
              </label>
              <input
                type="text"
                name="diagnosis"
                className="form-control"
                placeholder={isPatient ? "e.g. Chest X-Ray or Blood Test" : "e.g. Hypertension or Acute Bronchitis"}
                value={formData.diagnosis}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Record Date *</label>
              <input
                type="date"
                name="recordDate"
                className="form-control"
                value={formData.recordDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              {isPatient ? 'Patient Notes / Description *' : 'Treatment Protocol / Description *'}
            </label>
            <textarea
              name="treatment"
              className="form-control"
              placeholder={isPatient ? "e.g. X-Ray taken regarding persistent cough. Doctor advised checkup." : "e.g. Prescribed Lisinopril 10mg daily. Patient advised to reduce sodium intake."}
              value={formData.treatment}
              onChange={handleChange}
              rows="4"
              style={{ resize: 'vertical' }}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">X-Ray / Medical Report (PDF) {isPatient && '*'}</label>
            <input
              type="file"
              accept=".pdf"
              className="form-control"
              onChange={handleFileChange}
              required={isPatient}
              style={{ padding: '8px' }}
            />
            <small style={{ color: 'var(--text-tertiary)' }}>
              Please upload a valid PDF document (Max 5MB).
            </small>
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
              {isPatient ? 'Upload Document' : 'Log Record Entry'}
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
