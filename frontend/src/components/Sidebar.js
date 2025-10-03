import React from 'react';
import { Plus, Files, Clock, Star, Trash2, HardDrive, Settings as SettingsIcon } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeView, onViewChange, onUploadClick, onSettingsClick }) => {
  const { user } = useAuth();

  const formatStorage = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const storagePercentage = user.storageUsed && user.storageLimit 
    ? (user.storageUsed / user.storageLimit) * 100 
    : 0;

  const menuItems = [
    { id: 'myfiles', icon: Files, label: 'My Files' },
    { id: 'recent', icon: Clock, label: 'Recent' },
    { id: 'starred', icon: Star, label: 'Starred' },
    { id: 'bin', icon: Trash2, label: 'Bin' }
  ];

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoSection}>
        <Logo size="medium" />
      </div>

      {/* New Button */}
      <button onClick={onUploadClick} style={styles.newButton}>
        <Plus size={24} />
        <span>New</span>
      </button>

      {/* Menu Items */}
      <nav style={styles.nav}>
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            style={{
              ...styles.navItem,
              ...(activeView === item.id ? styles.navItemActive : {})
            }}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Storage Section */}
      <div style={styles.storageSection}>
        <div style={styles.storageHeader}>
          <HardDrive size={20} />
          <span>Storage</span>
        </div>
        
        <div style={styles.storageBar}>
          <div style={{
            ...styles.storageProgress,
            width: `${Math.min(storagePercentage, 100)}%`
          }} />
        </div>
        
        <p style={styles.storageText}>
          {formatStorage(user.storageUsed || 0)} of {formatStorage(user.storageLimit || 5368709120)} used
        </p>
      </div>

      {/* Settings Button */}
      <button onClick={onSettingsClick} style={styles.settingsButton}>
        <SettingsIcon size={20} />
        <span>Settings</span>
      </button>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '260px',
    height: '100vh',
    background: '#f8f9fa',
    borderRight: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 12px',
    position: 'fixed',
    left: 0,
    top: 0,
    overflowY: 'auto'
  },
  logoSection: {
    marginBottom: '24px',
    paddingLeft: '8px'
  },
  newButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 24px',
    background: 'white',
    border: '1px solid #dadce0',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '20px',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: 'auto'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '10px 20px',
    background: 'none',
    border: 'none',
    borderRadius: '25px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#5f6368',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.2s ease'
  },
  navItemActive: {
    background: '#e8f0fe',
    color: '#1967d2'
  },
  storageSection: {
    padding: '16px',
    marginTop: '20px',
    marginBottom: '12px'
  },
  storageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#5f6368'
  },
  storageBar: {
    width: '100%',
    height: '4px',
    background: '#e0e0e0',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '8px'
  },
  storageProgress: {
    height: '100%',
    background: '#1a73e8',
    transition: 'width 0.3s ease'
  },
  storageText: {
    fontSize: '12px',
    color: '#5f6368',
    margin: 0
  },
  settingsButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '10px 20px',
    background: 'none',
    border: 'none',
    borderRadius: '25px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#5f6368',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.2s ease',
    marginTop: '8px'
  }
};

export default Sidebar;