import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { HeartPulse, Lock, Mail, Eye, EyeOff, Sun, Moon, ArrowLeft } from 'lucide-react';

export default function Login({ navigateTo, showToast, theme, toggleTheme }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.auth.login(formData);
      login(response.token, response.email, response.role);
      showToast('Successfully logged in!', 'success');
      navigateTo('dashboard');
    } catch (err) {
      showToast(err.message || 'Login failed. Invalid credentials.', 'error');
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
          <h2 style={styles.title} className="gradient-text">Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to access CarePulse Portal</p>
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
                placeholder="Enter email address"
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
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-control"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                style={styles.inputWithIcon}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          <span>Don't have an account? </span>
          <button 
            onClick={() => navigateTo('register')} 
            style={styles.linkBtn}
            disabled={loading}
          >
            Register here
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
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    border: '1px solid rgba(6, 182, 212, 0.2)'
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
  eyeBtn: {
    position: 'absolute',
    right: '16px',
    background: 'none',
    border: 'none',
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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
