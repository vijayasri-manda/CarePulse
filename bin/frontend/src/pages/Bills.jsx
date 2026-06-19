import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { Plus, CreditCard, Trash2, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Bills({ showToast }) {
  const { username, isPatient } = useAuth();
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('All');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    consultationFee: '',
    medicineCharges: '',
    labCharges: '',
    paymentStatus: 'Pending'
  });

  const fetchBills = async () => {
    try {
      const data = await api.bills.getAll();
      setBills(data);
    } catch (err) {
      showToast('Failed to fetch bills: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const data = await api.patients.getAll();
      setPatients(data);
    } catch (err) {
      showToast('Error loading patient directory: ' + err.message, 'error');
    }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.resolve();
      fetchBills();
      fetchPatients();
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    if (patients.length === 0) {
      showToast('Please add at least one patient record first.', 'warning');
      return;
    }
    setFormData({
      patientId: patients[0].id.toString(),
      consultationFee: '',
      medicineCharges: '',
      labCharges: '',
      paymentStatus: 'Pending'
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const consult = parseFloat(formData.consultationFee) || 0;
    const meds = parseFloat(formData.medicineCharges) || 0;
    const lab = parseFloat(formData.labCharges) || 0;

    if (consult <= 0 && meds <= 0 && lab <= 0) {
      showToast('At least one fee charge must be greater than 0', 'error');
      return;
    }

    try {
      const payload = {
        consultationFee: consult,
        medicineCharges: meds,
        labCharges: lab,
        paymentStatus: formData.paymentStatus,
        patient: { id: parseInt(formData.patientId) }
      };

      await api.bills.create(payload);
      showToast('Billing invoice generated successfully!', 'success');
      setIsModalOpen(false);
      fetchBills();
    } catch (err) {
      showToast('Generation failed: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this billing invoice?')) {
      try {
        const res = await api.bills.delete(id);
        showToast(res || 'Bill deleted successfully', 'success');
        fetchBills();
      } catch (err) {
        showToast('Failed to delete bill: ' + err.message, 'error');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <span className="badge badge-success" style={{ gap: '4px' }}><CheckCircle2 size={12} /> Paid</span>;
      case 'Pending':
        return <span className="badge badge-warning" style={{ gap: '4px' }}><AlertCircle size={12} /> Pending</span>;
      default:
        return <span className="badge badge-danger" style={{ gap: '4px' }}><AlertCircle size={12} /> Unpaid</span>;
    }
  };

  const filteredBills = bills.filter((b) => {
    const matchesStatus = filterPaymentStatus === 'All' || b.paymentStatus === filterPaymentStatus;

    if (isPatient) {
      return b.patient && b.patient.username === username && matchesStatus;
    }
    const patientName = b.patient ? b.patient.name : '';
    const matchesSearch = patientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const paginatedBills = filteredBills.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={styles.container}>
      <div style={styles.actionBar}>
        <div style={styles.searchAndFilters}>
          {!isPatient && (
            <div style={styles.searchWrapper} className="glass-panel">
              <Search size={18} color="var(--text-tertiary)" />
              <input
                type="text"
                placeholder="Search by patient name..."
                style={styles.searchInput}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          )}

          <select
            className="form-control form-select"
            value={filterPaymentStatus}
            onChange={(e) => { setFilterPaymentStatus(e.target.value); setCurrentPage(1); }}
            style={styles.filterSelect}
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
        
        {!isPatient && (
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            <span>New Invoice</span>
          </button>
        )}
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <div className="animate-spin" style={styles.spinner}></div>
          <span style={{ color: 'var(--text-secondary)' }}>Loading ledger books...</span>
        </div>
      ) : filteredBills.length === 0 ? (
        <div style={styles.emptyContainer} className="glass-panel">
          <CreditCard size={48} color="var(--text-tertiary)" />
          <h4>No Billing Records Found</h4>
          <p>{isPatient ? 'You do not have any invoices at this time.' : 'Generate a new patient invoice to populate the billing ledger.'}</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Patient Name</th>
                  <th>Consultation Fee</th>
                  <th>Pharmacy Fee</th>
                  <th>Lab Charges</th>
                  <th style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Total Amount</th>
                  <th>Payment Status</th>
                  {!isPatient && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedBills.map((b) => (
                  <tr key={b.id}>
                    <td>#INV-{b.id}</td>
                    <td>{b.patient ? b.patient.name : 'Unknown'}</td>
                    <td>${b.consultationFee.toFixed(2)}</td>
                    <td>${b.medicineCharges.toFixed(2)}</td>
                    <td>${b.labCharges.toFixed(2)}</td>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>${b.totalAmount.toFixed(2)}</td>
                    <td>{getStatusBadge(b.paymentStatus)}</td>
                    {!isPatient && (
                      <td>
                        <button 
                          style={styles.actionBtn} 
                          className="btn btn-danger btn-icon glow-hover"
                          onClick={() => handleDelete(b.id)}
                          title="Delete Invoice"
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
        title="Generate Patient Billing Invoice"
      >
        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Select Patient Profile</label>
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
          
          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Consultation Fee ($)</label>
              <input
                type="number"
                step="0.01"
                name="consultationFee"
                className="form-control"
                value={formData.consultationFee}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Pharmacy Charges ($)</label>
              <input
                type="number"
                step="0.01"
                name="medicineCharges"
                className="form-control"
                value={formData.medicineCharges}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>

          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Laboratory Charges ($)</label>
              <input
                type="number"
                step="0.01"
                name="labCharges"
                className="form-control"
                value={formData.labCharges}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Payment Status</label>
              <select
                name="paymentStatus"
                className="form-control form-select"
                value={formData.paymentStatus}
                onChange={handleChange}
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>
          
          <div style={styles.formActions}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Generate Ledger Entry
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
