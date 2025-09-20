import React, { useState, useRef, useEffect } from 'react';
import { Brain, Upload, File, Search, Share2, Trash2, Tag, Eye, Folder, Download } from 'lucide-react';

const API_BASE_URL = 'https://personal-cloud-storage-production.up.railway.app/api';

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
    return response.json();
  },

  deleteFile: async (fileId) => {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  downloadFile: (fileId) => {
    window.open(`${API_BASE_URL}/files/${fileId}/download`, '_blank');
  }
};

function App() {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploads, setUploads] = useState([]);
  const [serverStatus, setServerStatus] = useState('checking');
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    setMounted(true);
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const response = await apiService.getFiles();
      setFiles(response.files || []);
      setServerStatus('connected');
    } catch (error) {
      setServerStatus('error');
    }
  };

  const handleFileUpload = async (event) => {
    const uploadedFiles = Array.from(event.target.files);
    
    for (const file of uploadedFiles) {
      const uploadId = `upload-${Date.now()}-${Math.random()}`;
      
      setUploads(prev => [...prev, {
        id: uploadId,
        name: file.name,
        progress: 0,
        status: 'uploading'
      }]);

      try {
        await apiService.uploadFile(file, (progress) => {
          setUploads(prev => prev.map(u => 
            u.id === uploadId ? { ...u, progress: Math.round(progress) } : u
          ));
        });

        setUploads(prev => prev.map(u => 
          u.id === uploadId ? { ...u, progress: 100, status: 'complete' } : u
        ));

        setTimeout(() => {
          setUploads(prev => prev.filter(u => u.id !== uploadId));
          loadFiles();
        }, 2000);

      } catch (error) {
        setUploads(prev => prev.map(u => 
          u.id === uploadId ? { ...u, status: 'error' } : u
        ));
      }
    }
    
    event.target.value = '';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!mounted) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'system-ui' }}>
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '24px', fontWeight: 'bold' }}>
            <Brain size={32} color="#2563eb" />
            AI Cloud Storage
          </h1>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search files..."
              style={{ paddingLeft: '40px', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', width: '300px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ 
          padding: '12px 16px', 
          backgroundColor: serverStatus === 'connected' ? '#dcfce7' : '#fef2f2',
          border: '1px solid ' + (serverStatus === 'connected' ? '#bbf7d0' : '#fecaca'),
          borderRadius: '8px', 
          marginBottom: '24px',
          color: serverStatus === 'connected' ? '#166534' : '#dc2626'
        }}>
          {serverStatus === 'connected' ? `Connected to backend • ${files.length} files` : 'Backend connection failed'}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            <Upload size={16} />
            Upload Files
          </button>
        </div>

        {uploads.length > 0 && (
          <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
            <h3>Uploading Files</h3>
            {uploads.map(upload => (
              <div key={upload.id} style={{ marginBottom: '12px' }}>
                <div>{upload.name} - {upload.status === 'complete' ? 'Complete' : `${upload.progress}%`}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {files.filter(file => 
            !searchTerm || file.name.toLowerCase().includes(searchTerm.toLowerCase())
          ).map(file => (
            <div key={file.id} style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <File size={20} color="#3b82f6" />
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => apiService.downloadFile(file.id)} style={{ padding: '4px', border: 'none', background: 'none', cursor: 'pointer' }}>
                    <Download size={16} />
                  </button>
                  <button style={{ padding: '4px', border: 'none', background: 'none', cursor: 'pointer' }}>
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontWeight: '500' }}>{file.name}</h3>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280' }}>{formatFileSize(file.size)}</p>
              {file.aiTags && file.aiTags.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {file.aiTags.slice(0, 3).map(tag => (
                    <span key={tag} style={{ padding: '4px 8px', backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: '12px', borderRadius: '12px' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {file.aiSummary && (
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{file.aiSummary}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;