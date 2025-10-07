import React from 'react';
import { X, Download, Trash2, Share2, FileText, Image as ImageIcon, Video, Music, File as FileIcon } from 'lucide-react';

const FileDetail = ({ file, onClose, onDownload, onDelete, onShare }) => {
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
          <div style={styles.previewSection}>
            {getFilePreview()}
          </div>

          <div style={styles.detailsSection}>
            <h2 style={styles.fileName}>{file?.originalName || 'Unknown File'}</h2>
            
            <div style={styles.metaInfo}>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Size:</span>
                <span style={styles.metaValue}>{file?.size ? formatFileSize(file.size) : 'Unknown'}</span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Type:</span>
                <span style={styles.metaValue}>{file?.mimeType || 'Unknown'}</span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Created:</span>
                <span style={styles.metaValue}>{file?.createdAt ? formatDate(file.createdAt) : 'Unknown'}</span>
              </div>
            </div>
          </div>

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

          <div style={styles.descriptionSection}>
            <h3 style={styles.sectionTitle}>Description</h3>
            <p style={styles.description}>{generateDescription()}</p>
          </div>

          <div style={styles.actionsSection}>
            <button 
              onClick={() => onDownload(file.id, file.originalName)}
              style={styles.actionButton}
            >
              <Download size={18} />
              <span>Download</span>
            </button>
            
            <button 
              onClick={() => onShare(file)}
              style={{...styles.actionButton, ...styles.shareButton}}
            >
              <Share2 size={18} />
              <span>Share</span>
            </button>
            
            <button 
              onClick={() => {
                onDelete(file.id);
                onClose();
              }}
              style={{...styles.actionButton, ...styles.deleteButton}}
            >
              <Trash2 size={18} />
              <span>Delete</span>
            </button>
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
    maxWidth: '100vw',
    height: '100vh',
    background: 'white',
    boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
    zIndex: 1000,
    overflowY: 'auto'
  },

  actionsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '32px'
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
  fileName: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '16px',
    wordBreak: 'break-word'
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
  shareButton: {
    background: '#3498db'
  },
  deleteButton: {
    background: '#dc3545'
  }
};

export default FileDetail;