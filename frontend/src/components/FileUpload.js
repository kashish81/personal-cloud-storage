import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, File, Loader } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const FileUpload = ({ onUploadSuccess }) => {
  const { theme, isDark } = useTheme();
  const { token } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Prevent default drag behaviors on entire document
  React.useEffect(() => {
    const preventDefaults = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      document.addEventListener(eventName, preventDefaults, false);
    });

    return () => {
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.removeEventListener(eventName, preventDefaults, false);
      });
    };
  }, []);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setMessage('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setMessage('');
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploading(true);
    setUploadProgress(0);
    setMessage('');

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
          setMessage('File uploaded successfully!');
          setSelectedFile(null);
          setUploadProgress(0);
          
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }

          setTimeout(() => {
            if (onUploadSuccess) {
              onUploadSuccess();
            }
          }, 1000);
        } else {
          const response = JSON.parse(xhr.responseText);
          setMessage(response.message || 'Upload failed');
        }
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        setMessage('Network error. Please try again.');
        setUploading(false);
      });

      xhr.open('POST', 'http://localhost:5000/api/files/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Upload failed. Please try again.');
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const dynamicStyles = {
    container: {
      padding: '24px'
    },
    dropZone: {
      border: `2px dashed ${isDragging ? theme.primary : theme.border}`,
      borderRadius: '16px',
      padding: '48px 24px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      background: isDragging 
        ? (isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)')
        : (isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8f9fa'),
      position: 'relative',
      overflow: 'hidden'
    },
    uploadIcon: {
      margin: '0 auto 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: isDark 
        ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)'
        : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
      border: `2px solid ${theme.primary}`,
      transition: 'all 0.3s ease'
    },
    dropText: {
      fontSize: '16px',
      fontWeight: '500',
      color: theme.text,
      marginBottom: '8px',
      transition: 'color 0.3s ease'
    },
    dropSubtext: {
      fontSize: '13px',
      color: theme.textSecondary,
      marginBottom: '16px',
      transition: 'color 0.3s ease'
    },
    browseButton: {
      display: 'inline-block',
      padding: '10px 24px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: 'none',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
    },
    selectedFileCard: {
      marginTop: '24px',
      padding: '20px',
      background: theme.bgSecondary,
      border: `1px solid ${theme.border}`,
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      transition: 'all 0.3s ease'
    },
    fileIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '10px',
      background: isDark 
        ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)'
        : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    fileInfo: {
      flex: 1,
      minWidth: 0
    },
    fileName: {
      fontSize: '14px',
      fontWeight: '600',
      color: theme.text,
      marginBottom: '4px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      transition: 'color 0.3s ease'
    },
    fileSize: {
      fontSize: '12px',
      color: theme.textSecondary,
      transition: 'color 0.3s ease'
    },
    removeButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.textSecondary,
      transition: 'all 0.3s ease'
    },
    progressSection: {
      marginTop: '24px'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      background: theme.hover,
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '12px'
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '4px',
      transition: 'width 0.3s ease',
      width: `${uploadProgress}%`
    },
    progressText: {
      fontSize: '13px',
      color: theme.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
      transition: 'color 0.3s ease'
    },
    message: {
      marginTop: '16px',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      animation: 'slideDown 0.3s ease-out'
    },
    messageSuccess: {
      background: isDark ? 'rgba(74, 222, 128, 0.15)' : '#d4edda',
      color: isDark ? '#86efac' : '#155724',
      border: `1px solid ${isDark ? 'rgba(74, 222, 128, 0.3)' : '#c3e6cb'}`
    },
    messageError: {
      background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#f8d7da',
      color: isDark ? '#fca5a5' : '#721c24',
      border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : '#f5c6cb'}`
    },
    uploadButton: {
      marginTop: '20px',
      width: '100%',
      padding: '14px 24px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
    },
    uploadButtonDisabled: {
      background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
      cursor: 'not-allowed',
      boxShadow: 'none'
    }
  };

  return (
    <div style={dynamicStyles.container}>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        id="file-input"
      />

      <div
        style={dynamicStyles.dropZone}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
      >
        <div style={{
          ...dynamicStyles.uploadIcon,
          transform: isDragging ? 'scale(1.1)' : 'scale(1)'
        }}>
          <Upload size={36} color={theme.primary} />
        </div>

        <p style={dynamicStyles.dropText}>
          {isDragging ? 'Drop file here' : 'Click to upload or drag and drop'}
        </p>
        <p style={dynamicStyles.dropSubtext}>
          Maximum file size: 10MB
        </p>

        {!selectedFile && (
          <label
            htmlFor="file-input"
            style={dynamicStyles.browseButton}
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
            }}
          >
            Browse Files
          </label>
        )}
      </div>

      {selectedFile && !uploading && (
        <div style={dynamicStyles.selectedFileCard}>
          <div style={dynamicStyles.fileIcon}>
            <File size={24} color={theme.primary} />
          </div>
          <div style={dynamicStyles.fileInfo}>
            <div style={dynamicStyles.fileName}>{selectedFile.name}</div>
            <div style={dynamicStyles.fileSize}>{formatFileSize(selectedFile.size)}</div>
          </div>
          <button
            onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            style={dynamicStyles.removeButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.hover;
              e.currentTarget.style.color = '#dc3545';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = theme.textSecondary;
            }}
          >
            <X size={20} />
          </button>
        </div>
      )}

      {uploading && (
        <div style={dynamicStyles.progressSection}>
          <div style={dynamicStyles.progressBar}>
            <div style={dynamicStyles.progressFill} />
          </div>
          <p style={dynamicStyles.progressText}>
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {message && (
        <div style={{
          ...dynamicStyles.message,
          ...(message.includes('success') ? dynamicStyles.messageSuccess : dynamicStyles.messageError)
        }}>
          {message.includes('success') ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {message}
        </div>
      )}

      {selectedFile && !uploading && (
        <button
          onClick={handleUpload}
          style={dynamicStyles.uploadButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
          }}
        >
          <Upload size={20} />
          Upload File
        </button>
      )}

      {uploading && (
        <button
          disabled
          style={{
            ...dynamicStyles.uploadButton,
            ...dynamicStyles.uploadButtonDisabled
          }}
        >
          <Loader size={20} className="spin" />
          Uploading...
        </button>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FileUpload;