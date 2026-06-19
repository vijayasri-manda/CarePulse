import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { Plus, Search, Edit2, Trash2, UserPlus, Heart } from 'lucide-react';

export default function Patients({ showToast }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState('All');
  const [filterBloodGroup, setFilterBloodGroup] = useState('All');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    address: '',
    bloodGroup: 'O+',
    insuranceProvider: ''
  });

  const fetchPatients = async () => {
    try {
      const data = await api.patients.getAll();
      setPatients(data);
    } catch (err) {
      showToast('Failed to fetch patients: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.resolve();
      fetchPatients();
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setEditingPatient(null);
    setFormData({
      name: '',
      age: '',
      gender: 'Male',
      phone: '',
      address: '',
      bloodGroup: 'O+',
      insuranceProvider: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name || '',
      age: patient.age || '',
      gender: patient.gender || 'Male',
      phone: patient.phone || '',
      address: patient.address || '',
      bloodGroup: patient.bloodGroup || 'O+',
      insuranceProvider: patient.insuranceProvider || ''
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation checks
    if (!formData.name.trim()) {
      showToast('Patient name is required', 'error');
      return;
    }
    if (!formData.age || isNaN(formData.age) || parseInt(formData.age) <= 0) {
      showToast('Please enter a valid age', 'error');
      return;
    }
    if (!formData.phone.trim()) {
      showToast('Phone number is required', 'error');
      return;
    }
    // Strict 10-digit phone check (matches backend validation)
    if (formData.phone.length !== 10 || !/^\d{10}$/.test(formData.phone)) {
      showToast('Phone number must be exactly 10 digits', 'error');
      return;
    }

    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age)
      };

      if (editingPatient) {
        await api.patients.update(editingPatient.id, payload);
        showToast('Patient details updated successfully!', 'success');
      } else {
        await api.patients.create(payload);
        showToast('New patient registered successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchPatients();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient record?')) {
      try {
        const res = await api.patients.delete(id);
        showToast(res || 'Patient deleted successfully', 'success');
        fetchPatients();
      } catch (err) {
        showToast('Failed to delete patient: ' + err.message, 'error');
      }
    }
  };

  const filteredPatients = patients.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.phone.includes(searchQuery);
    const matchesGender = filterGender === 'All' || p.gender === filterGender;
    const matchesBloodGroup = filterBloodGroup === 'All' || p.bloodGroup === filterBloodGroup;
    return matchesSearch && matchesGender && matchesBloodGroup;
  });

  // Calculate paginated slice
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = filteredPatients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={styles.container}>
      <div style={styles.actionBar}>
        <div style={styles.searchAndFilters}>
          <div style={styles.searchWrapper} className="glass-panel">
            <Search size={18} color="var(--text-tertiary)" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <select
            className="form-control form-select"
            value={filterGender}
            onChange={(e) => { setFilterGender(e.target.value); setCurrentPage(1); }}
            style={styles.filterSelect}
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <select
            className="form-control form-select"
            value={filterBloodGroup}
            onChange={(e) => { setFilterBloodGroup(e.target.value); setCurrentPage(1); }}
            style={styles.filterSelect}
          >
            <option value="All">All Blood Groups</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
        
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          <span>Add Patient</span>
        </button>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <div className="animate-spin" style={styles.spinner}></div>
          <span style={{ color: 'var(--text-secondary)' }}>Loading patient records...</span>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div style={styles.emptyContainer} className="glass-panel">
          <UserPlus size={48} color="var(--text-tertiary)" />
          <h4>No Patients Found</h4>
          <p>Register a new patient to get started.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Age / Gender</th>
                  <th>Contact</th>
                  <th>Blood Group</th>
                  <th>Insurance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPatients.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td style={{ fontWeight: '600' }}>{p.name}</td>
                    <td>{p.age} yrs / {p.gender}</td>
                    <td>{p.phone}</td>
                    <td>
                      <span className="badge badge-success" style={{ gap: '4px' }}>
                        <Heart size={10} fill="#34d399" /> {p.bloodGroup || 'N/A'}
                      </span>
                    </td>
                    <td>{p.insuranceProvider || <span style={{ color: 'var(--text-tertiary)' }}>None</span>}</td>
                    <td>
                      <div style={styles.actionsCell}>
                        <button 
                          style={styles.actionBtn} 
                          className="btn btn-secondary btn-icon glow-hover"
                          onClick={() => openEditModal(p)}
                          title="Edit Patient"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          style={styles.actionBtn} 
                          className="btn btn-danger btn-icon glow-hover"
                          onClick={() => handleDelete(p.id)}
                          title="Delete Patient"
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

      {/* Add / Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingPatient ? "Edit Patient Record" : "Add Patient Profile"}
      >
        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
            />
          </div>
          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Age</label>
              <input
                type="number"
                name="age"
                className="form-control"
                value={formData.age}
                onChange={handleChange}
                placeholder="Years"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Gender</label>
              <select
                name="gender"
                className="form-control form-select"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit number"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Blood Group</label>
              <select
                name="bloodGroup"
                className="form-control form-select"
                value={formData.bloodGroup}
                onChange={handleChange}
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
          </div>
          <div className="form-group">
            <label className="form-label">Insurance Provider</label>
            <input
              type="text"
              name="insuranceProvider"
              className="form-control"
              value={formData.insuranceProvider}
              onChange={handleChange}
              placeholder="e.g. Blue Cross (Optional)"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <textarea
              name="address"
              className="form-control"
              value={formData.address}
              onChange={handleChange}
              placeholder="Full address details"
              rows="2"
              style={{ resize: 'none' }}
            />
          </div>
          
          <div style={styles.formActions}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingPatient ? "Save Changes" : "Create Profile"}
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
  actionsCell: {
    display: 'flex',
    gap: '8px'
  },
  actionBtn: {
    padding: '6px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  row: {
    display: 'flex',
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
