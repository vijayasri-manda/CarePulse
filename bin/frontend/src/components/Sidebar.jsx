import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Calendar, 
  CreditCard, 
  FileSpreadsheet, 
  Activity, 
  PieChart, 
  LogOut,
  HeartPulse
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

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

export default function Sidebar() {
  const { role, logout, username } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'DOCTOR', 'PATIENT', 'ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_PATIENT'] },
    { id: 'patients', label: 'Patients', icon: Users, roles: ['ADMIN', 'DOCTOR', 'ROLE_ADMIN', 'ROLE_DOCTOR'] },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope, roles: ['ADMIN', 'DOCTOR', 'ROLE_ADMIN', 'ROLE_DOCTOR'] },
    { id: 'appointments', label: 'Appointments', icon: Calendar, roles: ['ADMIN', 'DOCTOR', 'PATIENT', 'ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_PATIENT'] },
    { id: 'bills', label: 'Billing', icon: CreditCard, roles: ['ADMIN', 'PATIENT', 'ROLE_ADMIN', 'ROLE_PATIENT'] },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileSpreadsheet, roles: ['DOCTOR', 'PATIENT', 'ROLE_DOCTOR', 'ROLE_PATIENT'] },
    { id: 'medical-records', label: 'Medical Records', icon: Activity, roles: ['DOCTOR', 'PATIENT', 'ROLE_DOCTOR', 'ROLE_PATIENT'] },
    { id: 'reports', label: 'Analytics', icon: PieChart, roles: ['ADMIN', 'ROLE_ADMIN'] },
  ];

  const filteredItems = menuItems.filter(item => {
    return item.roles.some(r => role && (role.toUpperCase() === r || `ROLE_${role.toUpperCase()}` === r));
  });

  const getCleanRole = () => {
    if (!role) return '';
    return role.replace('ROLE_', '');
  };

  return (
    <aside style={styles.sidebar} className="glass-panel">
      <div style={styles.brandContainer}>
        <HeartPulse size={32} className="animated-heart" />
        <div>
          <h2 style={styles.brandTitle} className="gradient-text">CarePulse</h2>
          <span style={styles.brandSubtitle}>Hospital Portal</span>
        </div>
      </div>

      <div style={styles.nav}>
        {filteredItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === `/${item.id}` || (item.id === 'dashboard' && location.pathname === '/');
          return (
            <button
              key={item.id}
              onClick={() => navigate(`/${item.id}`)}
              style={{
                ...styles.navItem,
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                borderColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
              className="glow-hover sidebar-item-anim"
            >
              <IconComponent size={20} color={isActive ? '#818cf8' : '#64748b'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div style={styles.profileContainer}>
        <div style={styles.profileDetails}>
          <div style={styles.avatar}>
            {username ? getNameFromEmail(username).charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={styles.avatarText}>
            <span style={styles.username}>{getNameFromEmail(username)}</span>
            <span style={styles.roleBadge}>{getCleanRole()}</span>
          </div>
        </div>
        <button 
          onClick={() => {
            logout();
            navigate('/');
          }} 
          style={styles.logoutBtn} 
          className="btn-danger btn"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    height: 'calc(100vh - 40px)',
    position: 'sticky',
    top: '20px',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    borderRadius: 'var(--border-radius-xl)',
    margin: '20px 0 20px 20px',
    zIndex: 100
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '24px',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '24px'
  },
  brandTitle: {
    fontSize: '1.25rem',
    fontWeight: '800'
  },
  brandSubtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
    overflowY: 'auto'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 16px',
    borderRadius: 'var(--border-radius-md)',
    borderLeft: '4px solid transparent',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'var(--transition-fast)',
    background: 'none',
    border: 'none',
    width: '100%'
  },
  profileContainer: {
    paddingTop: '20px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  profileDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1rem',
    border: '2px solid rgba(255,255,255,0.1)'
  },
  avatarText: {
    display: 'flex',
    flexDirection: 'column'
  },
  username: {
    fontWeight: '600',
    fontSize: '0.9rem',
    color: 'var(--text-primary)'
  },
  roleBadge: {
    fontSize: '0.75rem',
    color: 'var(--accent-cyan)',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  logoutBtn: {
    width: '100%',
    justifyContent: 'center',
    padding: '10px'
  }
};
