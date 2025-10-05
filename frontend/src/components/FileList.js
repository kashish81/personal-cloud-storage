import React, { useState, useEffect } from 'react';
import { Download, Trash2, File, FileText, Image, Video, Music, Archive, Star, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FileDetail from './FileDetail';

const FileList = ({ refreshTrigger, searchQuery, filter }) => {
  const [allFiles, setAllFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger, filter]);

  // Search filter effect
  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      setFilteredFiles(allFiles);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = allFiles.filter(file => {
      const nameMatch = file.originalName.toLowerCase().includes(query);
      const tagMatch = file.tags?.some(tag => 
        tag.toLowerCase().includes(query)
      );
      const typeMatch = file.mimeType.toLowerCase().includes(query);
      return nameMatch || tagMatch || typeMatch;
    });
    
    setFilteredFiles(filtered);
  }, [searchQuery, allFiles]);

  const fetchFiles = async () => {
    try {
      let endpoint = 'http://localhost:5000/api/files';
      
      if (filter === 'starred') {
        endpoint = 'http://localhost:5000/api/files/starred/list';
      } else if (filter === 'bin') {
        endpoint = 'http://localhost:5000/api/files/bin/list';
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setAllFiles(data.files);
        setFilteredFiles(data.files);
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

const handleStar = async (fileId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/files/${fileId}/star`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Star response:', data); // Debug log
    
    if (data.success) {
      // If in starred view and file is now unstarred, remove it
      if (filter === 'starred' && !data.isStarred) {
        fetchFiles(); // Refresh to remove from list
      } else {
        // Update state immediately
        const updateFileState = (files) => 
          files.map(f => f.id === fileId ? { ...f, isStarred: data.isStarred } : f);
        
        setAllFiles(updateFileState);
        setFilteredFiles(updateFileState);
        
        if (selectedFile?.id === fileId) {
          setSelectedFile(prev => ({ ...prev, isStarred: data.isStarred }));
        }
      }
      
      setMessage(data.message);
      setTimeout(() => setMessage(''), 3000);
    }
  } catch (error) {
    console.error('Star error:', error);
    setMessage('Failed to star file');
  }
};

const handleDelete = async (fileId) => {
  if (!window.confirm('Move this file to bin?')) {
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
    console.log('Delete response:', data); // Debug log
    
    if (data.success) {
      setMessage(data.message);
      setTimeout(() => setMessage(''), 3000);
      fetchFiles(); // Refresh list to remove file
    } else {
      setMessage(data.message || 'Delete failed');
    }
  } catch (error) {
    console.error('Delete error:', error);
    setMessage('Delete failed');
  }
};

  const handleRestore = async (fileId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/files/${fileId}/restore`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('File restored successfully');
        fetchFiles();
      }
    } catch (error) {
      console.error('Restore error:', error);
      setMessage('Failed to restore file');
    }
  };

  const handlePermanentDelete = async (fileId) => {
    if (!window.confirm('Permanently delete this file? This cannot be undone!')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/files/${fileId}/permanent`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('File permanently deleted');
        fetchFiles();
      }
    } catch (error) {
      console.error('Permanent delete error:', error);
      setMessage('Failed to delete file');
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

  if (searchQuery && filteredFiles.length === 0) {
    return (
      <div style={styles.empty}>
        <File size={60} color="#ccc" />
        <p style={styles.emptyText}>No files found</p>
        <p style={styles.emptySubtext}>Try a different search term</p>
      </div>
    );
  }

  if (filteredFiles.length === 0) {
    return (
      <div style={styles.empty}>
        <File size={60} color="#ccc" />
        <p style={styles.emptyText}>No files here yet</p>
        <p style={styles.emptySubtext}>
          {filter === 'starred' && 'Star files to see them here'}
          {filter === 'bin' && 'Deleted files will appear here'}
          {!filter && 'Upload your first file to get started!'}
        </p>
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

      {searchQuery && (
        <p style={styles.searchInfo}>
          Found {filteredFiles.length} result{filteredFiles.length !== 1 ? 's' : ''} for "{searchQuery}"
        </p>
      )}

      <div style={styles.fileGrid}>
        {filteredFiles.map((file) => (
          <div 
            key={file.id} 
            style={styles.fileCard}
            onClick={() => setSelectedFile(file)}
          >
            {filter !== 'bin' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // handleStar(file.id, file.isStarred);
                }}
                style={styles.starButton}
              >
                <Star 
                  size={20} 
                  fill={file.isStarred ? '#FFC107' : 'none'}
                  color={file.isStarred ? '#FFC107' : '#ccc'}
                />
              </button>
            )}

            <div style={styles.fileIcon}>
              {getFileIcon(file.mimeType)}
            </div>
            
            <div style={styles.fileInfo}>
              <h4 style={styles.fileName}>{file.originalName}</h4>
              <p style={styles.fileSize}>{formatFileSize(file.size)}</p>
              <p style={styles.fileDate}>
                {filter === 'bin' 
                  ? `Deleted: ${formatDate(file.deletedAt)}`
                  : formatDate(file.createdAt)
                }
              </p>
              
              {file.tags && file.tags.length > 0 && (
                <div style={styles.tagsContainer}>
                  {file.tags.slice(0, 5).map((tag, index) => (
                    <span key={index} style={styles.tag}>
                      {tag}
                    </span>
                  ))}
                  {file.tags.length > 5 && (
                    <span style={styles.moreTagsIndicator}>
                      +{file.tags.length - 5}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div style={styles.fileActions}>
              {filter === 'bin' ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestore(file.id);
                    }}
                    style={styles.actionButton}
                    title="Restore"
                  >
                    <RotateCcw size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePermanentDelete(file.id);
                    }}
                    style={{ ...styles.actionButton, ...styles.deleteButton }}
                    title="Delete Forever"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(file.id, file.originalName);
                    }}
                    style={styles.actionButton}
                    title="Download"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file.id);
                    }}
                    style={{ ...styles.actionButton, ...styles.deleteButton }}
                    title="Move to Bin"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedFile && (
        <FileDetail
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
          onDownload={handleDownload}
          onDelete={(fileId) => {
            filter === 'bin' 
              ? handlePermanentDelete(fileId)
              : handleDelete(fileId);
            setSelectedFile(null);
          }}
          onStar={handleStar}
          onRestore={handleRestore}
          isBin={filter === 'bin'}
        />
      )}
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px'
  },
  fileCard: {
    position: 'relative',
    background: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '20px',
    paddingTop: '40px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  starButton: {
  position: 'absolute',
  top: '8px',
  right: '8px',
  background: 'rgba(255, 255, 255, 0.9)',
  border: '1px solid #e0e0e0',
  borderRadius: '50%',
  cursor: 'pointer',
  padding: '6px',
  zIndex: 5,
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
    minWidth: 0,
    paddingRight: '30px'
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
    margin: '0 0 12px 0',
    fontSize: '11px',
    color: '#999'
  },
  searchInfo: {
    fontSize: '14px',
    color: '#5f6368',
    marginBottom: '16px',
    fontWeight: '500'
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '10px'
  },
  tag: {
    padding: '4px 12px',
    background: '#ffffff',
    border: '1.5px solid #667eea',
    color: '#667eea',
    borderRadius: '16px',
    fontSize: '11px',
    fontWeight: '500'
  },
  moreTagsIndicator: {
    padding: '4px 10px',
    background: '#f0f0f0',
    color: '#666',
    borderRadius: '16px',
    fontSize: '10px',
    fontWeight: '500'
  },
  fileActions: {
    display: 'flex',
    flexDirection: 'column',
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