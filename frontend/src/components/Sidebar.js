import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Plus, Files, Clock, Star, Trash2, HardDrive, Settings as SettingsIcon, ChevronDown, ChevronUp, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMediaQuery } from './hooks/useMediaQuery';

const Sidebar = ({ activeView, onViewChange, onUploadClick, onSettingsClick, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { theme, isDark } = useTheme(); 
  const [storageExpanded, setStorageExpanded] = useState(false);
  const [fileStats, setFileStats] = useState(null);
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const { user, token } = useAuth();

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
    }
  };

  const storageLimit = fileStats?.storageLimit || 5368709120;
  const storageUsed = fileStats?.totalSize || 0;
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
    return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  };

  const fileTypeColors = {
    imagesSize: { color: '#FF6B6B', label: 'Images' },
    docsSize: { color: '#4ECDC4', label: 'Documents' },
    videosSize: { color: '#95E1D3', label: 'Videos' },
    audioSize: { color: '#FFE66D', label: 'Audio' }
  };

  const menuItems = [
    { id: 'myfiles', icon: Files, label: 'My Files' },
    { id: 'recent', icon: Clock, label: 'Recent' },
    { id: 'starred', icon: Star, label: 'Starred' },
    { id: 'bin', icon: Trash2, label: 'Bin' }
  ];

  const handleMenuClick = (itemId) => {
    onViewChange(itemId);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  // Dynamic styles based on theme
  const dynamicStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: 998
    },
    mobileCloseButton: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '8px',
      color: theme.text,
      zIndex: 1001
    },
    sidebar: {
      width: '280px',
      height: '100vh',
      background: theme.bgSecondary,
      borderRight: `1px solid ${theme.border}`,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 12px',
      position: 'fixed',
      left: 0,
      top: 0,
      overflowY: 'auto',
      transition: 'all 0.3s ease',
      zIndex: 999
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
      color: theme.text,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    newButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '12px 24px',
      background: theme.bgSecondary,
      border: `1px solid ${theme.border}`,
      borderRadius: '50px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      marginBottom: '20px',
      transition: 'all 0.2s ease',
      color: theme.text,
      boxShadow: `0 1px 2px 0 rgba(0,0,0,${isDark ? 0.3 : 0.1})`
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
      background: theme.bgSecondary,
      border: `1px solid ${theme.border}`,
      borderRadius: '12px',
      padding: '25px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '15px',
      fontWeight: '500',
      color: theme.textSecondary,
      cursor: 'pointer',
      justifyContent: 'center',
      transition: 'all 0.2s'
    },
    menuItemActive: {
      background: isDark ? '#1e293b' : '#e8f0fe',
      color: theme.primary,
      border: `1px solid ${theme.primary}`
    },
    storageSection: {
      padding: '16px',
      marginTop: '20px',
      marginBottom: '12px',
      background: theme.bgSecondary,
      borderRadius: '12px',
      border: `1px solid ${theme.border}`,
      transition: 'all 0.3s ease'
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
      color: theme.textSecondary,
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
      background: theme.hover,
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
      color: theme.textSecondary,
      margin: '0 0 4px 0',
      fontWeight: '500'
    },
    storagePercentage: {
      fontSize: '11px',
      color: theme.textSecondary,
      margin: 0
    },
    storageDetails: {
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: `1px solid ${theme.border}`,
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
      color: theme.textSecondary,
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
      color: theme.text
    },
    storagePercent: {
      fontSize: '11px',
      color: theme.textSecondary
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
      color: theme.textSecondary,
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'all 0.2s ease',
      marginTop: '8px',
      marginBottom: '20px'
    }
  };

  return (
    <>
      {isMobile && isMobileMenuOpen && (
        <div style={dynamicStyles.overlay} onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <div style={{
        ...dynamicStyles.sidebar,
        transform: isMobile && !isMobileMenuOpen ? 'translateX(-100%)' : 'translateX(0)'
      }}>
        {isMobile && (
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            style={dynamicStyles.mobileCloseButton}
          >
            <X size={24} />
          </button>
        )}

        <div style={dynamicStyles.logoSection}>
          <div style={dynamicStyles.logo}>
            <HardDrive size={32} color="#667eea" />
            <span style={dynamicStyles.logoText}>AI Cloud Storage</span>
          </div>
        </div>

        <button onClick={() => {
          onUploadClick();
          if (isMobile) setIsMobileMenuOpen(false);
        }} style={dynamicStyles.newButton}>
          <Plus size={24} />
          <span>New</span>
        </button>

        <nav style={dynamicStyles.menuGrid}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              style={{
                ...dynamicStyles.menuItem,
                ...(activeView === item.id ? dynamicStyles.menuItemActive : {})
              }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={dynamicStyles.storageSection}>
          <button 
            onClick={() => setStorageExpanded(!storageExpanded)}
            style={dynamicStyles.storageHeader}
          >
            <div style={dynamicStyles.storageHeaderLeft}>
              <HardDrive size={20} />
              <span>Storage</span>
            </div>
            {storageExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          <div style={dynamicStyles.storageBar}>
            {fileStats && Object.entries(fileStats)
              .filter(([key]) => key.endsWith('Size') && key !== 'totalSize')
              .map(([type, size]) => {
                const percentage = (size / storageLimit) * 100;
                const colorData = fileTypeColors[type];
                if (!colorData || percentage === 0) return null;
                return (
                  <div
                    key={type}
                    style={{
                      ...dynamicStyles.storageSegment,
                      width: `${percentage}%`,
                      background: colorData.color
                    }}
                    title={`${colorData.label}: ${formatStorage(size)}`}
                  />
                );
              })}
          </div>
          
          <p style={dynamicStyles.storageText}>
            {formatStorage(storageUsed)} of {formatStorage(storageLimit)}
          </p>
          <p style={dynamicStyles.storagePercentage}>
            {storagePercentage.toFixed(1)}% used
          </p>

          {storageExpanded && fileStats && (
            <div style={dynamicStyles.storageDetails}>
              {Object.entries(fileStats)
                .filter(([key]) => key.endsWith('Size') && key !== 'totalSize')
                .map(([type, size]) => {
                  const colorData = fileTypeColors[type];
                  if (!colorData || size === 0) return null;
                  return (
                    <div key={type} style={dynamicStyles.storageDetailItem}>
                      <div style={dynamicStyles.storageDetailLabel}>
                        <div 
                          style={{
                            ...dynamicStyles.colorDot,
                            background: colorData.color
                          }}
                        />
                        <span>{colorData.label}</span>
                      </div>
                      <div style={dynamicStyles.storageDetailValue}>
                        <span style={dynamicStyles.storageSize}>{formatStorage(size)}</span>
                        <span style={dynamicStyles.storagePercent}>
                          {getPercentage(size, storageUsed)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        <button onClick={() => {
          onSettingsClick();
          if (isMobile) setIsMobileMenuOpen(false);
        }} style={dynamicStyles.settingsButton}>
          <SettingsIcon size={20} />
          <span>Settings</span>
        </button>
      </div>
    </>
  );
};

export default Sidebar;