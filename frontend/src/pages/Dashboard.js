import React, { useState, useEffect } from 'react';
import { Search, Bell, Plus, Home, Share2, Clock, Star, Trash2, HardDrive, Settings as SettingsIcon, Download, Trash, MoreVertical } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FileUpload from './FileUpload';
import Settings from './Settings';
import Logo from './Logo';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('mydrive');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user, token, logout } = useAuth();

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger]);

  const fetchFiles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/files', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setFiles(data.files);
      }
    } catch (error) {
      console.error('Fetch files error:', error);
    }
  };

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowUploadModal(false);
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Delete this file?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        fetchFiles();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleDownload = async (fileId, originalName) => {
    try {
      const response = await fetch(`http://localhost:5000/api/files/download/${fileId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = originalName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const formatStorage = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString();
  };

  const storagePercentage = user.storageUsed && user.storageLimit 
    ? Math.min((user.storageUsed / user.storageLimit) * 100, 100)
    : 0;

  const filteredFiles = searchQuery
    ? files.filter(f => f.originalName.toLowerCase().includes(searchQuery.toLowerCase()))
    : files;

  const recentFiles = [...files].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logoSection}>
          <Logo size="small" />
        </div>

        <button onClick={() => setShowUploadModal(true)} style={styles.newButton}>
          <Plus size={20} />
          New
        </button>

        <div style={styles.sidebarSection}>
          <button
            onClick={() => setActiveView('mydrive')}
            style={{...styles.sidebarItem, ...(activeView === 'mydrive' ? styles.activeItem : {})}}
          >
            <div style={{...styles.iconBox, background: '#E3F2FD'}}>
              <Home size={18} color="#2196F3" />
            </div>
            My Drive
          </button>

          <button
            onClick={() => setActiveView('shared')}
            style={{...styles.sidebarItem, ...(activeView === 'shared' ? styles.activeItem : {})}}
          >
            <div style={{...styles.iconBox, background: '#E8F5E9'}}>
              <Share2 size={18} color="#4CAF50" />
            </div>
            Shared Files
          </button>
        </div>

        <div style={styles.divider}></div>

        <div style={styles.sidebarSection}>
          <button
            onClick={() => setActiveView('recent')}
            style={{...styles.sidebarItem, ...(activeView === 'recent' ? styles.activeItem : {})}}
          >
            <div style={{...styles.iconBox, background: '#F3E5F5'}}>
              <Clock size={18} color="#9C27B0" />
            </div>
            Recent Files
          </button>

          <button
            onClick={() => setActiveView('starred')}
            style={{...styles.sidebarItem, ...(activeView === 'starred' ? styles.activeItem : {})}}
          >
            <div style={{...styles.iconBox, background: '#FFF3E0'}}>
              <Star size={18} color="#FF9800" />
            </div>
            Starred Files
          </button>
        </div>

        <div style={styles.divider}></div>

        <button
          onClick={() => setActiveView('trash')}
          style={{...styles.sidebarItem, ...(activeView === 'trash' ? styles.activeItem : {})}}
        >
          <div style={{...styles.iconBox, background: '#FFEBEE'}}>
            <Trash2 size={18} color="#F44336" />
          </div>
          Trash Folder
        </button>

        <div style={styles.storageBox}>
          <div style={styles.storageHeader}>
            <HardDrive size={18} />
            Storage
          </div>
          <div style={styles.storageBar}>
            <div style={{...styles.storageProgress, width: `${storagePercentage}%`}} />
          </div>
          <div style={styles.storageText}>
            {formatStorage(user.storageUsed || 0)} of {formatStorage(user.storageLimit || 5368709120)}
          </div>
        </div>

        <button onClick={() => setShowSettings(true)} style={styles.settingsBtn}>
          <SettingsIcon size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.searchBox}>
            <Search size={20} color="#9CA3AF" />
            <input
              type="text"
              placeholder="Search in files"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.headerRight}>
            <button style={styles.iconBtn}>
              <Bell size={22} />
            </button>
            <div style={styles.userMenu}>
              <div style={styles.avatar}>
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span style={styles.username}>{user.username}</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={styles.content}>
          {activeView === 'mydrive' && (
            <>
              {/* Hero Banner */}
              <div style={styles.banner}>
                <div>
                  <h1 style={styles.bannerTitle}>Cloud Storage Solution</h1>
                  <p style={styles.bannerText}>
                    Object storage for companies of all sizes. Secure, durable, and with<br />
                    low latency. Store any amount of data.
                  </p>
                  <button style={styles.upgradeBtn}>Upgrade Storage</button>
                </div>
                <div style={styles.rocket}>🚀</div>
              </div>

              {/* Folders Section */}
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionTitle}>Folders</h2>
                  <button style={styles.seeAllBtn}>See all →</button>
                </div>
                
                <div style={styles.foldersGrid}>
                  <div style={styles.folderCard}>
                    <div style={styles.folderIcon}>🖼️</div>
                    <div style={styles.folderInfo}>
                      <h3 style={styles.folderName}>My Images</h3>
                      <p style={styles.folderMeta}>{files.filter(f => f.mimeType.startsWith('image')).length} files</p>
                    </div>
                  </div>

                  <div style={styles.folderCard}>
                    <div style={styles.folderIcon}>📄</div>
                    <div style={styles.folderInfo}>
                      <h3 style={styles.folderName}>Documents</h3>
                      <p style={styles.folderMeta}>{files.filter(f => f.mimeType.includes('pdf') || f.mimeType.includes('document')).length} files</p>
                    </div>
                  </div>

                  <div style={styles.folderCard}>
                    <div style={styles.folderIcon}>🎥</div>
                    <div style={styles.folderInfo}>
                      <h3 style={styles.folderName}>Videos</h3>
                      <p style={styles.folderMeta}>{files.filter(f => f.mimeType.startsWith('video')).length} files</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Files */}
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionTitle}>Recent Files</h2>
                  <button style={styles.seeAllBtn}>See all →</button>
                </div>

                {recentFiles.length > 0 ? (
                  <div style={styles.filesList}>
                    {recentFiles.map(file => (
                      <div key={file.id} style={styles.fileRow}>
                        <div style={styles.fileIcon}>📄</div>
                        <div style={styles.fileDetails}>
                          <span style={styles.fileName}>{file.originalName}</span>
                          <span style={styles.fileType}>{file.mimeType.split('/')[1]?.toUpperCase()}</span>
                        </div>
                        <span style={styles.fileSize}>{formatStorage(file.size)}</span>
                        <span style={styles.fileDate}>{formatDate(file.createdAt)}</span>
                        <div style={styles.fileActions}>
                          <button onClick={() => handleDownload(file.id, file.originalName)} style={styles.actionBtn}>
                            <Download size={18} />
                          </button>
                          <button onClick={() => handleDelete(file.id)} style={styles.actionBtn}>
                            <Trash size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📁</div>
                    <p>No files uploaded yet</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeView === 'recent' && (
            <>
              <h2 style={styles.pageTitle}>Recent Files</h2>
              {filteredFiles.length > 0 ? (
                <div style={styles.filesList}>
                  {filteredFiles.map(file => (
                    <div key={file.id} style={styles.fileRow}>
                      <div style={styles.fileIcon}>📄</div>
                      <div style={styles.fileDetails}>
                        <span style={styles.fileName}>{file.originalName}</span>
                        <span style={styles.fileType}>{file.mimeType.split('/')[1]?.toUpperCase()}</span>
                      </div>
                      <span style={styles.fileSize}>{formatStorage(file.size)}</span>
                      <span style={styles.fileDate}>{formatDate(file.createdAt)}</span>
                      <div style={styles.fileActions}>
                        <button onClick={() => handleDownload(file.id, file.originalName)} style={styles.actionBtn}>
                          <Download size={18} />
                        </button>
                        <button onClick={() => handleDelete(file.id)} style={styles.actionBtn}>
                          <Trash size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>📁</div>
                  <p>No files found</p>
                </div>
              )}
            </>
          )}

          {(activeView === 'shared' || activeView === 'starred' || activeView === 'trash') && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🚧</div>
              <p>Coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={styles.modal} onClick={() => setShowUploadModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Upload Files</h3>
              <button onClick={() => setShowUploadModal(false)} style={styles.closeBtn}>×</button>
            </div>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        </div>
      )}

      {/* Settings */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    background: '#FAFBFC',
    overflow: 'hidden'
  },
  sidebar: {
    width: '240px',
    background: 'white',
    borderRight: '1px solid #E5E7EB',
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto'
  },
  logoSection: {
    marginBottom: '20px'
  },
  newButton: {
    width: '100%',
    padding: '12px',
    background: '#00D9C0',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '20px'
  },
  sidebarSection: {
    marginBottom: '8px'
  },
  sidebarItem: {
    width: '100%',
    padding: '10px 12px',
    background: 'none',
    border: 'none',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6B7280',
    cursor: 'pointer',
    textAlign: 'left',
    marginBottom: '4px'
  },
  activeItem: {
    background: '#F3F4F6',
    color: '#111827'
  },
  iconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  divider: {
    height: '1px',
    background: '#E5E7EB',
    margin: '12px 0'
  },
  storageBox: {
    padding: '16px',
    background: '#F9FAFB',
    borderRadius: '10px',
    marginTop: 'auto',
    marginBottom: '12px'
  },
  storageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '10px'
  },
  storageBar: {
    height: '6px',
    background: '#E5E7EB',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '8px'
  },
  storageProgress: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
  },
  storageText: {
    fontSize: '11px',
    color: '#6B7280'
  },
  settingsBtn: {
    padding: '10px',
    background: 'none',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6B7280'
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    height: '70px',
    background: 'white',
    borderBottom: '1px solid #E5E7EB',
    padding: '0 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  searchBox: {
    flex: 1,
    maxWidth: '600px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    background: '#F3F4F6',
    borderRadius: '10px'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    background: 'none',
    fontSize: '14px',
    outline: 'none'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  iconBtn: {
    padding: '8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '8px'
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer'
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600'
  },
  username: {
    fontSize: '14px',
    fontWeight: '500'
  },
  content: {
    flex: 1,
    padding: '32px',
    overflowY: 'auto'
  },
  banner: {
    background: 'linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 100%)',
    borderRadius: '16px',
    padding: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px'
  },
  bannerTitle: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 8px 0'
  },
  bannerText: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '0 0 20px 0'
  },
  upgradeBtn: {
    padding: '12px 24px',
    background: '#1F2937',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  rocket: {
    fontSize: '100px'
  },
  section: {
    marginBottom: '32px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    margin: 0
  },
  seeAllBtn: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  foldersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px'
  },
  folderCard: {
    padding: '20px',
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  folderIcon: {
    fontSize: '40px'
  },
  folderInfo: {
    flex: 1
  },
  folderName: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 4px 0'
  },
  folderMeta: {
    fontSize: '13px',
    color: '#6B7280',
    margin: 0
  },
  filesList: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    overflow: 'hidden'
  },
  fileRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #F3F4F6',
    gap: '16px'
  },
  fileIcon: {
    fontSize: '24px'
  },
  fileDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  fileName: {
    fontSize: '14px',
    fontWeight: '500'
  },
  fileType: {
    fontSize: '12px',
    color: '#6B7280'
  },
  fileSize: {
    fontSize: '13px',
    color: '#6B7280',
    width: '80px'
  },
  fileDate: {
    fontSize: '13px',
    color: '#6B7280',
    width: '120px'
  },
  fileActions: {
    display: 'flex',
    gap: '8px'
  },
  actionBtn: {
    padding: '8px',
    background: 'none',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#6B7280'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#9CA3AF'
  },
  emptyIcon: {
    fontSize: '60px',
    marginBottom: '16px'
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '24px'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    background: 'white',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  modalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #E5E7EB',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#6B7280'
  }
};

export default Dashboard;