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

  // ============ ALL EXISTING LOGIC - NO CHANGES ============
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
  // ============ END OF EXISTING LOGIC ============

  // ============ ENHANCED STYLES - UI ONLY ============
  const dynamicStyles = {
    container: {
      width: '100%',
      marginTop: '30px'
    },
    loading: {
      textAlign: 'center',
      padding: '60px',
      color: theme.textSecondary,
      fontSize: '16px',
      fontWeight: '500',
      transition: 'color 0.3s ease'
    },
    empty: {
      textAlign: 'center',
      padding: '80px 20px',
      color: theme.textSecondary,
      transition: 'color 0.3s ease'
    },
    emptyText: {
      fontSize: '20px',
      fontWeight: '600',
      color: theme.text,
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
      padding: '14px 20px',
      background: isDark 
        ? 'linear-gradient(135deg, rgba(74, 222, 128, 0.15) 0%, rgba(34, 197, 94, 0.15) 100%)'
        : 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
      color: isDark ? '#86efac' : '#155724',
      border: `1px solid ${isDark ? 'rgba(74, 222, 128, 0.3)' : '#c3e6cb'}`,
      borderRadius: '12px',
      marginBottom: '24px',
      fontSize: '14px',
      fontWeight: '500',
      backdropFilter: 'blur(10px)',
      boxShadow: `0 4px 12px ${isDark ? 'rgba(74, 222, 128, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
      animation: 'slideDown 0.3s ease-out',
      transition: 'all 0.3s ease'
    },
    searchInfo: {
      fontSize: '14px',
      color: theme.textSecondary,
      marginBottom: '20px',
      fontWeight: '600',
      padding: '12px 20px',
      background: theme.hover,
      borderRadius: '10px',
      border: `1px solid ${theme.border}`,
      transition: 'all 0.3s ease'
    },
    fileGrid: {
      display: 'grid',
      gap: '20px',
      animation: 'fadeIn 0.5s ease-out'
    },
    fileCard: {
      position: 'relative',
      background: theme.bgSecondary,
      border: `1px solid ${theme.border}`,
      borderRadius: '16px',
      padding: '24px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      overflow: 'hidden',
      boxShadow: `0 2px 8px ${isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`,
      animation: 'slideUp 0.4s ease-out'
    },
    fileIcon: {
      minWidth: '56px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDark
        ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)'
        : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
      borderRadius: '14px',
      border: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.15)'}`,
      transition: 'all 0.3s ease',
      boxShadow: `0 4px 12px ${isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.08)'}`
    },
    fileInfo: {
      flex: 1,
      minWidth: 0
    },
    fileName: {
      margin: '0 0 10px 0',
      fontSize: '15px',
      fontWeight: '600',
      color: theme.text,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      transition: 'color 0.3s ease',
      letterSpacing: '-0.01em'
    },
    fileSize: {
      margin: '0 0 6px 0',
      fontSize: '13px',
      color: theme.textSecondary,
      fontWeight: '500',
      transition: 'color 0.3s ease'
    },
    fileDate: {
      margin: '0 0 14px 0',
      fontSize: '12px',
      color: theme.textSecondary,
      transition: 'color 0.3s ease',
      opacity: 0.8
    },
    tagsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '12px'
    },
    tag: {
      padding: '6px 14px',
      background: isDark 
        ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)'
        : 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
      border: `1.5px solid ${isDark ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.2)'}`,
      color: theme.primary,
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
      letterSpacing: '0.02em'
    },
    fileActions: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    actionButton: {
      padding: '10px',
      background: theme.hover,
      border: `1px solid ${theme.border}`,
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      color: theme.primary,
      boxShadow: `0 2px 6px ${isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.04)'}`
    },
    deleteButton: {
      color: '#dc3545'
    }
  };

  // ============ RENDER - SAME STRUCTURE, ENHANCED STYLES ============
  if (loading) {
    return <div style={dynamicStyles.loading}>Loading files...</div>;
  }

  if (searchQuery && filteredFiles.length === 0) {
    return (
      <div style={dynamicStyles.empty}>
        <File size={64} color={theme.border} style={{ marginBottom: '16px' }} />
        <p style={dynamicStyles.emptyText}>No files found</p>
        <p style={dynamicStyles.emptySubtext}>Try a different search term</p>
      </div>
    );
  }

  if (filteredFiles.length === 0) {
    return (
      <div style={dynamicStyles.empty}>
        <File size={64} color={theme.border} style={{ marginBottom: '16px' }} />
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
        <div style={dynamicStyles.searchInfo}>
          Found {filteredFiles.length} result{filteredFiles.length !== 1 ? 's' : ''} for "{searchQuery}"
        </div>
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
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = theme.primary;
              e.currentTarget.style.boxShadow = `0 12px 24px ${isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.15)'}`;
              const icon = e.currentTarget.querySelector('[data-icon]');
              if (icon) {
                icon.style.transform = 'scale(1.1)';
                icon.style.background = isDark
                  ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.25) 100%)'
                  : 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = theme.border;
              e.currentTarget.style.boxShadow = `0 2px 8px ${isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`;
              const icon = e.currentTarget.querySelector('[data-icon]');
              if (icon) {
                icon.style.transform = 'scale(1)';
                icon.style.background = isDark
                  ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)'
                  : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)';
              }
            }}
            onClick={() => setSelectedFile(file)}
          >
            <div style={dynamicStyles.fileIcon} data-icon>
              {getFileIcon(file.mimeType)}
            </div>
            
            <div style={dynamicStyles.fileInfo}>
              <h4 style={dynamicStyles.fileName}>{file.originalName}</h4>
              <p style={dynamicStyles.fileSize}>{formatFileSize(file.size)}</p>
              <p style={dynamicStyles.fileDate}>{formatDate(file.createdAt)}</p>
              
              {file.tags && file.tags.length > 0 && (
                <div style={dynamicStyles.tagsContainer}>
                  {file.tags.slice(0, 10).map((tag, index) => (
                    <span 
                      key={index} 
                      style={dynamicStyles.tag}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = `0 4px 8px ${isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.15)'}`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
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
                  e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = theme.hover;
                  e.currentTarget.style.color = theme.primary;
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = `0 2px 6px ${isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.04)'}`;
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
                  e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = theme.hover;
                  e.currentTarget.style.color = theme.primary;
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = `0 2px 6px ${isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.04)'}`;
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
                  e.currentTarget.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 53, 69, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = theme.hover;
                  e.currentTarget.style.color = '#dc3545';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = `0 2px 6px ${isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.04)'}`;
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

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default FileList;