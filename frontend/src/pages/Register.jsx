import { useState } from 'react';
import { api } from '../services/api';
import { HeartPulse, Lock, Mail, Sun, Moon, ArrowLeft } from 'lucide-react';

export default function Register({ navigateTo, showToast, theme, toggleTheme }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'PATIENT' // Default role
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.role) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.auth.register(formData);
      showToast('Registration successful! Please login.', 'success');
      navigateTo('login');
    } catch (err) {
      showToast(err.message || 'Registration failed. Try a different email.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <button 
        onClick={() => navigateTo('home')} 
        style={styles.backBtn} 
        className="glow-hover"
        title="Back to Home"
      >
        <ArrowLeft size={18} color="var(--text-primary)" />
        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Back</span>
      </button>
      <button 
        onClick={toggleTheme} 
        style={styles.themeToggleBtn} 
        className="glow-hover"
        title="Toggle Theme"
      >
        {theme === 'light' ? <Moon size={18} color="var(--accent-violet)" /> : <Sun size={18} color="var(--warning)" />}
      </button>
      <div className="auth-card glass-panel">
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <HeartPulse size={40} className="animated-heart" />
          </div>
          <h2 style={styles.title} className="gradient-text">Create Account</h2>
          <p style={styles.subtitle}>Join CarePulse Hospital Management Portal</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Choose an email address"
                value={formData.email}
                onChange={handleChange}
                style={styles.inputWithIcon}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Choose a password"
                value={formData.password}
                onChange={handleChange}
                style={styles.inputWithIcon}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Portal Role</label>
            <select
              name="role"
              className="form-control form-select"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
              <option value="ADMIN">Administration</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div style={styles.footer}>
          <span>Already have an account? </span>
          <button 
            onClick={() => navigateTo('login')} 
            style={styles.linkBtn}
            disabled={loading}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '32px'
  },
  logoContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    border: '1px solid rgba(139, 92, 246, 0.2)'
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '700',
    marginBottom: '6px'
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    color: 'var(--text-tertiary)'
  },
  inputWithIcon: {
    paddingLeft: '48px',
    width: '100%'
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    marginTop: '10px'
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)'
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-cyan)',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  backBtn: {
    position: 'absolute',
    top: '24px',
    left: '24px',
    padding: '8px 16px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--glass-bg)',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    transition: 'var(--transition-fast)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    outline: 'none'
  },
  themeToggleBtn: {
    position: 'absolute',
    top: '24px',
    right: '24px',
    padding: '10px',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--glass-bg)',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    transition: 'var(--transition-fast)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    outline: 'none'
  }
};
