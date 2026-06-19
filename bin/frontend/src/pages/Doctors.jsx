import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { Plus, Search, Edit2, Trash2, Heart, Award, Phone, Grid, List, Activity, BookOpen, Stethoscope, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Doctors({ showToast }) {
  const { username, isDoctor } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Grid cards display nicely in 3x2 when itemsPerPage is 6
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    experience: '',
    phone: '',
    department: ''
  });

  const fetchDoctors = async () => {
    try {
      const data = await api.doctors.getAll();
      setDoctors(data);
    } catch (err) {
      showToast('Failed to fetch doctors: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.resolve();
      fetchDoctors();
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setEditingDoctor(null);
    setFormData({
      name: '',
      specialization: '',
      experience: '',
      phone: '',
      department: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name || '',
      specialization: doctor.specialization || '',
      experience: doctor.experience || '',
      phone: doctor.phone || '',
      department: doctor.department || ''
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Doctor name is required', 'error');
      return;
    }
    if (!formData.specialization.trim()) {
      showToast('Specialization is required', 'error');
      return;
    }
    if (!formData.experience || isNaN(formData.experience) || parseInt(formData.experience) < 0) {
      showToast('Please enter a valid experience', 'error');
      return;
    }
    if (!formData.phone.trim()) {
      showToast('Phone number is required', 'error');
      return;
    }

    try {
      const payload = {
        ...formData,
        experience: parseInt(formData.experience),
        username: editingDoctor ? editingDoctor.username : undefined
      };

      if (editingDoctor) {
        await api.doctors.update(editingDoctor.id, payload);
        showToast('Doctor details updated successfully!', 'success');
      } else {
        await api.doctors.create(payload);
        showToast('New doctor profile created successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchDoctors();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor record?')) {
      try {
        const res = await api.doctors.delete(id);
        showToast(res || 'Doctor deleted successfully', 'success');
        fetchDoctors();
      } catch (err) {
        showToast('Failed to delete doctor: ' + err.message, 'error');
      }
    }
  };

  const filteredDoctors = doctors.filter((d) => {
    const matchesSearch =
      (d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.specialization || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.department || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesDept = filterDepartment === 'All' || d.department === filterDepartment;

    if (isDoctor) {
      return matchesSearch && matchesDept && d.username === username;
    }
    return matchesSearch && matchesDept;
  });

  // Unique departments for filtering
  const departments = ['All', ...new Set(doctors.map(d => d.department).filter(Boolean))];

  // Pagination calculations
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const paginatedDoctors = filteredDoctors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const avgExperience = doctors.length 
    ? (doctors.reduce((sum, d) => sum + (d.experience || 0), 0) / doctors.length).toFixed(1)
    : '0.0';

  return (
    <div style={styles.container}>
      {/* Stats Cards */}
      {!isDoctor && (
        <div className="stats-grid">
          <div className="stat-card glass-panel">
            <div style={styles.statInfo}>
              <span style={styles.statTitle}>Medical Staff</span>
              <span style={styles.statValue}>{doctors.length}</span>
              <span style={styles.statDesc}>Active practitioners</span>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>
              <Activity size={24} />
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div style={styles.statInfo}>
              <span style={styles.statTitle}>Specialties</span>
              <span style={styles.statValue}>
                {new Set(doctors.map(d => d.specialization?.trim().toLowerCase()).filter(Boolean)).size}
              </span>
              <span style={styles.statDesc}>Clinical departments</span>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}>
              <BookOpen size={24} />
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div style={styles.statInfo}>
              <span style={styles.statTitle}>Avg. Experience</span>
              <span style={styles.statValue}>{avgExperience} yrs</span>
              <span style={styles.statDesc}>Seniority index</span>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-violet)' }}>
              <Award size={24} />
            </div>
          </div>
        </div>
      )}

      <div style={styles.actionBar}>
        <div style={styles.searchAndFilters}>
          <div style={styles.searchWrapper} className="glass-panel">
            <Search size={18} color="var(--text-tertiary)" />
            <input
              type="text"
              placeholder="Search by name, specialty, dept..."
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <select
            className="form-control form-select"
            value={filterDepartment}
            onChange={(e) => { setFilterDepartment(e.target.value); setCurrentPage(1); }}
            style={styles.filterSelect}
          >
            <option value="All">All Departments</option>
            {departments.filter(dept => dept !== 'All').map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <div style={styles.viewToggle} className="glass-panel">
            <button 
              style={{ ...styles.toggleBtn, color: viewMode === 'grid' ? 'var(--accent-cyan)' : 'var(--text-tertiary)' }}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
            <button 
              style={{ ...styles.toggleBtn, color: viewMode === 'list' ? 'var(--accent-cyan)' : 'var(--text-tertiary)' }}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>
        
        {!isDoctor && (
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            <span>Add Doctor</span>
          </button>
        )}
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <div className="animate-spin" style={styles.spinner}></div>
          <span style={{ color: 'var(--text-secondary)' }}>Loading clinical directories...</span>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div style={styles.emptyContainer} className="glass-panel">
          <Stethoscope size={48} color="var(--text-tertiary)" />
          <h4>No Doctor Profiles Found</h4>
          <p>Register a new clinical profile to populate the directory.</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div style={styles.grid}>
              {paginatedDoctors.map((doc) => (
                <div key={doc.id} className="glass-panel card-hover" style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={styles.avatar}>
                      {doc.name ? doc.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0,2) : 'DR'}
                    </div>
                    <div>
                      <h3 style={styles.docName}>{doc.name}</h3>
                      <span style={styles.specializationBadge}>{doc.specialization}</span>
                    </div>
                  </div>
                  
                  <div style={styles.cardBody}>
                    <div style={styles.infoRow}>
                      <Award size={16} color="var(--text-tertiary)" />
                      <span>{doc.experience} Years Experience</span>
                    </div>
                    <div style={styles.infoRow}>
                      <CheckCircle size={16} color="var(--text-tertiary)" />
                      <span>Cases Solved: <strong>{doc.casesSolved || 0}</strong></span>
                    </div>
                    <div style={styles.infoRow}>
                      <Phone size={16} color="var(--text-tertiary)" />
                      <span>{doc.phone}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <Heart size={16} color="var(--text-tertiary)" />
                      <span>Department: <strong>{doc.department || 'N/A'}</strong></span>
                    </div>
                  </div>

                  {!isDoctor && (
                    <div style={styles.cardActions}>
                      <button 
                        style={styles.cardActionBtn} 
                        className="btn btn-secondary btn-icon glow-hover"
                        onClick={() => openEditModal(doc)}
                        title="Edit Doctor"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        style={styles.cardActionBtn} 
                        className="btn btn-danger btn-icon glow-hover"
                        onClick={() => handleDelete(doc.id)}
                        title="Delete Doctor"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Doctor Name</th>
                    <th>Specialization</th>
                    <th>Department</th>
                    <th>Experience</th>
                    <th>Cases Solved</th>
                    <th>Contact</th>
                    {!isDoctor && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedDoctors.map((doc) => (
                    <tr key={doc.id}>
                      <td style={{ fontWeight: '600' }}>{doc.name}</td>
                      <td>{doc.specialization}</td>
                      <td>{doc.department || 'N/A'}</td>
                      <td>{doc.experience} Years</td>
                      <td style={{ fontWeight: '600', color: 'var(--success)' }}>{doc.casesSolved || 0}</td>
                      <td>{doc.phone}</td>
                      {!isDoctor && (
                        <td>
                          <div style={styles.actionsCell}>
                            <button 
                              style={styles.tableActionBtn} 
                              className="btn btn-secondary btn-icon glow-hover"
                              onClick={() => openEditModal(doc)}
                              title="Edit Doctor"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              style={styles.tableActionBtn} 
                              className="btn btn-danger btn-icon glow-hover"
                              onClick={() => handleDelete(doc.id)}
                              title="Delete Doctor"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
        title={editingDoctor ? "Edit Doctor Profile" : "Register Doctor Profile"}
      >
        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Doctor Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Dr. Sarah Connor"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Specialization</label>
            <input
              type="text"
              name="specialization"
              className="form-control"
              value={formData.specialization}
              onChange={handleChange}
              placeholder="e.g. Cardiologist"
            />
          </div>
          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Experience (Years)</label>
              <input
                type="number"
                name="experience"
                className="form-control"
                value={formData.experience}
                onChange={handleChange}
                placeholder="Years"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Department</label>
              <input
                type="text"
                name="department"
                className="form-control"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Cardiology"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Contact number"
            />
          </div>
          
          <div style={styles.formActions}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingDoctor ? "Save Changes" : "Create Profile"}
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
  statInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  statTitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    fontWeight: '500'
  },
  statValue: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '4px 0'
  },
  statDesc: {
    fontSize: '0.75rem',
    color: 'var(--accent-cyan)',
    fontWeight: '600'
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
  viewToggle: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
    borderRadius: 'var(--border-radius-md)',
    gap: '4px'
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    transition: 'var(--transition-fast)'
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px'
  },
  card: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  avatar: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    border: '1px solid var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '1.1rem'
  },
  docName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '4px'
  },
  specializationBadge: {
    fontSize: '0.75rem',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    color: 'var(--accent-cyan)',
    padding: '2px 8px',
    borderRadius: '9999px',
    fontWeight: '600'
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)'
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  cardActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: 'auto',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-color)'
  },
  cardActionBtn: {
    padding: '6px'
  },
  actionsCell: {
    display: 'flex',
    gap: '8px'
  },
  tableActionBtn: {
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
