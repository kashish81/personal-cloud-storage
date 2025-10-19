import React, { useState, useRef, useEffect } from 'react';
import { Brain, Upload, File, Search, Grid, List, Share2, Trash2, Tag, Eye, Folder, Download, RefreshCw, Moon, Sun } from 'lucide-react';  
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import './App.css';

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
        if (xhr.status === 200 || xhr.status === 201) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });
      
      xhr.open('POST', `${API_BASE_URL}/files/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
      xhr.send(formData);
    });
  },

  getFiles: async (token) => {
    const response = await fetch(`${API_BASE_URL}/files`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch files');
    return response.json();
  },

  deleteFile: async (fileId, token) => {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete file');
    return response.json();
  },

  downloadFile: (fileId, token) => {
    const url = `${API_BASE_URL}/files/download/${fileId}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = '';
    link.click();
  },

  shareFile: async (fileId, token) => {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}/share`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to create share link');
    return response.json();
  }
};

const LoadingScreen = ({ theme }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      backgroundColor: theme.bg,
      color: theme.text
    }}>
      <div style={{ 
        width: '50px', 
        height: '50px', 
        border: `4px solid ${theme.border}`,
        borderTopColor: theme.primary,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{ marginTop: '20px', fontSize: '16px' }}>Loading...</p>
    </div>
  );
};

const AuthWrapper = () => {
  const [showLogin, setShowLogin] = useState(true);
  const { isAuthenticated, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return <LoadingScreen theme={theme} />;
  }

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return showLogin ? (
    <Login onToggleMode={() => setShowLogin(false)} />
  ) : (
    <Register onToggleMode={() => setShowLogin(true)} />
  );
};

function AppContent() {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef();
  const { token } = useAuth();
  const { isDark, toggleTheme, theme } = useTheme();

  useEffect(() => {
    setMounted(true);
    if (token) {
      loadFiles();
    }
  }, [token]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getFiles(token);
      setFiles(response.files || []);
    } catch (error) {
      console.error('Failed to load files:', error);
      setError('Failed to load files from server.');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    const iconProps = { size: 20 };
    if (file.mimeType?.startsWith('image/')) return <Eye {...iconProps} color={theme.primary} />;
    if (file.mimeType?.includes('pdf')) return <File {...iconProps} color="#dc2626" />;
    if (file.mimeType?.includes('word')) return <File {...iconProps} color="#2563eb" />;
    if (file.mimeType?.startsWith('video/')) return <File {...iconProps} color="#9333ea" />;
    if (file.mimeType?.startsWith('audio/')) return <File {...iconProps} color="#f97316" />;
    return <File {...iconProps} color={theme.textSecondary} />;
  };

  const handleFileUpload = async (event) => {
    const uploadedFiles = Array.from(event.target.files);
    
    for (const file of uploadedFiles) {
      const uploadId = `upload-${Date.now()}-${Math.random()}`;
      
      setUploads(prev => [...prev, {
        id: uploadId,
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'uploading'
      }]);

      try {
        await apiService.uploadFile(file, (progress) => {
          setUploads(prev => prev.map(u => 
            u.id === uploadId 
              ? { ...u, progress: Math.round(progress) }
              : u
          ));
        });

        setUploads(prev => prev.map(u => 
          u.id === uploadId 
            ? { ...u, progress: 100, status: 'complete' }
            : u
        ));

        setTimeout(() => {
          setUploads(prev => prev.filter(u => u.id !== uploadId));
          loadFiles();
        }, 2000);

      } catch (error) {
        console.error('Upload failed:', error);
        setUploads(prev => prev.map(u => 
          u.id === uploadId 
            ? { ...u, status: 'error', progress: 0 }
            : u
        ));
        
        setTimeout(() => {
          setUploads(prev => prev.filter(u => u.id !== uploadId));
        }, 3000);
      }
    }
    
    event.target.value = '';
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = !searchTerm || 
      file.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || 
      (filterType === 'images' && file.mimeType?.startsWith('image/')) ||
      (filterType === 'documents' && (file.mimeType?.includes('pdf') || file.mimeType?.includes('word'))) ||
      (filterType === 'videos' && file.mimeType?.startsWith('video/'));
    
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    try {
      await apiService.deleteFile(fileId, token);
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete file.');
    }
  };

  const handleShare = (file) => {
    const shareUrl = `https://yourapp.com/share/${file.id}`;
    navigator.clipboard.writeText(shareUrl);
    alert(`Share link copied to clipboard!\n${shareUrl}`);
  };

  const handleDownload = (file) => {
    apiService.downloadFile(file.id, token);
  };

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.bg, fontFamily: 'system-ui', color: theme.text, transition: 'all 0.3s ease' }}>
      {/* Header */}
      <div style={{ backgroundColor: theme.bgSecondary, borderBottom: `1px solid ${theme.border}`, padding: '16px', marginBottom: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '24px', fontWeight: 'bold', color: theme.text }}>
            <Brain size={32} color={theme.primary} />
            AI Cloud Storage
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.textSecondary }} />
              <input
                type="text"
                placeholder="Search files, tags..."
                style={{ 
                  paddingLeft: '40px', 
                  paddingRight: '16px', 
                  paddingTop: '8px', 
                  paddingBottom: '8px', 
                  border: `1px solid ${theme.border}`, 
                  borderRadius: '8px', 
                  fontSize: '14px', 
                  width: '300px',
                  backgroundColor: theme.bgSecondary,
                  color: theme.text
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={toggleTheme}
              style={{
                padding: '8px 16px',
                backgroundColor: theme.hover,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: theme.text,
                transition: 'all 0.3s ease'
              }}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        {/* Upload Progress */}
        {uploads.length > 0 && (
          <div style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontWeight: '500', color: theme.text }}>
              Uploading Files ({uploads.length})
            </h3>
            {uploads.map(upload => (
              <div key={upload.id} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', color: theme.text }}>{upload.name}</span>
                  <span style={{ fontSize: '14px', color: theme.textSecondary }}>
                    {upload.status === 'complete' ? '✅ Complete' : upload.status === 'error' ? '❌ Failed' : `${upload.progress}%`}
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: theme.hover, borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{
                      height: '100%',
                      backgroundColor: upload.status === 'error' ? '#dc2626' : theme.primary,
                      width: `${upload.progress}%`,
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '12px 16px', 
                backgroundColor: theme.primary,
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontSize: '14px', 
                fontWeight: '500',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <Upload size={16} />
              Upload Files
            </button>
            <button
              onClick={loadFiles}
              disabled={loading}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '12px 16px', 
                backgroundColor: theme.bgSecondary,
                color: theme.text,
                border: `1px solid ${theme.border}`, 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontSize: '14px', 
                fontWeight: '500'
              }}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '8px',
                border: `1px solid ${theme.border}`,
                backgroundColor: viewMode === 'grid' ? theme.primaryLight : theme.bgSecondary,
                color: viewMode === 'grid' ? theme.primary : theme.textSecondary,
                borderColor: viewMode === 'grid' ? theme.primary : theme.border,
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px',
                border: `1px solid ${theme.border}`,
                backgroundColor: viewMode === 'list' ? theme.primaryLight : theme.bgSecondary,
                color: viewMode === 'list' ? theme.primary : theme.textSecondary,
                borderColor: viewMode === 'list' ? theme.primary : theme.border,
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Files Grid */}
        {loading && files.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 16px', color: theme.textSecondary }}>
            <RefreshCw size={64} color={theme.border} />
            <p style={{ fontSize: '18px', margin: '16px 0 8px 0', color: theme.text }}>Loading files...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 16px', color: theme.textSecondary }}>
            <Folder size={64} color={theme.border} />
            <p style={{ fontSize: '18px', margin: '16px 0 8px 0', color: theme.text }}>No files found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {filteredFiles.map(file => (
              <div
                key={file.id}
                style={{ 
                  backgroundColor: theme.bgSecondary, 
                  border: `1px solid ${theme.border}`, 
                  borderRadius: '8px', 
                  padding: '16px', 
                  cursor: 'pointer', 
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.primary}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.border}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  {getFileIcon(file)}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                      style={{ padding: '4px', border: 'none', backgroundColor: 'transparent', color: theme.textSecondary, cursor: 'pointer', borderRadius: '4px' }}
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleShare(file); }}
                      style={{ padding: '4px', border: 'none', backgroundColor: 'transparent', color: theme.textSecondary, cursor: 'pointer', borderRadius: '4px' }}
                    >
                      <Share2 size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                      style={{ padding: '4px', border: 'none', backgroundColor: 'transparent', color: theme.textSecondary, cursor: 'pointer', borderRadius: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h3 style={{ fontSize: '16px', fontWeight: '500', color: theme.text, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.originalName}
                </h3>
                <p style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '8px' }}>
                  {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
                </p>
                
                {file.tags && file.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {file.tags.slice(0, 3).map(tag => (
                      <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', backgroundColor: theme.primaryLight, color: theme.primary, fontSize: '12px', borderRadius: '12px' }}>
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                    {file.tags.length > 3 && (
                      <span style={{ padding: '4px 8px', backgroundColor: theme.hover, color: theme.textSecondary, fontSize: '12px', borderRadius: '12px' }}>
                        +{file.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthWrapper />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;