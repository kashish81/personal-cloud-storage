import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import FileUpload from './FileUpload';
import FileList from './FileList';
import Settings from './Settings';
import { useMediaQuery } from './hooks/useMediaQuery';

const Dashboard = () => {
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

  return (
    <div style={styles.dashboard}>
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onUploadClick={() => setShowUploadModal(true)}
        onSettingsClick={() => setShowSettings(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div style={{
        ...styles.mainContent,
        marginLeft: isMobile ? 0 : '280px'
      }}>
        <Header 
          onSearch={handleSearch}
          isMobile={isMobile}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />

        <div style={styles.content}>
          {activeView === 'myfiles' && (
            <>
              <h2 style={styles.viewTitle}>My Files</h2>
              <FileList 
                refreshTrigger={refreshTrigger} 
                searchQuery={searchQuery}
              />
            </>
          )}

          {activeView === 'recent' && (
            <>
              <h2 style={styles.viewTitle}>Recent</h2>
              <FileList 
                refreshTrigger={refreshTrigger} 
                searchQuery={searchQuery}
                filter="recent"
              />
            </>
          )}

          {activeView === 'starred' && (
            <>
              <h2 style={styles.viewTitle}>Starred</h2>
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>No starred files yet</p>
                <p style={styles.emptySubtext}>Star your important files to find them here quickly</p>
              </div>
            </>
          )}

          {activeView === 'bin' && (
            <>
              <h2 style={styles.viewTitle}>Bin</h2>
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>Bin is empty</p>
                <p style={styles.emptySubtext}>Deleted files will appear here</p>
              </div>
            </>
          )}
        </div>
      </div>

      {showUploadModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>Upload Files</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                style={styles.closeButton}
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

const styles = {
  dashboard: {
    display: 'flex',
    height: '100vh',
    background: '#fff',
    overflow: 'hidden',
    position: 'relative'
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    transition: 'margin-left 0.3s ease'
  },
  content: {
    flex: 1,
    marginTop: '64px',
    padding: '24px 80px',
    overflowY: 'auto',
    background: '#fff'
  },
  viewTitle: {
    fontSize: '45px',
    fontWeight: '400',
    color: '#202124',
    marginBottom: '24px',
    marginTop: 0
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    marginTop: '40px'
  },
  emptyText: {
    fontSize: '18px',
    fontWeight: '500',
    color: '#666',
    margin: '0 0 10px 0'
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#999',
    margin: 0
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
    padding: '20px'
  },
  modalContent: {
    background: 'white',
    borderRadius: '8px',
    padding: '0',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e0e0e0'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '32px',
    cursor: 'pointer',
    color: '#5f6368',
    lineHeight: 1,
    padding: 0,
    width: '32px',
    height: '32px'
  }
};

export default Dashboard;