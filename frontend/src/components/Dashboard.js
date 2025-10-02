import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FileUpload from './FileUpload';
import FileList from './FileList';
import './Auth.css';
import Logo from './Logo';
import { Settings as SettingsIcon } from 'lucide-react';
import Settings from './Settings';


const Dashboard = () => {
  const [showSettings, setShowSettings] = useState(false);
  const { user, logout } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const formatStorage = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const storagePercentage = user.storageUsed && user.storageLimit 
    ? (user.storageUsed / user.storageLimit) * 100 
    : 0;

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div style={styles.dashboard}>
    {/* Logo Section */}
    <div style={styles.logoSection}>
      <Logo size="large" />
    </div>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={styles.username}>{user.username}</h3>
            <p style={styles.email}>{user.email}</p>
          </div>
        </div>

        <div style={styles.storageInfo}>
          <span style={styles.storageText}>
            {formatStorage(user.storageUsed || 0)} / {formatStorage(user.storageLimit || 5368709120)}
          </span>
          <div style={styles.storageBar}>
            <div style={{
              ...styles.storageProgress,
              width: `${storagePercentage}%`
            }} />
          </div>
        </div>

        <button onClick={logout} style={styles.logoutBtn}>
          Logout
        </button>
        <button
  onClick={() => setShowSettings(true)}
  style={styles.settingsBtn}
>
  <SettingsIcon size={18} />
  Settings
</button>
{showSettings && (
  <Settings onClose={() => setShowSettings(false)} />
)}
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* <h1 style={styles.welcomeTitle}>Welcome, {user.username}! 🎉</h1> */}
        
        {/* File Upload Section */}
        <div style={styles.uploadSection}>
          <h2 style={styles.sectionTitle}>Upload Files</h2>
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* File List Section */}
        <div style={styles.filesSection}>
          <h2 style={styles.sectionTitle}>Your Files</h2>
          <FileList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};

const styles = {
  dashboard: {
    minHeight: '100vh',
    background: '#f5f7fa',
    padding: '20px'
  },
  logoSection: {
  background: 'white',
  padding: '20px',
  borderRadius: '12px 12px 0 0',
  // boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  // marginBottom: '20px',
  display: 'flex',
  justifyContent: 'left'
 },
  header: {
    background: 'white',
    padding: '20px',
    borderRadius: '0 0 12px 12px',
    // boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '20px',
    fontWeight: '600'
  },
  username: {
    margin: 0,
    color: '#333',
    fontSize: '18px',
    fontWeight: '600'
  },
  email: {
    margin: '5px 0 0 0',
    color: '#666',
    fontSize: '14px'
  },
  storageInfo: {
    textAlign: 'right',
    flex: '1',
    minWidth: '200px'
  },
  storageText: {
    color: '#666',
    fontSize: '14px',
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500'
  },
  storageBar: {
    width: '200px',
    height: '8px',
    background: '#f0f0f0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginLeft: 'auto'
  },
  storageProgress: {
    height: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    transition: 'width 0.3s ease'
  },
  logoutBtn: {
    padding: '10px 20px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  welcomeTitle: {
    color: '#333',
    fontSize: '28px',
    fontWeight: '600',
    marginBottom: '30px',
    textAlign: 'center'
  },
  uploadSection: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    marginBottom: '30px'
  },
  filesSection: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
  },
  sectionTitle: {
    color: '#333',
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '20px',
    marginTop: 0
  },
  settingsBtn: {
  padding: '10px 20px',
  background: '#667eea',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}
};

export default Dashboard;