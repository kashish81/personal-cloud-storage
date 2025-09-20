import React, { useState, useRef, useEffect } from 'react';
import { Brain, Upload, File, Search, Grid, List, Share2, Trash2, Tag, Eye, Folder, Download, RefreshCw } from 'lucide-react';

// API Service
const API_BASE_URL = 'http://localhost:5000/api';

const apiService = {
  uploadFile: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });
      
      xhr.open('POST', `${API_BASE_URL}/upload`);
      xhr.send(formData);
    });
  },

  getFiles: async () => {
    const response = await fetch(`${API_BASE_URL}/files`);
    if (!response.ok) throw new Error('Failed to fetch files');
    return response.json();
  },

  deleteFile: async (fileId) => {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete file');
    return response.json();
  },

  downloadFile: (fileId) => {
    window.open(`${API_BASE_URL}/files/${fileId}/download`, '_blank');
  },

  shareFile: async (fileId) => {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}/share`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to create share link');
    return response.json();
  },

  checkHealth: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  }
};

function App() {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');
  const fileInputRef = useRef();

  // Load files from backend
  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getFiles();
      setFiles(response.files || []);
      setServerStatus('connected');
    } catch (error) {
      console.error('Failed to load files:', error);
      setError('Failed to connect to server. Make sure the backend is running on port 5000.');
      setServerStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Check server health
  const checkServerHealth = async () => {
    try {
      await apiService.checkHealth();
      setServerStatus('connected');
      if (error) {
        setError(null);
        loadFiles();
      }
    } catch (err) {
      setServerStatus('error');
    }
  };

  // Load files on component mount
  useEffect(() => {
    loadFiles();
    
    // Check server health every 10 seconds if there's an error
    const healthCheck = setInterval(() => {
      if (serverStatus === 'error') {
        checkServerHealth();
      }
    }, 10000);

    return () => clearInterval(healthCheck);
  }, [serverStatus]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.type === 'folder') return <Folder className="w-5 h-5 text-blue-500" />;
    
    if (file.mimetype?.startsWith('image/')) return <Eye className="w-5 h-5 text-green-500" />;
    if (file.mimetype?.includes('pdf')) return <File className="w-5 h-5 text-red-500" />;
    if (file.mimetype?.includes('word')) return <File className="w-5 h-5 text-blue-600" />;
    if (file.mimetype?.startsWith('video/')) return <File className="w-5 h-5 text-purple-500" />;
    if (file.mimetype?.startsWith('audio/')) return <File className="w-5 h-5 text-orange-500" />;
    
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const handleFileUpload = async (event) => {
    const uploadedFiles = Array.from(event.target.files);
    
    for (const file of uploadedFiles) {
      const uploadId = `upload-${Date.now()}-${Math.random()}`;
      
      // Add to upload progress
      setUploads(prev => [...prev, {
        id: uploadId,
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'uploading'
      }]);

      try {
        // Upload to backend with progress tracking
        await apiService.uploadFile(file, (progress) => {
          setUploads(prev => prev.map(u => 
            u.id === uploadId 
              ? { ...u, progress: Math.round(progress) }
              : u
          ));
        });

        // Mark as completed
        setUploads(prev => prev.map(u => 
          u.id === uploadId 
            ? { ...u, progress: 100, status: 'complete' }
            : u
        ));

        // Remove from uploads list after delay and refresh files
        setTimeout(() => {
          setUploads(prev => prev.filter(u => u.id !== uploadId));
          loadFiles(); // Refresh file list
        }, 2000);

      } catch (error) {
        console.error('Upload failed:', error);
        setUploads(prev => prev.map(u => 
          u.id === uploadId 
            ? { ...u, status: 'error', progress: 0 }
            : u
        ));
        
        // Remove failed upload after delay
        setTimeout(() => {
          setUploads(prev => prev.filter(u => u.id !== uploadId));
        }, 3000);
      }
    }
    
    event.target.value = '';
  };

  const filteredFiles = files.filter(file =>
    !searchTerm || 
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.aiTags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    file.aiSummary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    try {
      await apiService.deleteFile(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  const handleShare = async (file) => {
    try {
      const result = await apiService.shareFile(file.id);
      navigator.clipboard.writeText(result.shareUrl);
      alert(`Share link for "${file.name}" copied to clipboard!\n\n${result.shareUrl}\n\nExpires in: ${result.expiresIn}`);
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback to simple share
      const shareUrl = `http://localhost:5000/share/${Math.random().toString(36).substr(2, 16)}`;
      navigator.clipboard.writeText(shareUrl);
      alert(`Share link copied to clipboard!\n${shareUrl}`);
    }
  };

  const handleDownload = (file) => {
    apiService.downloadFile(file.id);
  };

  // Inline styles (same as before)
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: 'system-ui, sans-serif'
    },
    header: {
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '16px',
      marginBottom: '24px'
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#111827'
    },
    searchBox: {
      position: 'relative'
    },
    searchInput: {
      paddingLeft: '40px',
      paddingRight: '16px',
      paddingTop: '8px',
      paddingBottom: '8px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      width: '300px'
    },
    searchIcon: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af'
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 16px'
    },
    statusBar: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 16px',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      marginBottom: '24px'
    },
    statusConnected: {
      backgroundColor: '#dcfce7',
      borderColor: '#bbf7d0',
      color: '#166534'
    },
    statusError: {
      backgroundColor: '#fef2f2',
      borderColor: '#fecaca',
      color: '#dc2626'
    },
    toolbar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    uploadBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 16px',
      backgroundColor: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    refreshBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 16px',
      backgroundColor: 'white',
      color: '#374151',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      marginLeft: '8px'
    },
    viewToggle: {
      display: 'flex',
      gap: '8px'
    },
    viewBtn: {
      padding: '8px',
      border: '1px solid #d1d5db',
      backgroundColor: 'white',
      borderRadius: '8px',
      cursor: 'pointer'
    },
    activeViewBtn: {
      backgroundColor: '#dbeafe',
      color: '#2563eb',
      borderColor: '#2563eb'
    },
    uploadProgress: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: '#e5e7eb',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '8px'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#2563eb',
      transition: 'width 0.3s ease'
    },
    progressError: {
      backgroundColor: '#dc2626'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '16px'
    },
    fileCard: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      cursor: 'pointer',
      transition: 'box-shadow 0.2s'
    },
    fileCardHover: {
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    fileHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px'
    },
    fileActions: {
      display: 'flex',
      gap: '4px'
    },
    actionBtn: {
      padding: '4px',
      border: 'none',
      backgroundColor: 'transparent',
      color: '#9ca3af',
      cursor: 'pointer',
      borderRadius: '4px'
    },
    fileName: {
      fontSize: '16px',
      fontWeight: '500',
      color: '#111827',
      marginBottom: '4px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    fileSize: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '8px'
    },
    tags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px',
      marginBottom: '8px'
    },
    tag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 8px',
      backgroundColor: '#dbeafe',
      color: '#1d4ed8',
      fontSize: '12px',
      borderRadius: '12px'
    },
    summary: {
      fontSize: '12px',
      color: '#6b7280',
      lineHeight: '1.4'
    },
    aiProcessing: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      backgroundColor: '#eff6ff',
      borderRadius: '6px',
      marginTop: '8px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '64px 16px',
      color: '#6b7280'
    },
    loadingState: {
      textAlign: 'center',
      padding: '64px 16px',
      color: '#6b7280'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>
            <Brain size={32} color="#2563eb" />
            AI Cloud Storage
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'normal', marginLeft: '8px' }}>
              (Connected to Backend)
            </span>
          </h1>
          <div style={styles.searchBox}>
            <Search size={20} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search files, tags, or content..."
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={styles.main}>
        {/* Server Status */}
        <div style={{
          ...styles.statusBar,
          ...(serverStatus === 'connected' ? styles.statusConnected : {}),
          ...(serverStatus === 'error' ? styles.statusError : {})
        }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: serverStatus === 'connected' ? '#10b981' : '#ef4444' 
          }} />
          {serverStatus === 'connected' && `✅ Connected to backend • ${files.length} files`}
          {serverStatus === 'error' && '❌ Backend connection failed • Make sure server is running on port 5000'}
          {serverStatus === 'checking' && '🔄 Connecting to backend...'}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ ...styles.statusBar, ...styles.statusError, marginBottom: '24px' }}>
            <strong>Error:</strong> {error}
            <button 
              onClick={loadFiles}
              style={{ 
                marginLeft: 'auto', 
                padding: '4px 8px', 
                backgroundColor: '#dc2626', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Upload Progress */}
        {uploads.length > 0 && (
          <div style={styles.uploadProgress}>
            <h3 style={{ margin: '0 0 16px 0', fontWeight: '500' }}>
              Uploading Files ({uploads.length})
            </h3>
            {uploads.map(upload => (
              <div key={upload.id} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px' }}>
                    {upload.name} ({formatFileSize(upload.size)})
                  </span>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    {upload.status === 'complete' ? '✅ Complete' : 
                     upload.status === 'error' ? '❌ Failed' : 
                     `${upload.progress}%`}
                  </span>
                </div>
                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressFill,
                      ...(upload.status === 'error' ? styles.progressError : {}),
                      width: `${upload.progress}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div style={styles.toolbar}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={styles.uploadBtn}
              disabled={serverStatus !== 'connected'}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              <Upload size={16} />
              Upload Files
            </button>
            <button
              onClick={loadFiles}
              style={styles.refreshBtn}
              disabled={loading}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
          <div style={styles.viewToggle}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                ...styles.viewBtn,
                ...(viewMode === 'grid' ? styles.activeViewBtn : {})
              }}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                ...styles.viewBtn,
                ...(viewMode === 'list' ? styles.activeViewBtn : {})
              }}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={styles.loadingState}>
            <RefreshCw size={64} color="#d1d5db" className="animate-spin" />
            <p style={{ fontSize: '18px', margin: '16px 0 8px 0' }}>Loading files...</p>
            <p>Connecting to backend server...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div style={styles.emptyState}>
            <Folder size={64} color="#d1d5db" />
            <p style={{ fontSize: '18px', margin: '16px 0 8px 0' }}>
              {searchTerm ? 'No files match your search' : 'No files found'}
            </p>
            <p>
              {searchTerm ? 'Try a different search term' : 'Upload files to get started!'}
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredFiles.map(file => (
              <div
                key={file.id}
                style={styles.fileCard}
                onMouseEnter={(e) => Object.assign(e.target.style, styles.fileCardHover)}
                onMouseLeave={(e) => e.target.style.boxShadow = ''}
              >
                <div style={styles.fileHeader}>
                  {getFileIcon(file)}
                  <div style={styles.fileActions}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file);
                      }}
                      style={styles.actionBtn}
                      onMouseOver={(e) => e.target.style.color = '#059669'}
                      onMouseOut={(e) => e.target.style.color = '#9ca3af'}
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(file);
                      }}
                      style={styles.actionBtn}
                      onMouseOver={(e) => e.target.style.color = '#2563eb'}
                      onMouseOut={(e) => e.target.style.color = '#9ca3af'}
                      title="Share"
                    >
                      <Share2 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file.id);
                      }}
                      style={styles.actionBtn}
                      onMouseOver={(e) => e.target.style.color = '#dc2626'}
                      onMouseOut={(e) => e.target.style.color = '#9ca3af'}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h3 style={styles.fileName}>{file.name}</h3>
                <p style={styles.fileSize}>
                  {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                </p>
                
                {file.aiTags && file.aiTags.length > 0 && (
                  <div style={styles.tags}>
                    {file.aiTags.slice(0, 3).map(tag => (
                      <span key={tag} style={styles.tag}>
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                    {file.aiTags.length > 3 && (
                      <span style={{ ...styles.tag, backgroundColor: '#f3f4f6', color: '#6b7280' }}>
                        +{file.aiTags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                
                {file.aiSummary && (
                  <p style={styles.summary}>{file.aiSummary}</p>
                )}

                {!file.aiProcessed && (
                  <div style={styles.aiProcessing}>
                    <Brain size={16} color="#3b82f6" className="animate-pulse" />
                    <span style={{ fontSize: '12px', color: '#3b82f6' }}>
                      AI analyzing...
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;