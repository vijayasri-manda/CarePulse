import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ theme, toggleTheme, children }) {
  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.mainContent}>
        <Header theme={theme} toggleTheme={toggleTheme} />
        <div style={styles.body}>
          {children}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    backgroundImage: 'radial-gradient(circle at 50% 120%, rgba(79, 70, 229, 0.05) 0%, transparent 60%)',
    overflow: 'hidden'
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 20px 20px 0',
    height: '100vh',
    overflow: 'hidden'
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    paddingRight: '4px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  }
};
