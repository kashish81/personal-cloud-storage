import React, { useState, useRef, useEffect } from 'react';

const API_BASE_URL = 'https://personal-cloud-storage.onrender.com/api';

function App() {
  const [files, setFiles] = useState([]);
  const [serverStatus, setServerStatus] = useState('checking');
  const fileInputRef = useRef();

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/files`);
      const data = await response.json();
      setFiles(data.files || []);
      setServerStatus('connected');
    } catch (error) {
      setServerStatus('error');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        loadFiles();
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
    
    event.target.value = '';
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>AI Cloud Storage</h1>
      
      <div style={{ 
        padding: '10px', 
        backgroundColor: serverStatus === 'connected' ? '#d4edda' : '#f8d7da',
        marginBottom: '20px',
        borderRadius: '5px'
      }}>
        Status: {serverStatus === 'connected' ? 'Connected to backend' : 'Connection failed'}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        style={{ marginBottom: '20px' }}
      />

      <div>
        <h2>Files ({files.length})</h2>
        {files.map(file => (
          <div key={file.id} style={{ 
            border: '1px solid #ccc', 
            padding: '10px', 
            marginBottom: '10px',
            borderRadius: '5px'
          }}>
            <strong>{file.name}</strong>
            <br />
            Size: {Math.round(file.size / 1024)} KB
            {file.aiTags && (
              <div>Tags: {file.aiTags.join(', ')}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;