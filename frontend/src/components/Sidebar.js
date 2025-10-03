import React from 'react';
import { Plus, Home, Share2, Clock, Star, Trash2, HardDrive, Settings as SettingsIcon } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeView, onViewChange, onUploadClick, onSettingsClick, uploadingFiles = [] }) => {
  const { user } = useAuth();

  const formatStorage = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const storagePercentage = user.storageUsed && user.storageLimit 
    ? Math.min((user.storageUsed / user.storageLimit) * 100, 100)
    : 0;

  const mainItems = [
    { id: 'mydrive', icon: Home, label: 'My Drive', color: '#4FC3F7' },
    { id: 'shared', icon: Share2, label: 'Shared Files', color: '#4CAF50' }
  ];

  const otherItems = [
    { id: 'recent', icon: Clock, label: 'Recent Files', color: '#7C4DFF' },
    { id: 'starred', icon: Star, label: 'Starred Files', color: '#FF9800' }
  ];

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoSection}>
        <Logo size="small" />
      </div>

      {/* New Button */}
      <button onClick={onUploadClick} style={styles.newButton}>
        <Plus size={20} strokeWidth={2.5} />
        <span>New</span>
      </button>

      {/* Main Navigation */}
      <nav style={styles.nav}>
        {mainItems.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            style={{
              ...styles.navItem,
              ...(activeView === item.id ? { ...styles.navItemActive, background: item.color + '20', color: item.color } : {})
            }}
          >
            <div style={{ ...styles.iconBox, background: item.color + '20' }}>
              <item.icon size={18} color={item.color} />
            </div>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Divider */}
      <div style={styles.divider}></div>

      {/* Other Items */}
      <nav style={styles.nav}>
        {otherItems.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            style={{
              ...styles.navItem,
              ...(activeView === item.id ? { ...styles.navItemActive, background: item.color + '20', color: item.color } : {})
            }}
          >
            <div style={{ ...styles.iconBox, background: item.color + '20' }}>
              <item.icon size={18} color={item.color} />
            </div>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Divider */}
      <div style={styles.divider}></div>

      {/* Trash */}
      <button
        onClick={() => onViewChange('trash')}
        style={{
          ...styles.navItem,
          ...(activeView === 'trash' ? { ...styles.navItemActive, background: '#F4433620', color: '#F44336' } : {})
        }}
      >
        <div style={{ ...styles.iconBox, background: '#F4433620' }}>
          <Trash2 size={18} color="#F44336" />
        </div>
        <span>Trash Folder</span>
      </button>

      {/* Storage Section */}
      <div style={styles.storageSection}>
        <div style={styles.storageHeader}>
          <HardDrive size={20} />
          <span>Storage</span>
        </div>
        
        <div style={styles.storageBar}>
          <div style={{
            ...styles.storageProgress,
            width: `${storagePercentage}%`
          }} />
        </div>
        
        <p style={styles.storageText}>
          {formatStorage(user.storageUsed || 0)} of {formatStorage(user.storageLimit || 107374182400)}
        </p>
      </div>

      {/* Uploading Files Section */}
      {uploadingFiles.length > 0 && (
        <div style={styles.uploadingSection}>
          <div style={styles.uploadingHeader}>
            <span>Uploading {uploadingFiles.length} items</span>
            <button style={styles.expandBtn}>▼</button>
          </div>
          {uploadingFiles.map((file, index) => (
            <div key={index} style={styles.uploadingFile}>
              <div style={styles.fileIcon}>📄</div>
              <div style={styles.fileInfo}>
                <span style={styles.fileName}>{file.name}</span>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progress, width: `${file.progress}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings */}
      <button onClick={onSettingsClick} style={styles.settingsButton}>
        <SettingsIcon size={18} />
      </button>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '260px',
    height: '100vh',
    background: '#fff',
    borderRight: '1px solid #e8e8e8',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 16px',
    position: 'fixed',
    left: 0,
    top: 0,
    overflowY: 'auto',
    overflowX: 'hidden'
  },
  logoSection: {
    marginBottom: '20px',
    paddingLeft: '4px'
  },
  newButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '12px 20px',
    background: '#00D9C0',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '24px',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0, 217, 192, 0.3)'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '12px'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 12px',
    background: 'none',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6B7280',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease'
  },
  navItemActive: {
    fontWeight: '600'
  },
  iconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  divider: {
    height: '1px',
    background: '#f0f0f0',
    margin: '12px 0'
  },
  storageSection: {
    padding: '16px 12px',
    background: '#F9FAFB',
    borderRadius: '12px',
    marginTop: 'auto',
    marginBottom: '16px'
  },
  storageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151'
  },
  storageBar: {
    width: '100%',
    height: '6px',
    background: '#E5E7EB',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '8px'
  },
  storageProgress: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    transition: 'width 0.3s ease'
  },
  storageText: {
    fontSize: '11px',
    color: '#6B7280',
    margin: 0
  },
  uploadingSection: {
    background: '#1F2937',
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '16px',
    maxHeight: '300px',
    overflowY: 'auto'
  },
  uploadingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '12px'
  },
  expandBtn: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px'
  },
  uploadingFile: {
    display: 'flex',
    gap: '10px',
    padding: '8px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '8px',
    marginBottom: '8px'
  },
  fileIcon: {
    fontSize: '24px'
  },
  fileInfo: {
    flex: 1,
    minWidth: 0
  },
  fileName: {
    display: 'block',
    color: 'white',
    fontSize: '12px',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  progressBar: {
    height: '4px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  progress: {
    height: '100%',
    background: '#00D9C0',
    transition: 'width 0.3s ease'
  },
  settingsButton: {
    padding: '10px',
    background: 'none',
    border: 'none',
    borderRadius: '8px',
    color: '#6B7280',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    transition: 'background 0.2s ease',
    paddingbottom: '30px'
  }
};

export default Sidebar;