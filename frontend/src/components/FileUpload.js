import React, { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FileUpload = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const { token } = useAuth();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        setMessage('File size must be less than 100MB');
        return;
      }
      setSelectedFile(file);
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file');
      return;
    }

    setUploading(true);
    setProgress(0);
    setMessage('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const xhr = new XMLHttpRequest();

      // Progress tracking
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(Math.round(percentComplete));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setMessage('File uploaded successfully!');
          setSelectedFile(null);
          setProgress(0);
          if (onUploadSuccess) onUploadSuccess();
        } else {
          const error = JSON.parse(xhr.responseText);
          setMessage(error.message || 'Upload failed');
        }
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        setMessage('Upload failed. Please try again.');
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

  return (
    <div style={styles.container}>
      <div style={styles.uploadBox}>
        <input
          type="file"
          onChange={handleFileSelect}
          style={styles.fileInput}
          id="file-input"
          disabled={uploading}
        />
        
        <label htmlFor="file-input" style={styles.uploadLabel}>
          <Upload size={40} style={styles.uploadIcon} />
          <p style={styles.uploadText}>Click to upload or drag and drop</p>
          <p style={styles.uploadSubtext}>Maximum file size: 100MB</p>
        </label>
      </div>

      {selectedFile && (
        <div style={styles.fileInfo}>
          <div style={styles.fileName}>
            <span>{selectedFile.name}</span>
            <span style={styles.fileSize}>{formatFileSize(selectedFile.size)}</span>
          </div>
          
          {!uploading && (
            <button
              onClick={() => setSelectedFile(null)}
              style={styles.clearButton}
            >
              <X size={20} />
            </button>
          )}
        </div>
      )}

      {uploading && (
        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
          <span style={styles.progressText}>{progress}%</span>
        </div>
      )}

      {message && (
        <div style={{
          ...styles.message,
          ...(message.includes('success') ? styles.success : styles.error)
        }}>
          {message.includes('success') ? (
            <CheckCircle size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{message}</span>
        </div>
      )}

      {selectedFile && !uploading && (
        <button
          onClick={handleUpload}
          style={styles.uploadButton}
        >
          Upload File
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto'
  },
  uploadBox: {
    border: '2px dashed #667eea',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    background: '#f8f9ff',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  fileInput: {
    display: 'none'
  },
  uploadLabel: {
    cursor: 'pointer',
    display: 'block'
  },
  uploadIcon: {
    color: '#667eea',
    margin: '0 auto 20px'
  },
  uploadText: {
    color: '#333',
    fontSize: '16px',
    fontWeight: '500',
    margin: '0 0 8px 0'
  },
  uploadSubtext: {
    color: '#666',
    fontSize: '14px',
    margin: 0
  },
  fileInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    background: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    marginTop: '20px'
  },
  fileName: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  fileSize: {
    fontSize: '12px',
    color: '#666'
  },
  clearButton: {
    background: 'none',
    border: 'none',
    color: '#dc3545',
    cursor: 'pointer',
    padding: '5px'
  },
  progressContainer: {
    marginTop: '20px'
  },
  progressBar: {
    width: '100%',
    height: '8px',
    background: '#f0f0f0',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    transition: 'width 0.3s ease'
  },
  progressText: {
    display: 'block',
    textAlign: 'center',
    marginTop: '8px',
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  },
  message: {
    padding: '12px 16px',
    borderRadius: '8px',
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px'
  },
  success: {
    background: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb'
  },
  error: {
    background: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb'
  },
  uploadButton: {
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'transform 0.2s ease'
  }
};

export default FileUpload;