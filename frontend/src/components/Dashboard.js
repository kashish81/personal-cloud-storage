import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import Sidebar from './Sidebar';
import Header from './Header';
import FileUpload from './FileUpload';
import FileList from './FileList';
import Settings from './Settings';
import { useMediaQuery } from './hooks/useMediaQuery';

const Dashboard = () => {
  const { theme, isDark } = useTheme();
  const [activeView, setActiveView] = useState('myfiles');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 1024px)');

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowUploadModal(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Dynamic styles based on theme
  const dynamicStyles = {
    dashboard: {
      display: 'flex',
      height: '100vh',
      background: theme.bg,
      overflow: 'hidden',
      position: 'relative',
      transition: 'background 0.3s ease'
    },
    mainContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      transition: 'margin-left 0.3s ease',
      background: theme.bg
    },
    content: {
      flex: 1,
      marginTop: '64px',
      padding: '24px 80px',
      overflowY: 'auto',
      background: theme.bg,
      color: theme.text,
      transition: 'all 0.3s ease'
    },
    viewTitle: {
      fontSize: '45px',
      fontWeight: '400',
      color: theme.text,
      marginBottom: '24px',
      marginTop: 0,
      transition: 'color 0.3s ease'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      marginTop: '40px'
    },
    emptyText: {
      fontSize: '18px',
      fontWeight: '500',
      color: theme.textSecondary,
      margin: '0 0 10px 0',
      transition: 'color 0.3s ease'
    },
    emptySubtext: {
      fontSize: '14px',
      color: theme.textSecondary,
      margin: 0,
      opacity: 0.8,
      transition: 'color 0.3s ease'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      backdropFilter: 'blur(4px)'
    },
    modalContent: {
      background: theme.bgSecondary,
      borderRadius: '8px',
      padding: '0',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'auto',
      transition: 'background 0.3s ease',
      border: `1px solid ${theme.border}`
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 24px',
      borderBottom: `1px solid ${theme.border}`,
      color: theme.text,
      transition: 'all 0.3s ease'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '32px',
      cursor: 'pointer',
      color: theme.textSecondary,
      lineHeight: 1,
      padding: 0,
      width: '32px',
      height: '32px',
      transition: 'color 0.3s ease',
      borderRadius: '4px'
    }
  };

  return (
    <div style={dynamicStyles.dashboard}>
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onUploadClick={() => setShowUploadModal(true)}
        onSettingsClick={() => setShowSettings(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div style={{
        ...dynamicStyles.mainContent,
        marginLeft: isMobile ? 0 : '280px'
      }}>
        <Header 
          onSearch={handleSearch}
          isMobile={isMobile}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />

        <div style={dynamicStyles.content}>
          {activeView === 'myfiles' && (
            <>
              <h2 style={dynamicStyles.viewTitle}>My Files</h2>
              <FileList 
                refreshTrigger={refreshTrigger} 
                searchQuery={searchQuery}
              />
            </>
          )}

          {activeView === 'recent' && (
            <>
              <h2 style={dynamicStyles.viewTitle}>Recent</h2>
              <FileList 
                refreshTrigger={refreshTrigger} 
                searchQuery={searchQuery}
                filter="recent"
              />
            </>
          )}

          {activeView === 'starred' && (
            <>
              <h2 style={dynamicStyles.viewTitle}>Starred</h2>
              <div style={dynamicStyles.emptyState}>
                <p style={dynamicStyles.emptyText}>No starred files yet</p>
                <p style={dynamicStyles.emptySubtext}>Star your important files to find them here quickly</p>
              </div>
            </>
          )}

          {activeView === 'bin' && (
            <>
              <h2 style={dynamicStyles.viewTitle}>Bin</h2>
              <div style={dynamicStyles.emptyState}>
                <p style={dynamicStyles.emptyText}>Bin is empty</p>
                <p style={dynamicStyles.emptySubtext}>Deleted files will appear here</p>
              </div>
            </>
          )}
        </div>
      </div>

      {showUploadModal && (
        <div style={dynamicStyles.modal}>
          <div style={dynamicStyles.modalContent}>
            <div style={dynamicStyles.modalHeader}>
              <h3 style={{ margin: 0, color: theme.text }}>Upload Files</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                style={dynamicStyles.closeButton}
                onMouseEnter={(e) => e.target.style.background = theme.hover}
                onMouseLeave={(e) => e.target.style.background = 'none'}
              >
                ×
              </button>
            </div>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        </div>
      )}

      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

export default Dashboard;