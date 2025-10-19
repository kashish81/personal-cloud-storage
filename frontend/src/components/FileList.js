import React, { useState, useEffect } from 'react';
import { Download, Trash2, File, FileText, Image, Video, Music, Archive, Share2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import FileDetail from './FileDetail';
import { useMediaQuery } from './hooks/useMediaQuery';

const FileList = ({ refreshTrigger, searchQuery }) => {
  const { theme, isDark } = useTheme();
  const [allFiles, setAllFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const { token } = useAuth();
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger]);

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
      const response = await fetch('http://localhost:5000/api/files', {
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
    if (!window.confirm('Are you sure you want to permanently delete this file?')) {
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
        setSelectedFile(null);
        fetchFiles();
        setTimeout(() => setMessage(''), 2000);
      } else {
        setMessage(data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage('Delete failed');
    }
  };

  const handleShare = (file) => {
    const shareText = `Check out this file: ${file.originalName}`;
    
    if (navigator.share) {
      navigator.share({
        title: file.originalName,
        text: shareText
      }).catch(err => console.log('Share failed:', err));
    } else {
      navigator.clipboard.writeText(shareText);
      setMessage('Link copied to clipboard!');
      setTimeout(() => setMessage(''), 2000);
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

  const getGridColumns = () => {
    if (isMobile) return 'repeat(2, 1fr)';
    if (isTablet) return 'repeat(3, 1fr)';
    return 'repeat(auto-fill, minmax(320px, 1fr))';
  };

  // Dynamic styles based on theme
  const dynamicStyles = {
    container: {
      width: '100%',
      marginTop: '30px'
    },
    loading: {
      textAlign: 'center',
      padding: '40px',
      color: theme.textSecondary,
      fontSize: '16px',
      transition: 'color 0.3s ease'
    },
    empty: {
      textAlign: 'center',
      padding: '60px 20px',
      color: theme.textSecondary,
      transition: 'color 0.3s ease'
    },
    emptyText: {
      fontSize: '18px',
      fontWeight: '500',
      color: theme.textSecondary,
      margin: '20px 0 10px',
      transition: 'color 0.3s ease'
    },
    emptySubtext: {
      fontSize: '14px',
      color: theme.textSecondary,
      margin: 0,
      transition: 'color 0.3s ease'
    },
    message: {
      padding: '12px 16px',
      background: isDark ? '#1e3a1f' : '#d4edda',
      color: isDark ? '#86efac' : '#155724',
      border: `1px solid ${isDark ? '#4ade80' : '#c3e6cb'}`,
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '14px',
      transition: 'all 0.3s ease'
    },
    fileGrid: {
      display: 'grid',
      gap: '20px'
    },
    fileCard: {
      position: 'relative',
      background: theme.bgSecondary,
      border: `1px solid ${theme.border}`,
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '15px',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    fileCardHover: {
      borderColor: theme.primary,
      boxShadow: `0 4px 12px rgba(0, 0, 0, ${isDark ? 0.3 : 0.1})`
    },
    fileIcon: {
      minWidth: '50px',
      height: '50px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: theme.hover,
      borderRadius: '10px',
      transition: 'background 0.3s ease'
    },
    fileInfo: {
      flex: 1,
      minWidth: 0
    },
    fileName: {
      margin: '0 0 8px 0',
      fontSize: '14px',
      fontWeight: '500',
      color: theme.text,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      transition: 'color 0.3s ease'
    },
    fileSize: {
      margin: '0 0 4px 0',
      fontSize: '12px',
      color: theme.textSecondary,
      transition: 'color 0.3s ease'
    },
    fileDate: {
      margin: '0 0 12px 0',
      fontSize: '11px',
      color: theme.textSecondary,
      transition: 'color 0.3s ease'
    },
    searchInfo: {
      fontSize: '14px',
      color: theme.textSecondary,
      marginBottom: '16px',
      fontWeight: '500',
      transition: 'color 0.3s ease'
    },
    tagsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      marginTop: '10px'
    },
    tag: {
      padding: '4px 12px',
      background: isDark ? '#1e3a3f' : '#ffffff',
      border: `1.5px solid ${theme.primary}`,
      color: theme.primary,
      borderRadius: '16px',
      fontSize: '11px',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    moreTagsIndicator: {
      padding: '4px 10px',
      background: theme.hover,
      color: theme.textSecondary,
      borderRadius: '16px',
      fontSize: '10px',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    fileActions: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    actionButton: {
      padding: '8px',
      background: theme.hover,
      border: `1px solid ${theme.border}`,
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      color: theme.primary
    },
    deleteButton: {
      color: '#dc3545'
    }
  };

  if (loading) {
    return <div style={dynamicStyles.loading}>Loading files...</div>;
  }

  if (searchQuery && filteredFiles.length === 0) {
    return (
      <div style={dynamicStyles.empty}>
        <File size={60} color={theme.border} />
        <p style={dynamicStyles.emptyText}>No files found</p>
        <p style={dynamicStyles.emptySubtext}>Try a different search term</p>
      </div>
    );
  }

  if (filteredFiles.length === 0) {
    return (
      <div style={dynamicStyles.empty}>
        <File size={60} color={theme.border} />
        <p style={dynamicStyles.emptyText}>No files uploaded yet</p>
        <p style={dynamicStyles.emptySubtext}>Upload your first file to get started!</p>
      </div>
    );
  }

  return (
    <div style={dynamicStyles.container}>
      {message && (
        <div style={dynamicStyles.message}>
          {message}
        </div>
      )}

      {searchQuery && (
        <p style={dynamicStyles.searchInfo}>
          Found {filteredFiles.length} result{filteredFiles.length !== 1 ? 's' : ''} for "{searchQuery}"
        </p>
      )}

      <div style={{
        ...dynamicStyles.fileGrid,
        gridTemplateColumns: getGridColumns()
      }}>
        {filteredFiles.map((file) => (
          <div 
            key={file.id} 
            style={dynamicStyles.fileCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = dynamicStyles.fileCardHover.borderColor;
              e.currentTarget.style.boxShadow = dynamicStyles.fileCardHover.boxShadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.border;
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => setSelectedFile(file)}
          >
            <div style={dynamicStyles.fileIcon}>
              {getFileIcon(file.mimeType)}
            </div>
            
            <div style={dynamicStyles.fileInfo}>
              <h4 style={dynamicStyles.fileName}>{file.originalName}</h4>
              <p style={dynamicStyles.fileSize}>{formatFileSize(file.size)}</p>
              <p style={dynamicStyles.fileDate}>{formatDate(file.createdAt)}</p>
              
              {file.tags && file.tags.length > 0 && (
                <div style={dynamicStyles.tagsContainer}>
                  {file.tags.slice(0, 10).map((tag, index) => (
                    <span key={index} style={dynamicStyles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={dynamicStyles.fileActions}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(file.id, file.originalName);
                }}
                style={dynamicStyles.actionButton}
                title="Download"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.primary;
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = theme.hover;
                  e.currentTarget.style.color = theme.primary;
                }}
              >
                <Download size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(file);
                }}
                style={dynamicStyles.actionButton}
                title="Share"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.primary;
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = theme.hover;
                  e.currentTarget.style.color = theme.primary;
                }}
              >
                <Share2 size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(file.id);
                }}
                style={{ ...dynamicStyles.actionButton, ...dynamicStyles.deleteButton }}
                title="Delete"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dc3545';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = theme.hover;
                  e.currentTarget.style.color = '#dc3545';
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedFile && (
        <FileDetail
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onShare={handleShare}
        />
      )}
    </div>
  );
};

export default FileList;