import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import FileUpload from './FileUpload';
import FileList from './FileList';
import Settings from './Settings';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('myfiles');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowUploadModal(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div style={styles.dashboard}>
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onUploadClick={() => setShowUploadModal(true)}
        onSettingsClick={() => setShowSettings(true)}
      />

      {/* Main Content Area */}
      <div style={styles.mainContent}>
        {/* Header */}
        <Header onSearch={handleSearch} />

        {/* Content */}
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

      {/* Upload Modal */}
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

      {/* Settings Modal */}
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
    overflow: 'hidden'
  },
  mainContent: {
    flex: 1,
    // marginLeft: '260px',
    display: 'flex',
    flexDirection: 'column'
  },
  content: {
    flex: 1,
    marginTop: '64px',
    padding: '24px 80px',
    overflowY: 'auto',
    background: '#fff'
  },
  emptyState: {
    textAlign: 'center',
    color: '#5f6368',
    marginTop: '100px'
  },
  viewTitle: {
    fontSize: '50px',
    fontWeight: '400',
    color: '#202124',
    marginBottom: '24px',
    marginTop: 0
  },
  comingSoon: {
    textAlign: 'center',
    color: '#5f6368',
    fontSize: '16px',
    marginTop: '40px'
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
    zIndex: 1000
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