import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TrendingUp, DollarSign, Users } from 'lucide-react';

export default function Reports({ showToast }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const data = await api.dashboard.getReportSummary();
      setSummary(data);
    } catch (err) {
      showToast('Failed to fetch analytics summary: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.resolve();
      fetchSummary();
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="animate-spin" style={styles.spinner}></div>
        <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Compiling hospital intelligence reports...</p>
      </div>
    );
  }

  const totalRevenue = summary?.totalRevenue || 0;
  const totalPatients = summary?.totalPatients || 0;
  const totalAppointments = summary?.totalAppointments || 0;
  const totalDoctors = summary?.totalDoctors || 0;

  // Let's compute some nice mock metrics based on actual numbers
  const avgRevenuePerPatient = totalPatients > 0 ? (totalRevenue / totalPatients) : 0;
  const avgAppointmentsPerDoctor = totalDoctors > 0 ? (totalAppointments / totalDoctors) : 0;

  return (
    <div style={styles.container}>
      {/* Top Header Card */}
      <div style={styles.headerCard} className="glass-panel">
        <div>
          <h3 style={styles.cardTitle} className="gradient-text">Hospital Revenue & Patient Engagement</h3>
          <p style={styles.cardSubtitle}>Real-time analytics collected from billing, appointment and registration systems</p>
        </div>
        <div style={styles.iconContainer}>
          <TrendingUp size={36} color="var(--success)" />
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div style={styles.grid}>
        {/* Revenue Breakdown */}
        <div style={styles.panel} className="glass-panel">
          <h4 style={styles.panelTitle}>Financial Summary</h4>
          <div style={styles.statRow}>
            <div style={styles.iconBg} className="success-light">
              <DollarSign size={20} color="var(--success)" />
            </div>
            <div>
              <span style={styles.statLabel}>Total Gross Revenue</span>
              <h2 style={{ ...styles.statVal, color: 'var(--success)' }}>${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
            </div>
          </div>

          <div style={styles.divider}></div>

          <div style={styles.detailsList}>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Average Value per Patient</span>
              <span style={styles.detailValue}>${avgRevenuePerPatient.toFixed(2)}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Estimated Net Income (75%)</span>
              <span style={styles.detailValue}>${(totalRevenue * 0.75).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>

        {/* Engagement Summary */}
        <div style={styles.panel} className="glass-panel">
          <h4 style={styles.panelTitle}>Engagement Analysis</h4>
          <div style={styles.statRow}>
            <div style={styles.iconBg} className="primary-light">
              <Users size={20} color="var(--primary)" />
            </div>
            <div>
              <span style={styles.statLabel}>Total Registered Patients</span>
              <h2 style={styles.statVal}>{totalPatients} Patients</h2>
            </div>
          </div>

          <div style={styles.divider}></div>

          <div style={styles.detailsList}>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Total Booked Consultations</span>
              <span style={styles.detailValue}>{totalAppointments}</span>
            </div>
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Average Appointments per Doctor</span>
              <span style={styles.detailValue}>{avgAppointmentsPerDoctor.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Progress/Distribution Ratios */}
      <div style={styles.panel} className="glass-panel">
        <h4 style={styles.panelTitle}>Key Indicators (Target Progress)</h4>
        <p style={styles.panelSubtitle}>Current hospital capacity and throughput statistics</p>

        <div style={styles.indicatorContainer}>
          <div style={styles.indicatorItem}>
            <div style={styles.indicatorHeader}>
              <span>Patient-to-Doctor Ratio (Recommended max 25:1)</span>
              <strong>{totalDoctors > 0 ? (totalPatients / totalDoctors).toFixed(1) : 0} : 1</strong>
            </div>
            <div style={styles.progressBarBg}>
              <div 
                style={{
                  ...styles.progressBar, 
                  width: `${Math.min(100, (totalDoctors > 0 ? (totalPatients / totalDoctors) : 0) * 4)}%`,
                  backgroundColor: 'var(--primary)'
                }}
              ></div>
            </div>
          </div>

          <div style={styles.indicatorItem}>
            <div style={styles.indicatorHeader}>
              <span>Revenue Target Completion (Monthly Target: $100,000)</span>
              <strong>{Math.min(100, (totalRevenue / 100000) * 100).toFixed(1)}%</strong>
            </div>
            <div style={styles.progressBarBg}>
              <div 
                style={{
                  ...styles.progressBar, 
                  width: `${Math.min(100, (totalRevenue / 100000) * 100)}%`,
                  backgroundColor: 'var(--success)'
                }}
              ></div>
            </div>
          </div>

          <div style={styles.indicatorItem}>
            <div style={styles.indicatorHeader}>
              <span>Appointment Completion rate</span>
              <strong>85.0% (Clinical Standard)</strong>
            </div>
            <div style={styles.progressBarBg}>
              <div 
                style={{
                  ...styles.progressBar, 
                  width: '85%',
                  backgroundColor: 'var(--accent-cyan)'
                }}
              ></div>
            </div>
          </div>
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
  headerCard: {
    padding: '28px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(16, 185, 129, 0.08) 100%)'
  },
  cardTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    marginBottom: '6px'
  },
  cardSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem'
  },
  iconContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    padding: '16px',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid rgba(16, 185, 129, 0.2)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '24px'
  },
  panel: {
    padding: '24px'
  },
  panelTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '16px'
  },
  panelSubtitle: {
    color: 'var(--text-tertiary)',
    fontSize: '0.85rem',
    marginBottom: '20px',
    marginTop: '-12px'
  },
  statRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px'
  },
  iconBg: {
    width: '44px',
    height: '44px',
    borderRadius: 'var(--border-radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255,255,255,0.03)'
  },
  statLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.02em'
  },
  statVal: {
    fontSize: '1.75rem',
    fontWeight: '700'
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '20px 0'
  },
  detailsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.9rem'
  },
  detailLabel: {
    color: 'var(--text-secondary)'
  },
  detailValue: {
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  indicatorContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginTop: '8px'
  },
  indicatorItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  indicatorHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)'
  },
  progressBarBg: {
    height: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 1s ease-in-out'
  }
};
