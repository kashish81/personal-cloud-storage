import React, { useState, useRef, useEffect } from 'react';
import { Brain, Upload, File, Search, Grid, List, Share2, Trash2, Tag, Eye, Folder, Download, RefreshCw } from 'lucide-react';

// API Service
const API_BASE_URL = 'http://personal-cloud-storage.onrender.com/api';
// const API_BASE_URL = 'https://personal-cloud-storage-production.up.railway.app/api';

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
  // ALL HOOKS AT THE TOP
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');
  const [filterType, setFilterType] = useState('all');
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [aiProcessing, setAiProcessing] = useState(new Set());
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef();

  // ALL useEffect HOOKS AT THE TOP
  useEffect(() => {
    setMounted(true);
    loadFiles();
  }, []);

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
      setError('Failed to connect to server.');
      setServerStatus('error');
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
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.aiTags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      file.aiSummary?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
      (filterType === 'images' && file.mimetype?.startsWith('image/')) ||
      (filterType === 'documents' && (file.mimetype?.includes('pdf') || file.mimetype?.includes('word') || file.mimetype?.includes('text'))) ||
      (filterType === 'folders' && file.type === 'folder');
    
    return matchesSearch && matchesFilter;
  });

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
      const shareUrl = `https://yourapp.com/share/${Math.random().toString(36).substr(2, 16)}`;
      navigator.clipboard.writeText(shareUrl);
      alert(`Share link copied to clipboard!\n${shareUrl}`);
    }
  };

  const handleDownload = (file) => {
    apiService.downloadFile(file.id);
  };

  // Prevent rendering until mounted (avoids hydration issues)
  if (!mounted) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'system-ui' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px', marginBottom: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
            <Brain size={32} color="#2563eb" />
            AI Cloud Storage
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'normal', marginLeft: '8px' }}>
              (Connected to Backend)
            </span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search files, tags, or content..."
                style={{ paddingLeft: '40px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', width: '300px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Files</option>
              <option value="images">Images</option>
              <option value="documents">Documents</option>
              <option value="folders">Folders</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        {/* Server Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          backgroundColor: serverStatus === 'connected' ? '#dcfce7' : '#fef2f2',
          border: '1px solid ' + (serverStatus === 'connected' ? '#bbf7d0' : '#fecaca'),
          borderRadius: '8px',
          marginBottom: '24px',
          color: serverStatus === 'connected' ? '#166534' : '#dc2626'
        }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: serverStatus === 'connected' ? '#10b981' : '#ef4444' 
          }} />
          {serverStatus === 'connected' && `✅ Connected to backend • ${files.length} files`}
          {serverStatus === 'error' && '❌ Backend connection failed'}
          {serverStatus === 'checking' && '🔄 Connecting to backend...'}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '24px', color: '#dc2626' }}>
            <strong>Error:</strong> {error}
            <button 
              onClick={loadFiles}
              style={{ 
                marginLeft: '12px', 
                padding: '4px 8px', 
                backgroundColor: '#dc2626', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Upload Progress */}
        {uploads.length > 0 && (
          <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
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
                <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{
                      height: '100%',
                      backgroundColor: upload.status === 'error' ? '#dc2626' : '#2563eb',
                      width: `${upload.progress}%`,
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Processing Notification */}
        {aiProcessing.size > 0 && (
          <div style={{ padding: '12px 16px', backgroundColor: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '8px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Brain size={20} color="#3b82f6" />
              <span style={{ color: '#1e40af', fontWeight: '500' }}>
                AI is analyzing {aiProcessing.size} file{aiProcessing.size !== 1 ? 's' : ''}...
              </span>
            </div>
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
              disabled={serverStatus !== 'connected'}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '12px 16px', 
                backgroundColor: serverStatus === 'connected' ? '#2563eb' : '#9ca3af',
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: serverStatus === 'connected' ? 'pointer' : 'not-allowed',
                fontSize: '14px', 
                fontWeight: '500' 
              }}
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
                backgroundColor: 'white',
                color: '#374151',
                border: '1px solid #d1d5db', 
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
                border: '1px solid #d1d5db',
                backgroundColor: viewMode === 'grid' ? '#dbeafe' : 'white',
                color: viewMode === 'grid' ? '#2563eb' : '#6b7280',
                borderColor: viewMode === 'grid' ? '#2563eb' : '#d1d5db',
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
                border: '1px solid #d1d5db',
                backgroundColor: viewMode === 'list' ? '#dbeafe' : 'white',
                color: viewMode === 'list' ? '#2563eb' : '#6b7280',
                borderColor: viewMode === 'list' ? '#2563eb' : '#d1d5db',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && files.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 16px', color: '#6b7280' }}>
            <RefreshCw size={64} color="#d1d5db" />
            <p style={{ fontSize: '18px', margin: '16px 0 8px 0' }}>Loading files...</p>
            <p>Connecting to backend server...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 16px', color: '#6b7280' }}>
            <Folder size={64} color="#d1d5db" />
            <p style={{ fontSize: '18px', margin: '16px 0 8px 0' }}>
              {searchTerm ? 'No files match your search' : 'No files found'}
            </p>
            <p>
              {searchTerm ? 'Try a different search term' : 'Upload files to get started!'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {filteredFiles.map(file => (
              <div
                key={file.id}
                style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = ''}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  {getFileIcon(file)}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file);
                      }}
                      style={{ padding: '4px', border: 'none', backgroundColor: 'transparent', color: '#9ca3af', cursor: 'pointer', borderRadius: '4px' }}
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(file);
                      }}
                      style={{ padding: '4px', border: 'none', backgroundColor: 'transparent', color: '#9ca3af', cursor: 'pointer', borderRadius: '4px' }}
                      title="Share"
                    >
                      <Share2 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file.id);
                      }}
                      style={{ padding: '4px', border: 'none', backgroundColor: 'transparent', color: '#9ca3af', cursor: 'pointer', borderRadius: '4px' }}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#111827', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                </p>
                
                {file.aiTags && file.aiTags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                    {file.aiTags.slice(0, 3).map(tag => (
                      <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: '12px', borderRadius: '12px' }}>
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                    {file.aiTags.length > 3 && (
                      <span style={{ padding: '4px 8px', backgroundColor: '#f3f4f6', color: '#6b7280', fontSize: '12px', borderRadius: '12px' }}>
                        +{file.aiTags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                
                {file.aiSummary && (
                  <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4', margin: '0' }}>
                    {file.aiSummary}
                  </p>
                )}

                {!file.aiProcessed && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#eff6ff', borderRadius: '6px', marginTop: '8px' }}>
                    <Brain size={16} color="#3b82f6" />
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