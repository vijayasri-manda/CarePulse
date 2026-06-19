import { ShieldAlert, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

export default function Header({ theme, toggleTheme }) {
  const { role } = useAuth();
  const location = useLocation();
  
  // Extract path and default to 'dashboard'
  const activeTab = location.pathname.replace(/^\//, '') || 'dashboard';
  
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'patients': return 'Patient Registry';
      case 'doctors': return 'Medical Staff';
      case 'appointments': return 'Appointment Schedule';
      case 'bills': return 'Financial Billing';
      case 'prescriptions': return 'Prescription Manager';
      case 'medical-records': return 'Diagnostic History';
      case 'reports': return 'Hospital Intelligence';
      default: return 'Hospital Management';
    }
  };

  const getCleanRole = () => {
    if (!role) return '';
    return role.replace('ROLE_', '');
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header style={styles.header} className="glass-panel">
      <div>
        <h1 style={styles.title}>{getTabTitle()}</h1>
        <span style={styles.subtitle}>{today}</span>
      </div>

      <div style={styles.actions}>
        <button 
          onClick={toggleTheme} 
          style={styles.themeToggleBtn} 
          className="glow-hover"
          title="Toggle Sun/Moon Mode"
        >
          {theme === 'light' ? <Moon size={18} color="var(--accent-violet)" /> : <Sun size={18} color="var(--warning)" />}
        </button>
        <div style={styles.roleBadgeContainer}>
          <ShieldAlert size={16} color="var(--accent-violet)" />
          <span>Role: <strong style={{color: 'var(--text-primary)'}}>{getCleanRole()}</strong></span>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    padding: '20px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 'var(--border-radius-xl)',
    marginBottom: '20px',
    border: '1px solid var(--border-color)'
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: '700'
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)'
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  roleBadgeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    color: 'var(--accent-violet)',
    padding: '8px 16px',
    borderRadius: '9999px',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  themeToggleBtn: {
    padding: '8px',
    borderRadius: '50%',
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    transition: 'var(--transition-fast)',
    outline: 'none'
  }
};
