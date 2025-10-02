import React, { useState, useEffect } from 'react';
import { User, Lock, BarChart3, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Settings = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState(null);
  const { user, token } = useAuth();

  const [profileData, setProfileData] = useState({
    username: user.username
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (activeTab === 'stats') {
      fetchStats();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleUsernameUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/update-username', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: profileData.username })
      });

      const data = await response.json();
      setMessage(data.message);
      
      if (data.success) {
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordData)
      });

      const data = await response.json();
      setMessage(data.message);
      
      if (data.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatStorage = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Account Settings</h2>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={24} />
          </button>
        </div>

        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              ...styles.tab,
              ...(activeTab === 'profile' ? styles.activeTab : {})
            }}
          >
            <User size={18} />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            style={{
              ...styles.tab,
              ...(activeTab === 'password' ? styles.activeTab : {})
            }}
          >
            <Lock size={18} />
            Password
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            style={{
              ...styles.tab,
              ...(activeTab === 'stats' ? styles.activeTab : {})
            }}
          >
            <BarChart3 size={18} />
            Statistics
          </button>
        </div>

        <div style={styles.content}>
          {message && (
            <div style={{
              ...styles.message,
              ...(message.includes('success') ? styles.success : styles.error)
            }}>
              {message}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUsernameUpdate} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  style={styles.inputDisabled}
                />
                <span style={styles.hint}>Email cannot be changed</span>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Username</label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ username: e.target.value })}
                  style={styles.input}
                  minLength={3}
                  required
                />
              </div>

              <button
                type="submit"
                style={styles.submitBtn}
                disabled={loading || profileData.username === user.username}
              >
                {loading ? 'Updating...' : 'Update Username'}
              </button>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value
                  })}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value
                  })}
                  style={styles.input}
                  minLength={6}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value
                  })}
                  style={styles.input}
                  minLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                style={styles.submitBtn}
                disabled={loading}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div style={styles.statsContainer}>
              {stats ? (
                <>
                  <div style={styles.statCard}>
                    <h3 style={styles.statTitle}>Total Files</h3>
                    <p style={styles.statValue}>{stats.totalFiles}</p>
                  </div>

                  <div style={styles.statCard}>
                    <h3 style={styles.statTitle}>Storage Used</h3>
                    <p style={styles.statValue}>{formatStorage(stats.storageUsed)}</p>
                    <p style={styles.statSubtext}>
                      of {formatStorage(stats.storageLimit)}
                    </p>
                  </div>

                  <div style={styles.statCard}>
                    <h3 style={styles.statTitle}>Account Created</h3>
                    <p style={styles.statValue}>{formatDate(stats.accountCreated)}</p>
                  </div>
                </>
              ) : (
                <p>Loading statistics...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
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
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 30px',
    borderBottom: '1px solid #e0e0e0'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
    color: '#333'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '5px',
    color: '#666'
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #e0e0e0'
  },
  tab: {
    flex: 1,
    padding: '15px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    borderBottom: '3px solid transparent',
    transition: 'all 0.3s ease'
  },
  activeTab: {
    color: '#667eea',
    borderBottomColor: '#667eea'
  },
  content: {
    padding: '30px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333'
  },
  input: {
    padding: '12px 16px',
    border: '2px solid #f0f0f0',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.3s ease'
  },
  inputDisabled: {
    padding: '12px 16px',
    border: '2px solid #f0f0f0',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#f8f8f8',
    color: '#999',
    cursor: 'not-allowed'
  },
  hint: {
    fontSize: '12px',
    color: '#999'
  },
  submitBtn: {
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px'
  },
  message: {
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px'
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
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px'
  },
  statCard: {
    padding: '20px',
    background: '#f8f9ff',
    borderRadius: '12px',
    border: '1px solid #e0e0e0'
  },
  statTitle: {
    margin: '0 0 10px 0',
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  },
  statValue: {
    margin: '0 0 5px 0',
    fontSize: '28px',
    fontWeight: '700',
    color: '#667eea'
  },
  statSubtext: {
    margin: 0,
    fontSize: '12px',
    color: '#999'
  }
};

export default Settings;