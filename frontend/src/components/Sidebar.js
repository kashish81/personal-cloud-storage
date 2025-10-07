import React, { useState, useEffect } from 'react';
import { Plus, Files, Clock, Star, Trash2, HardDrive, Settings as SettingsIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeView, onViewChange, onUploadClick, onSettingsClick }) => {
  const { user, token } = useAuth();
  const [storageExpanded, setStorageExpanded] = useState(false);
  const [fileStats, setFileStats] = useState(null);
  

  useEffect(() => {
    if (token) {
      fetchFileStats();
    }
  }, [token]);

const fetchFileStats = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/files/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      setFileStats(data.stats);
    }
  } catch (error) {
    console.error('Fetch stats error:', error);
    // Fallback to empty stats
    setFileStats({
      images: 0,
      documents: 0,
      videos: 0,
      audio: 0,
      others: 0
    });
  }
};

const storageUsed = user?.storageUsed || 0;
  const storageLimit = user?.storageLimit || 5368709120; // 5GB default
  const storagePercentage = storageLimit > 0 
    ? Math.min((storageUsed / storageLimit) * 100, 100)
    : 0;

  const formatStorage = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPercentage = (value, total) => {
    return ((value / total) * 100).toFixed(1);
  };
  

  const fileTypeColors = {
    images: { color: '#FF6B6B', label: 'Images' },
    documents: { color: '#4ECDC4', label: 'Documents' },
    videos: { color: '#95E1D3', label: 'Videos' },
    audio: { color: '#FFE66D', label: 'Audio' },
    others: { color: '#A8DADC', label: 'Others' }
  };

  // const storagePercentage = user?.storageUsed && user?.storageLimit 
  // ? Math.min((user.storageUsed / user.storageLimit) * 100, 100)
  // : 0;

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
        <div style={styles.logo}>
          <img 
            src={require('../assets/logo.png')} 
            alt="Logo" 
            style={{ width: '32px', height: '32px' }} 
          />
          <span style={styles.logoText}>AI Cloud Storage</span>
        </div>
      </div>

      {/* New Button */}
      <button onClick={onUploadClick} style={styles.newButton}>
        <Plus size={24} />
        <span>New</span>
      </button>

      {/* Menu Items */}
      <nav style={styles.menuGrid}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            style={{
              ...styles.menuItem,
              ...(activeView === item.id ? styles.menuItemActive : {})
            }}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Enhanced Storage Section */}
      <div style={styles.storageSection}>
        <button 
          onClick={() => setStorageExpanded(!storageExpanded)}
          style={styles.storageHeader}
        >
          <div style={styles.storageHeaderLeft}>
            <HardDrive size={20} />
            <span>Storage</span>
          </div>
          {storageExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        
        {/* Multi-colored Progress Bar */}
        <div style={styles.storageBar}>
          {fileStats && Object.entries(fileStats).map(([type, size]) => {
            const percentage = (size / user.storageLimit) * 100;
            return (
              <div
                key={type}
                style={{
                  ...styles.storageSegment,
                  width: `${percentage}%`,
                  background: fileTypeColors[type].color
                }}
                title={`${fileTypeColors[type].label}: ${formatStorage(size)}`}
              />
            );
          })}
        </div>
        
        <p style={styles.storageText}>
    {formatStorage(storageUsed)} of {formatStorage(storageLimit)}
  </p>
  <p style={styles.storagePercentage}>
    {storagePercentage.toFixed(1)}% used
  </p>

        {/* Expanded Details */}
        {storageExpanded && fileStats && (
          <div style={styles.storageDetails}>
            {Object.entries(fileStats).map(([type, size]) => (
              <div key={type} style={styles.storageDetailItem}>
                <div style={styles.storageDetailLabel}>
                  <div 
                    style={{
                      ...styles.colorDot,
                      background: fileTypeColors[type].color
                    }}
                  />
                  <span>{fileTypeColors[type].label}</span>
                </div>
                <div style={styles.storageDetailValue}>
                  <span style={styles.storageSize}>{formatStorage(size)}</span>
                  <span style={styles.storagePercent}>
                    {getPercentage(size, user.storageUsed)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
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
    width: '300px',
    height: '100vh',
    background: '#f8f9fa',
    borderRight: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 12px',
    overflowY: 'auto'
  },
  logoSection: {
    marginBottom: '24px',
    paddingLeft: '8px'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoText: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#333',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
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
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '8px',
    marginBottom: 'auto',
    marginTop: '8px'
  },
  menuItem: {
    background: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '25px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '15px',
    fontWeight: '500',
    color: '#5f6368',
    cursor: 'pointer',
    justifyContent: 'center',
    transition: 'all 0.2s',
    boxShadow: '0 1px 2px 0 rgba(60,64,67,.08)'
  },
  menuItemActive: {
    background: '#e8f0fe',
    color: '#1967d2',
    border: '1px solid #1967d2'
  },
  storageSection: {
    padding: '16px',
    marginTop: '20px',
    marginBottom: '12px',
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e0e0e0'
  },
  storageHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    background: 'none',
    border: 'none',
    marginBottom: '12px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#5f6368',
    cursor: 'pointer',
    padding: 0
  },
  storageHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  storageBar: {
    width: '100%',
    height: '8px',
    background: '#e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px',
    display: 'flex'
  },
  storageSegment: {
    height: '100%',
    transition: 'width 0.3s ease'
  },
  storageText: {
    fontSize: '13px',
    color: '#5f6368',
    margin: '0 0 4px 0',
    fontWeight: '500'
  },
  storagePercentage: {
    fontSize: '11px',
    color: '#999',
    margin: 0
  },
  storageDetails: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #f0f0f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  storageDetailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  storageDetailLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: '#5f6368',
    fontWeight: '500'
  },
  colorDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%'
  },
  storageDetailValue: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px'
  },
  storageSize: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333'
  },
  storagePercent: {
    fontSize: '11px',
    color: '#999'
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
    marginTop: '8px',
    marginBottom: '20px'
  }
};

export default Sidebar;