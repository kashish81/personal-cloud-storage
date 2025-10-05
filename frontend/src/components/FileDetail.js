import React from 'react';
import { X, Download, Trash2, Share2, FileText, Image as ImageIcon, Video, Music, File as FileIcon, Star, RotateCcw } from 'lucide-react';

const FileDetail = ({ file, onClose, onDownload, onDelete, onStar, onRestore, isBin }) => {
  if (!file) {
    return null;
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilePreview = () => {
  // Add safety check
  if (!file || !file.mimeType) {
    return <FileIcon size={80} color="#95a5a6" />;
  }
  
  if (file.mimeType.startsWith('image/')) {
    return (
      <div style={styles.imagePreview}>
        <ImageIcon size={80} color="#667eea" />
      </div>
    );
  } else if (file.mimeType.startsWith('video/')) {
    return <Video size={80} color="#e74c3c" />;
  } else if (file.mimeType.startsWith('audio/')) {
    return <Music size={80} color="#9b59b6" />;
  } else if (file.mimeType.includes('pdf')) {
    return <FileText size={80} color="#e74c3c" />;
  }
  return <FileIcon size={80} color="#95a5a6" />;
};

  const generateDescription = () => {
  if (!file || !file.mimeType || !file.originalName) {
    return 'File information unavailable';
  }
  
  const type = file.mimeType.split('/')[0];
  const extension = file.originalName.split('.').pop()?.toUpperCase() || 'FILE';
  
  if (file.tags && file.tags.length > 0) {
    const mainTags = file.tags.slice(0, 3).join(', ');
    return `This ${type} file contains ${mainTags} content. Size: ${formatFileSize(file.size)}`;
  }
  return `${extension} ${type} file with size ${formatFileSize(file.size)}`;
};

  return (
    <>
      <div style={styles.overlay} onClick={onClose} />
      <div style={styles.sidebar}>
        <button onClick={onClose} style={styles.closeButton}>
          <X size={24} />
        </button>

        <div style={styles.content}>
          {/* File Preview */}
          <div style={styles.previewSection}>
            {getFilePreview()}
          </div>

          {/* File Details */}
          <div style={styles.detailsSection}>
  <div style={styles.fileNameRow}>
    <h2 style={styles.fileName}>{file.originalName}</h2>
    {!isBin && onStar && (
      <button
        onClick={() => {onStar(file.id, file.isStarred); 
            onClose();}}
        style={styles.starIconButton}
      >
        <Star 
          size={24} 
          fill={file.isStarred ? '#FFC107' : 'none'}
          color={file.isStarred ? '#FFC107' : '#ccc'}
        />
      </button>
    )}
  </div>
            
            <div style={styles.metaInfo}>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Size:</span>
                <span style={styles.metaValue}>{formatFileSize(file.size)}</span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Type:</span>
                <span style={styles.metaValue}>{file.mimeType}</span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Created:</span>
                <span style={styles.metaValue}>{formatDate(file.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* AI Tags */}
          {file.tags && file.tags.length > 0 && (
            <div style={styles.tagsSection}>
              <h3 style={styles.sectionTitle}>AI Generated Tags</h3>
              <div style={styles.tagsContainer}>
                {file.tags.map((tag, index) => (
                  <span key={index} style={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div style={styles.descriptionSection}>
            <h3 style={styles.sectionTitle}>Description</h3>
            <p style={styles.description}>{generateDescription()}</p>
          </div>

          {/* Actions */}
          <div style={styles.actionsSection}>
            {isBin ? (
              <>
                <button 
                  onClick={() => onRestore(file.id)}
                  style={styles.actionButton}
                >
                  <RotateCcw size={18} />
                  <span>Restore</span>
                </button>
                
                <button 
                  onClick={() => onDelete(file.id)}
                  style={{...styles.actionButton, ...styles.deleteButton}}
                >
                  <Trash2 size={18} />
                  <span>Delete Forever</span>
                </button>
              </>
            ) : (
              <>
                

                <button 
                  onClick={() => onDownload(file.id, file.originalName)}
                  style={styles.actionButton}
                >
                  <Download size={18} />
                  <span>Download</span>
                </button>
                
                <button 
                  onClick={() => onDelete(file.id)}
                  style={{...styles.actionButton, ...styles.deleteButton}}
                >
                  <Trash2 size={18} />
                  <span>Move to Bin</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '450px',
    height: '100vh',
    background: 'white',
    boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
    zIndex: 1000,
    overflowY: 'auto'
  },
  closeButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: '#f0f0f0',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    transition: 'background 0.2s',
    zIndex: 10,
    color: '#333'
  },
  content: {
    padding: '20px'
  },
  previewSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
    background: '#f8f9fa',
    borderRadius: '12px',
    marginBottom: '24px',
    minHeight: '200px'
  },
  imagePreview: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  },
  detailsSection: {
    marginBottom: '24px'
  },
  fileNameRow: {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '16px'
},
fileName: {
  fontSize: '20px',
  fontWeight: '600',
  color: '#333',
  wordBreak: 'break-word',
  margin: 0,
  flex: 1
},
starIconButton: {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center'
},
  metaInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  metaItem: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: '12px',
    borderBottom: '1px solid #f0f0f0'
  },
  metaLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  },
  metaValue: {
    fontSize: '14px',
    color: '#333',
    fontWeight: '400'
  },
  tagsSection: {
    marginBottom: '24px',
    padding: '20px',
    background: '#f8f9ff',
    borderRadius: '12px'
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#667eea',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '12px'
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  tag: {
    padding: '6px 14px',
    background: 'white',
    border: '1.5px solid #667eea',
    color: '#667eea',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '500'
  },
  descriptionSection: {
    marginBottom: '24px',
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '12px'
  },
  description: {
    fontSize: '14px',
    color: '#555',
    lineHeight: '1.6',
    margin: 0
  },
  actionsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '32px'
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  starButton: {
    background: '#fff3cd',
    color: '#856404',
    border: '1px solid #ffc107'
  },
  deleteButton: {
    background: '#dc3545'
  }
};

export default FileDetail;