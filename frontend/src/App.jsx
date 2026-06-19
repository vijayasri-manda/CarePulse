import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Bills from './pages/Bills';
import Prescriptions from './pages/Prescriptions';
import MedicalRecords from './pages/MedicalRecords';
import Reports from './pages/Reports';
import Home from './pages/Home';

// Icons
import { AlertCircle, CheckCircle2 } from 'lucide-react';

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  const hasAccess = allowedRoles.some(r => role && (role.toUpperCase() === r || `ROLE_${role.toUpperCase()}` === r));
  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function MainAppContent() {
  const { isAuthenticated } = useAuth();
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const navigate = useNavigate();

  // Sync theme class to document element
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Global toast function
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Auto clear toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const navigateTo = (destination) => {
    if (destination === 'home') {
      navigate('/');
    } else {
      navigate(`/${destination}`);
    }
  };

  // Non-authenticated routing
  if (!isAuthenticated) {
    return (
      <>
        <Routes>
          <Route path="/" element={<Home navigateTo={navigateTo} theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/home" element={<Home navigateTo={navigateTo} theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/register" element={<Register navigateTo={navigateTo} showToast={showToast} theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/login" element={<Login navigateTo={navigateTo} showToast={showToast} theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        {toast && <ToastAlert toast={toast} />}
      </>
    );
  }

  // Authenticated Dashboard Shell
  return (
    <>
      <Layout theme={theme} toggleTheme={toggleTheme}>
        <div className="page-transition">
          <Routes>
            <Route path="/dashboard" element={<Dashboard showToast={showToast} />} />
            <Route path="/patients" element={<ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'ROLE_ADMIN', 'ROLE_DOCTOR']}><Patients showToast={showToast} /></ProtectedRoute>} />
            <Route path="/doctors" element={<ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'ROLE_ADMIN', 'ROLE_DOCTOR']}><Doctors showToast={showToast} /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'PATIENT', 'ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_PATIENT']}><Appointments showToast={showToast} /></ProtectedRoute>} />
            <Route path="/bills" element={<ProtectedRoute allowedRoles={['ADMIN', 'PATIENT', 'ROLE_ADMIN', 'ROLE_PATIENT']}><Bills showToast={showToast} /></ProtectedRoute>} />
            <Route path="/prescriptions" element={<ProtectedRoute allowedRoles={['DOCTOR', 'PATIENT', 'ROLE_DOCTOR', 'ROLE_PATIENT']}><Prescriptions showToast={showToast} /></ProtectedRoute>} />
            <Route path="/medical-records" element={<ProtectedRoute allowedRoles={['DOCTOR', 'PATIENT', 'ROLE_DOCTOR', 'ROLE_PATIENT']}><MedicalRecords showToast={showToast} /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute allowedRoles={['ADMIN', 'ROLE_ADMIN']}><Reports showToast={showToast} /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/home" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Layout>
      
      {toast && <ToastAlert toast={toast} />}
    </>
  );
}

// Sub-component for overlay toast alert
function ToastAlert({ toast }) {
  const isSuccess = toast.type === 'success';
  return (
    <div className="toast-container">
      <div className={`toast ${isSuccess ? 'toast-success' : 'toast-error'}`}>
        {isSuccess ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
