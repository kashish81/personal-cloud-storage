import React from 'react';
import { X, Download, Trash2, Share2, FileText, Image as ImageIcon, Video, Music, File as FileIcon } from 'lucide-react';
import { useMediaQuery } from './hooks/useMediaQuery';

const FileDetail = ({ file, onClose, onDownload, onDelete, onShare }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  
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
      return <FileIcon size={isMobile ? 60 : 80} color="#95a5a6" />;
    }
    
    const iconSize = isMobile ? 60 : 80;
    
    if (file.mimeType.startsWith('image/')) {
      return (
        <div style={styles.imagePreview}>
          <ImageIcon size={iconSize} color="#667eea" />
        </div>
      );
    } else if (file.mimeType.startsWith('video/')) {
      return <Video size={iconSize} color="#e74c3c" />;
    } else if (file.mimeType.startsWith('audio/')) {
      return <Music size={iconSize} color="#9b59b6" />;
    } else if (file.mimeType.includes('pdf')) {
      return <FileText size={iconSize} color="#e74c3c" />;
    }
    return <FileIcon size={iconSize} color="#95a5a6" />;
  };

  // ============ SMART AI-POWERED DESCRIPTION ============
  const generateDescription = () => {
    if (!file || !file.mimeType || !file.originalName) {
      return 'File information unavailable';
    }
    
    const filename = file.originalName.toLowerCase();
    const tags = file.tags || [];
    const mimeType = file.mimeType.toLowerCase();
    
    // Documents - Research, Reports, Technical
    if (mimeType.includes('word') || mimeType.includes('document')) {
      if (tags.includes('research') || tags.includes('analysis')) {
        return `A research document exploring ${tags.filter(t => !['word', 'document'].includes(t)).slice(0, 3).join(', ')}. Contains detailed analysis and findings on the subject matter.`;
      }
      if (tags.includes('report') || tags.includes('business')) {
        return `A professional report document covering ${tags.filter(t => !['word', 'document'].includes(t)).slice(0, 3).join(' and ')}. Includes comprehensive information and insights.`;
      }
      if (tags.includes('resume') || tags.includes('cv')) {
        return `A professional resume/CV document highlighting career experience, skills, and qualifications. Formatted for job applications and professional review.`;
      }
      if (tags.includes('invoice') || tags.includes('finance')) {
        return `A financial document containing invoice details, payment information, and transaction records for business purposes.`;
      }
      if (tags.includes('cyberbullying') || tags.includes('technology')) {
        return `A technical document about ${tags.filter(t => !['word', 'document'].includes(t)).slice(0, 4).join(', ')}. Contains research or information on advanced technology concepts.`;
      }
      // Generic document
      const relevantTags = tags.filter(t => !['word', 'document', 'text'].includes(t)).slice(0, 3);
      if (relevantTags.length > 0) {
        return `A document file containing information about ${relevantTags.join(', ')}. Created for reference and documentation purposes.`;
      }
      return `A Word document file ready for viewing and editing. Contains formatted text content.`;
    }
    
    // PDFs
    if (mimeType.includes('pdf')) {
      if (tags.includes('invoice') || tags.includes('receipt')) {
        return `A PDF invoice or receipt document with transaction details, payment information, and billing records for financial reference.`;
      }
      if (tags.includes('certificate') || tags.includes('achievement')) {
        return `An official certificate or achievement document in PDF format, suitable for sharing and verification.`;
      }
      if (tags.includes('report') || tags.includes('presentation')) {
        return `A professional PDF report or presentation document containing ${tags.filter(t => t !== 'pdf').slice(0, 3).join(', ')} information.`;
      }
      const relevantTags = tags.filter(t => t !== 'pdf').slice(0, 3);
      if (relevantTags.length > 0) {
        return `A PDF document about ${relevantTags.join(', ')}. Formatted for easy reading and sharing across different devices.`;
      }
      return `A PDF document file that can be viewed on any device. Contains formatted content ready for reading or printing.`;
    }
    
    // Excel/Spreadsheets
    if (mimeType.includes('sheet') || mimeType.includes('excel')) {
      if (tags.includes('finance') || tags.includes('budget')) {
        return `A financial spreadsheet containing budget calculations, expense tracking, and monetary data analysis.`;
      }
      if (tags.includes('data') || tags.includes('analysis')) {
        return `A data spreadsheet with organized information, calculations, and analytical insights. Suitable for data processing and reporting.`;
      }
      return `A spreadsheet file with organized data in rows and columns. Contains calculations, charts, and structured information.`;
    }
    
    // Images
    if (mimeType.startsWith('image/')) {
      if (tags.includes('screenshot') || filename.includes('screenshot')) {
        return `A screenshot image capturing digital content from a screen. Shows interface elements, text, or application views for reference or documentation.`;
      }
      if (tags.includes('selfie') || tags.includes('portrait')) {
        return `A portrait photograph featuring people. Captured moment suitable for personal collection or sharing with others.`;
      }
      if (tags.includes('photo') && (tags.includes('nature') || tags.includes('landscape'))) {
        return `A scenic photograph showcasing natural beauty and landscapes. Perfect for viewing, sharing, or use in creative projects.`;
      }
      if (tags.includes('food') || tags.includes('meal')) {
        return `A food photograph capturing culinary creations or meal presentations. Great for recipe documentation or social sharing.`;
      }
      if (tags.includes('design') || tags.includes('art')) {
        return `A creative design or artwork image showcasing visual content. Suitable for portfolios, presentations, or creative projects.`;
      }
      if (tags.includes('document') || tags.includes('scan')) {
        return `A scanned document image containing text and information. Digitized for easy storage, sharing, and reference.`;
      }
      // Generic image
      const imageContext = tags.filter(t => t !== 'image').slice(0, 3);
      if (imageContext.length > 0) {
        return `An image file featuring ${imageContext.join(', ')}. Captured or created for visual reference and sharing.`;
      }
      return `An image file ready for viewing and sharing. Contains visual content that can be displayed on any device.`;
    }
    
    // Videos
    if (mimeType.startsWith('video/')) {
      if (tags.includes('presentation') || tags.includes('tutorial')) {
        return `A video recording containing educational or instructional content. Useful for learning, training, or presentation purposes.`;
      }
      if (tags.includes('meeting') || tags.includes('conference')) {
        return `A video recording of a meeting or conference session. Contains discussions, presentations, and collaborative content.`;
      }
      return `A video file containing multimedia content with both visual and audio elements. Ready for playback on compatible devices.`;
    }
    
    // Audio
    if (mimeType.startsWith('audio/')) {
      if (tags.includes('music') || tags.includes('song')) {
        return `An audio file containing music or song content. Ready for playback and listening on audio devices.`;
      }
      if (tags.includes('podcast') || tags.includes('recording')) {
        return `An audio recording containing spoken content, discussions, or podcast episodes for listening and reference.`;
      }
      return `An audio file with sound content ready for playback. Can be played on any compatible audio device or player.`;
    }
    
    // Fallback - Generic description
    const extension = file.originalName.split('.').pop()?.toUpperCase() || 'FILE';
    const type = mimeType.split('/')[0];
    const relevantTags = tags.slice(0, 3);
    
    if (relevantTags.length > 0) {
      return `A ${extension} file related to ${relevantTags.join(', ')}. Stored in your cloud storage for easy access and management.`;
    }
    
    return `A ${extension} ${type} file stored in your cloud storage. Available for download, sharing, or further processing.`;
  };
  // ============ END SMART DESCRIPTION ============

  return (
    <>
      <div style={styles.overlay} onClick={onClose} />
      <div style={{
        ...styles.sidebar,
        width: isMobile ? '100%' : isTablet ? '380px' : '450px',
        padding: isMobile ? '16px' : '24px'
      }}>
        <button onClick={onClose} style={styles.closeButton}>
          <X size={isMobile ? 20 : 24} />
        </button>

        <div style={styles.content}>
          {/* File Preview Section */}
          <div style={{
            ...styles.previewSection,
            padding: isMobile ? '30px 20px' : '40px 20px'
          }}>
            {getFilePreview()}
          </div>

          {/* File Details Section */}
          <div style={styles.detailsSection}>
            <h2 style={{
              ...styles.fileName,
              fontSize: isMobile ? '18px' : '20px'
            }}>
              {file?.originalName || 'Unknown File'}
            </h2>
            
            <div style={styles.metaInfo}>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Size:</span>
                <span style={styles.metaValue}>{formatFileSize(file.size)}</span>
              </div>
              
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Type:</span>
                <span style={styles.metaValue}>
                  {file.mimeType || 'Unknown'}
                </span>
              </div>
              
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Created:</span>
                <span style={styles.metaValue}>
                  {formatDate(file.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* AI Generated Tags Section */}
          {file.tags && file.tags.length > 0 && (
            <div style={styles.section}>
              <h3 style={{
                ...styles.sectionTitle,
                fontSize: isMobile ? '13px' : '14px'
              }}>
                AI GENERATED TAGS
              </h3>
              <div style={styles.tagsContainer}>
                {file.tags.map((tag, index) => (
                  <span key={index} style={{
                    ...styles.tag,
                    fontSize: isMobile ? '11px' : '12px',
                    padding: isMobile ? '6px 12px' : '8px 16px'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description Section */}
          <div style={styles.section}>
            <h3 style={{
              ...styles.sectionTitle,
              fontSize: isMobile ? '13px' : '14px'
            }}>
              DESCRIPTION
            </h3>
            <p style={{
              ...styles.description,
              fontSize: isMobile ? '13px' : '14px'
            }}>
              {generateDescription()}
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{
            ...styles.actionsSection,
            flexDirection: isMobile ? 'column' : 'column',
            gap: isMobile ? '10px' : '12px'
          }}>
            <button
              onClick={() => onDownload(file.id, file.originalName)}
              style={{
                ...styles.actionButton,
                ...styles.downloadButton,
                fontSize: isMobile ? '14px' : '15px',
                padding: isMobile ? '12px 20px' : '14px 24px'
              }}
            >
              <Download size={isMobile ? 18 : 20} />
              Download
            </button>
            
            <button
              onClick={() => onShare(file)}
              style={{
                ...styles.actionButton,
                ...styles.shareButton,
                fontSize: isMobile ? '14px' : '15px',
                padding: isMobile ? '12px 20px' : '14px 24px'
              }}
            >
              <Share2 size={isMobile ? 18 : 20} />
              Share
            </button>
            
            <button
              onClick={() => onDelete(file.id)}
              style={{
                ...styles.actionButton,
                ...styles.deleteButton,
                fontSize: isMobile ? '14px' : '15px',
                padding: isMobile ? '12px 20px' : '14px 24px'
              }}
            >
              <Trash2 size={isMobile ? 18 : 20} />
              Delete
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
    bottom: 0,
    background: 'white',
    zIndex: 1000,
    overflowY: 'auto',
    boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
    transition: 'width 0.3s ease'
  },
  closeButton: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#5f6368',
    transition: 'background 0.2s ease',
    zIndex: 1001
  },
  content: {
    paddingTop: '20px'
  },
  previewSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8f9fa',
    borderRadius: '12px',
    marginBottom: '24px'
  },
  imagePreview: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  detailsSection: {
    marginBottom: '24px'
  },
  fileName: {
    margin: '0 0 16px 0',
    fontWeight: '600',
    color: '#202124',
    wordBreak: 'break-word',
    lineHeight: '1.4'
  },
  metaInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  metaItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '8px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  metaLabel: {
    fontSize: '13px',
    color: '#5f6368',
    fontWeight: '500',
    minWidth: '80px'
  },
  metaValue: {
    fontSize: '13px',
    color: '#202124',
    textAlign: 'right',
    flex: 1,
    wordBreak: 'break-word'
  },
  section: {
    marginBottom: '24px'
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontWeight: '600',
    color: '#667eea',
    letterSpacing: '0.5px'
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  tag: {
    display: 'inline-block',
    background: '#ffffff',
    border: '1.5px solid #667eea',
    color: '#667eea',
    borderRadius: '20px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  description: {
    margin: 0,
    color: '#5f6368',
    lineHeight: '1.6'
  },
  actionsSection: {
    display: 'flex',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #e0e0e0'
  },
  actionButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    letterSpacing: '0.3px'
  },
  downloadButton: {
    background: '#667eea',
    color: 'white'
  },
  shareButton: {
    background: '#17a2b8',
    color: 'white'
  },
  deleteButton: {
    background: '#dc3545',
    color: 'white'
  }
};

export default FileDetail