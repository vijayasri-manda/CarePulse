import { useState } from 'react';
import { 
  HeartPulse, 
  ShieldAlert, 
  Activity, 
  Stethoscope, 
  FileSpreadsheet, 
  CreditCard, 
  PieChart, 
  ArrowRight, 
  Lock, 
  CheckCircle,
  Sun,
  Moon,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home({ navigateTo, theme, toggleTheme }) {
  const { isAuthenticated } = useAuth();

  const [particleStyles] = useState(() =>
    Array.from({ length: 15 }, () => ({
      size: Math.random() * 20 + 10,
      left: Math.random() * 100,
      delay: Math.random() * 15,
      duration: Math.random() * 15 + 10
    }))
  );

  const services = [
    {
      title: "Emergency Care",
      desc: "Immediate alert and triage orchestration. Fully integrated critical care monitoring system.",
      icon: ShieldAlert,
      color: "var(--danger)",
      bg: "var(--danger-light)"
    },
    {
      title: "Patient Diagnostics",
      desc: "Digital medical records tracking vitals, laboratory tests, and complete diagnostic history.",
      icon: Activity,
      color: "var(--accent-cyan)",
      bg: "rgba(6, 182, 212, 0.1)"
    },
    {
      title: "Staff Coordination",
      desc: "Integrated medical staff registry matching departments with experienced practitioners.",
      icon: Stethoscope,
      color: "var(--accent-violet)",
      bg: "rgba(139, 92, 246, 0.1)"
    },
    {
      title: "Digital Prescriptions",
      desc: "Instant prescription dispatch, dosage logs, and electronic pharmacy integrations.",
      icon: FileSpreadsheet,
      color: "#ec4899",
      bg: "rgba(236, 72, 153, 0.1)"
    },
    {
      title: "Automated Billing",
      desc: "Seamless invoicing, insurance provider integration, and flexible payment status tracking.",
      icon: CreditCard,
      color: "var(--success)",
      bg: "var(--success-light)"
    },
    {
      title: "Clinical Analytics",
      desc: "Advanced executive dashboards detailing total patient flow, staff efficiency, and financial returns.",
      icon: PieChart,
      color: "var(--warning)",
      bg: "var(--warning-light)"
    }
  ];

  const promotionalOffers = [
    {
      title: "Essential Health Screening",
      badge: "30% Off Special",
      originalPrice: 70,
      discountPrice: 49,
      features: ["Complete Blood Count (CBC)", "Glucose & Kidney Tests", "General Practitioner Consultation"],
      color: "var(--accent-cyan)",
      bg: "rgba(6, 182, 212, 0.1)"
    },
    {
      title: "Cardiac Wellness Checkup",
      badge: "40% Off Premium",
      originalPrice: 150,
      discountPrice: 89,
      features: ["Advanced Electrocardiogram (ECG)", "Lipid Panel & Cholesterol Profile", "Specialist Cardiologist Review"],
      color: "var(--primary)",
      bg: "var(--primary-light)"
    },
    {
      title: "Full Body Family Care Package",
      badge: "Best Value Offer",
      originalPrice: 199,
      discountPrice: 129,
      features: ["Vitals & BMI Analysis", "Lab Reports for 2 Adults + 1 Kid", "Comprehensive Consultation"],
      color: "var(--accent-violet)",
      bg: "rgba(139, 92, 246, 0.1)"
    }
  ];

  return (
    <div style={styles.page}>
      {/* Decorative Floating Medical Cross Particles */}
      <div className="particles-container" style={styles.particlesContainer}>
        {particleStyles.map((p, i) => {
          return (
            <div 
              key={i} 
              className="particle"
              style={{
                ...styles.particle,
                width: p.size,
                height: p.size,
                left: `${p.left}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`
              }}
            >
              ✚
            </div>
          );
        })}
      </div>

      {/* Landing Header */}
      <header style={styles.header} className="glass-panel">
        <div style={styles.logoContainer}>
          <HeartPulse size={36} className="animated-heart" />
          <h2 style={styles.logoText} className="gradient-text">CarePulse</h2>
        </div>
        <nav style={styles.nav}>
          <a href="#services" style={styles.navLink}>Services</a>
          <a href="#about" style={styles.navLink}>About Portal</a>
          <button 
            onClick={toggleTheme} 
            style={styles.themeToggleBtn} 
            className="glow-hover"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} color="var(--accent-violet)" /> : <Sun size={18} color="var(--warning)" />}
          </button>
          <button 
            onClick={() => navigateTo('login')} 
            className="btn btn-secondary glow-hover"
            style={styles.signInBtn}
          >
            Portal Sign In
          </button>
          <button 
            onClick={() => navigateTo('register')} 
            className="btn btn-primary glow-hover"
            style={styles.registerBtn}
          >
            Join Staff
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.badge} className="glass-panel">
            <span style={{ color: 'var(--accent-cyan)' }}>⚡ Next-Gen Healthcare Operations</span>
          </div>
          <h1 style={styles.heroTitle}>
            Unified Intelligence for <span className="gradient-text">Modern Clinics</span>
          </h1>
          <p style={styles.heroSubtitle}>
            CarePulse is an advanced clinical management system linking doctors, patients, billing, and prescriptions under a beautifully integrated secure portal.
          </p>
          <div style={styles.heroActions}>
            <button 
              onClick={() => (isAuthenticated ? navigateTo('dashboard') : navigateTo('login'))} 
              className="btn btn-primary glow-hover"
              style={styles.heroMainBtn}
            >
              <span>Launch Staff Portal</span>
              <ArrowRight size={18} />
            </button>
            <a href="#services" className="btn btn-secondary glow-hover" style={styles.heroSecBtn}>
              Explore Services
            </a>
          </div>
        </div>

        {/* Hero Decorative Graphic - Orbiting Medical Icons */}
        <div style={styles.heroGraphicWrapper}>
          <div className="medical-orbit-container">
            <div className="orbit-center">
              <HeartPulse size={44} className="animated-heart" style={{ marginBottom: '8px' }} />
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CarePulse</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Doctors & Patients Hub</span>
            </div>
            <div className="orbit-ring">
              <div className="orbit-item orbit-item-1" title="Patients Access">
                <Users size={22} color="var(--accent-cyan)" />
              </div>
              <div className="orbit-item orbit-item-2" title="Doctor Consultations">
                <Stethoscope size={22} color="var(--accent-violet)" />
              </div>
              <div className="orbit-item orbit-item-3" title="Health Vitals Track">
                <Activity size={22} color="#ec4899" />
              </div>
              <div className="orbit-item orbit-item-4" title="Digital Prescriptions">
                <FileSpreadsheet size={22} color="var(--success)" />
              </div>
              <div className="orbit-item orbit-item-5" title="Billing Statements">
                <CreditCard size={22} color="var(--warning)" />
              </div>
              <div className="orbit-item orbit-item-6" title="Emergency Operations">
                <ShieldAlert size={22} color="var(--danger)" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle} className="gradient-text">Our Integrated Clinical Services</h2>
          <p style={styles.sectionSubtitle}>CarePulse binds all primary branches of modern clinical workflow into a singular interactive network.</p>
        </div>

        <div style={styles.servicesGrid}>
          {services.map((srv, idx) => {
            const IconComponent = srv.icon;
            return (
              <div key={idx} style={styles.serviceCard} className="glass-panel stat-card">
                <div style={{...styles.serviceIconBg, backgroundColor: srv.bg, color: srv.color}}>
                  <IconComponent size={24} />
                </div>
                <h3 style={styles.serviceCardTitle}>{srv.title}</h3>
                <p style={styles.serviceCardDesc}>{srv.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Promotional Discounts and Health Checkup Packages */}
      <section id="promotions" style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={styles.badge} className="glass-panel">
            <span style={{ color: 'var(--warning)' }}>🎁 Limited Time Wellness Discounts</span>
          </div>
          <h2 style={styles.sectionTitle} className="gradient-text">Health Checkup Packages & Offers</h2>
          <p style={styles.sectionSubtitle}>Book preventive health checkups at discounted prices. Prioritize your well-being today.</p>
        </div>

        <div style={styles.promotionsGrid}>
          {promotionalOffers.map((offer, idx) => (
            <div key={idx} style={styles.promoCard} className="glass-panel stat-card">
              <span style={{ ...styles.promoBadge, backgroundColor: offer.bg, color: offer.color }}>{offer.badge}</span>
              <h3 style={styles.promoTitle}>{offer.title}</h3>
              
              <div style={styles.priceContainer}>
                <span style={styles.originalPrice}>${offer.originalPrice}</span>
                <span style={styles.discountPrice}>${offer.discountPrice}</span>
              </div>

              <ul style={styles.promoList}>
                {offer.features.map((feat, fIdx) => (
                  <li key={fIdx} style={styles.promoListItem}>
                    <span style={styles.bulletCheck}>✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => {
                  localStorage.setItem('selectedOffer', JSON.stringify({
                    title: offer.title,
                    discountPrice: offer.discountPrice,
                    originalPrice: offer.originalPrice,
                    badge: offer.badge,
                    features: offer.features,
                    color: offer.color,
                    bg: offer.bg
                  }));
                  if (isAuthenticated) {
                    navigateTo('dashboard');
                  } else {
                    navigateTo('register');
                  }
                }}
                className="btn btn-secondary glow-hover"
                style={{ width: '100%', marginTop: 'auto' }}
              >
                Book Package Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={{...styles.section, ...styles.aboutSection}} className="glass-panel">
        <div style={styles.aboutGrid}>
          <div style={styles.aboutContent}>
            <h2 style={styles.aboutTitle} className="gradient-text">Secure. Unified. Compliant.</h2>
            <p style={styles.aboutText}>
              CarePulse was built from the ground up to solve administrative friction in modern medical hubs. By uniting client diagnostics, medical billing statements, drug prescriptions, and doctor schedules, CarePulse minimizes data synchronization lag.
            </p>
            <div style={styles.checklist}>
              <div style={styles.checkItem}>
                <CheckCircle size={18} color="var(--success)" />
                <span>HIPAA-aligned records architecture protecting clinical data</span>
              </div>
              <div style={styles.checkItem}>
                <CheckCircle size={18} color="var(--success)" />
                <span>Multi-role access validation restricting unauthorized queries</span>
              </div>
              <div style={styles.checkItem}>
                <CheckCircle size={18} color="var(--success)" />
                <span>Interactive intelligence compiling metrics instantaneously</span>
              </div>
            </div>
          </div>

          <div style={styles.securityHighlightContainer}>
            <div style={styles.securityCard} className="glass-panel">
              <Lock size={48} color="var(--accent-violet)" className="animated-heart" />
              <h3 style={{margin: '16px 0 8px 0', fontSize: '1.2rem'}}>Protected Portal access</h3>
              <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center'}}>
                Only verified clinical staff, receptionists, and administrators are authorized to log into the main operations shell.
              </p>
              <button 
                onClick={() => navigateTo('login')}
                className="btn btn-primary glow-hover"
                style={{marginTop: '20px', width: '100%'}}
              >
                Access Portal Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerMain}>
          <div style={styles.logoContainer}>
            <HeartPulse size={24} className="animated-heart" />
            <h3 style={{...styles.logoText, fontSize: '1.2rem'}} className="gradient-text">CarePulse</h3>
          </div>
          <p style={styles.footerText}>© 2026 CarePulse Medical Systems Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    position: 'relative',
    overflowX: 'hidden',
    padding: '0 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '60px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    paddingTop: '20px'
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    overflow: 'hidden',
    zIndex: 0
  },
  particle: {
    position: 'absolute',
    color: 'rgba(79, 70, 229, 0.1)',
    fontFamily: 'sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'floatParticle 16s infinite linear'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 32px',
    borderRadius: 'var(--border-radius-xl)',
    zIndex: 10
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: '800',
    letterSpacing: '-0.03em'
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },
  navLink: {
    fontSize: '0.95rem',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    transition: 'color var(--transition-fast)'
  },
  themeToggleBtn: {
    padding: '8px',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    transition: 'var(--transition-fast)',
    outline: 'none'
  },
  signInBtn: {
    padding: '8px 18px',
    fontSize: '0.9rem'
  },
  registerBtn: {
    padding: '8px 18px',
    fontSize: '0.9rem'
  },
  heroSection: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '60px',
    alignItems: 'center',
    minHeight: '65vh',
    position: 'relative',
    zIndex: 2,
    marginTop: '20px'
  },
  heroContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '24px'
  },
  badge: {
    padding: '6px 14px',
    borderRadius: '9999px',
    fontSize: '0.85rem',
    fontWeight: '700',
    border: '1px solid var(--glass-border)'
  },
  heroTitle: {
    fontSize: '3.5rem',
    lineHeight: '1.15',
    fontWeight: '800',
    letterSpacing: '-0.04em'
  },
  heroSubtitle: {
    fontSize: '1.15rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    maxWidth: '540px'
  },
  heroActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginTop: '8px'
  },
  heroMainBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 28px'
  },
  heroSecBtn: {
    padding: '14px 28px',
    fontSize: '0.95rem',
    fontWeight: '600'
  },
  heroGraphicWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
    position: 'relative',
    zIndex: 2
  },
  sectionHeader: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '800'
  },
  sectionSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    maxWidth: '600px'
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px'
  },
  serviceCard: {
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'flex-start',
    cursor: 'default'
  },
  serviceIconBg: {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--border-radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255,255,255,0.03)'
  },
  serviceCardTitle: {
    fontSize: '1.25rem',
    fontWeight: '700'
  },
  serviceCardDesc: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5'
  },
  aboutSection: {
    padding: '60px 40px'
  },
  aboutGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '60px',
    alignItems: 'center'
  },
  aboutContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  aboutTitle: {
    fontSize: '2rem',
    fontWeight: '800'
  },
  aboutText: {
    fontSize: '1.05rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.6'
  },
  checklist: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '10px'
  },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '0.95rem',
    fontWeight: '500'
  },
  securityHighlightContainer: {
    display: 'flex',
    justifyContent: 'center'
  },
  securityCard: {
    padding: '40px 30px',
    width: '100%',
    maxWidth: '360px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px solid var(--glass-border)'
  },
  footer: {
    marginTop: '40px',
    padding: '32px 0',
    borderTop: '1px solid var(--border-color)',
    zIndex: 2
  },
  footerMain: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  footerText: {
    fontSize: '0.85rem',
    color: 'var(--text-tertiary)'
  },
  promotionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px'
  },
  promoCard: {
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'flex-start',
    position: 'relative',
    overflow: 'hidden'
  },
  promoBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '9999px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  promoTitle: {
    fontSize: '1.3rem',
    fontWeight: '700'
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '10px',
    margin: '8px 0'
  },
  originalPrice: {
    fontSize: '1.15rem',
    color: 'var(--text-tertiary)',
    textDecoration: 'line-through'
  },
  discountPrice: {
    fontSize: '2.2rem',
    fontWeight: '800',
    color: 'var(--success)'
  },
  promoList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
    marginBottom: '16px'
  },
  promoListItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4'
  },
  bulletCheck: {
    color: 'var(--success)',
    fontWeight: 'bold'
  }
};
