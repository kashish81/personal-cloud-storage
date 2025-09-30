import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const formatStorage = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const storagePercentage = (user.storageUsed / user.storageLimit) * 100;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="user-info">
          <div className="user-avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <h3>{user.username}</h3>
            <p>{user.email}</p>
          </div>
        </div>

        <div className="storage-info">
          <span className="storage-text">
            {formatStorage(user.storageUsed)} / {formatStorage(user.storageLimit)}
          </span>
          <div className="storage-bar">
            <div 
              className="storage-progress"
              style={{ width: `${storagePercentage}%` }}
            />
          </div>
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <h1>Welcome to Your Cloud Storage, {user.username}! 🎉</h1>
        <p>Your authentication is working perfectly.</p>
        <p>Your files will appear here once you add the file upload feature.</p>
      </div>
    </div>
  );
};

export default Dashboard;