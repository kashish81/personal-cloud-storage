import React, { useState, useEffect } from 'react';
import { Download, Trash2, File, FileText, Image, Video, Music, Archive } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FileList = ({ refreshTrigger }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { token } = useAuth();

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
      } else {
        setMessage('Failed to load files');
      }
    } catch (error) {
      console.error('Fetch files error:', error);
      setMessage('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId, originalName) => {
    try {
      const response = await fetch(`http://localhost:5000/api/files/download/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      } else {
        setMessage('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      setMessage('Download failed');
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('File deleted successfully');
        fetchFiles(); // Refresh list
      } else {
        setMessage(data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage('Delete failed');
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <Image size={24} color="#667eea" />;
    if (mimeType.startsWith('video/')) return <Video size={24} color="#e74c3c" />;
    if (mimeType.startsWith('audio/')) return <Music size={24} color="#9b59b6" />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText size={24} color="#3498db" />;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <Archive size={24} color="#f39c12" />;
    return <File size={24} color="#95a5a6" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div style={styles.loading}>Loading files...</div>;
  }

  if (files.length === 0) {
    return (
      <div style={styles.empty}>
        <File size={60} color="#ccc" />
        <p style={styles.emptyText}>No files uploaded yet</p>
        <p style={styles.emptySubtext}>Upload your first file to get started!</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {message && (
        <div style={styles.message}>
          {message}
        </div>
      )}

      <div style={styles.fileGrid}>
        {files.map((file) => (
          <div key={file.id} style={styles.fileCard}>
            <div style={styles.fileIcon}>
              {getFileIcon(file.mimeType)}
            </div>
            
            <div style={styles.fileInfo}>
              <h4 style={styles.fileName}>{file.originalName}</h4>
              <p style={styles.fileSize}>{formatFileSize(file.size)}</p>
              <p style={styles.fileDate}>{formatDate(file.createdAt)}</p>
            </div>

            <div style={styles.fileActions}>
              <button
                onClick={() => handleDownload(file.id, file.originalName)}
                style={styles.actionButton}
                title="Download"
              >
                <Download size={18} />
              </button>
              <button
                onClick={() => handleDelete(file.id)}
                style={{ ...styles.actionButton, ...styles.deleteButton }}
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    marginTop: '30px'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    fontSize: '16px'
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#999'
  },
  emptyText: {
    fontSize: '18px',
    fontWeight: '500',
    color: '#666',
    margin: '20px 0 10px'
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#999',
    margin: 0
  },
  message: {
    padding: '12px 16px',
    background: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  fileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  fileCard: {
    background: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  fileIcon: {
    minWidth: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8f9ff',
    borderRadius: '10px'
  },
  fileInfo: {
    flex: 1,
    minWidth: 0
  },
  fileName: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  fileSize: {
    margin: '0 0 4px 0',
    fontSize: '12px',
    color: '#666'
  },
  fileDate: {
    margin: 0,
    fontSize: '11px',
    color: '#999'
  },
  fileActions: {
    display: 'flex',
    gap: '8px'
  },
  actionButton: {
    padding: '8px',
    background: '#f0f0f0',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    color: '#667eea'
  },
  deleteButton: {
    color: '#dc3545'
  }
};

export default FileList;