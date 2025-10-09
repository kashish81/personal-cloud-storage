import React, { useState } from 'react';
import { Search, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ onSearch, isMobile, onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <div style={{
      ...styles.header,
      left: isMobile ? 0 : '280px'
    }}>
      {/* Hamburger Menu for Mobile */}
      {isMobile && (
        <button onClick={onMenuClick} style={styles.hamburgerButton}>
          <Menu size={24} />
        </button>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={styles.searchForm}>
        <Search size={20} style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search in files"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </form>

      {/* User Menu */}
      <div style={styles.userSection}>
        <div
          style={styles.userButton}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div style={styles.avatar}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          {!isMobile && (
            <span style={styles.username}>{user.username}</span>
          )}
        </div>

        {showDropdown && (
          <div style={styles.dropdown}>
            <div style={styles.dropdownHeader}>
              <div style={styles.avatarLarge}>
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={styles.dropdownName}>{user.username}</p>
                <p style={styles.dropdownEmail}>{user.email}</p>
              </div>
            </div>
            
            <div style={styles.divider}></div>
            
            <button
              onClick={() => {
                logout();
                setShowDropdown(false);
              }}
              style={styles.logoutButton}
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  header: {
    height: '64px',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    background: 'white',
    position: 'fixed',
    top: 0,
    right: 0,
    zIndex: 100,
    transition: 'left 0.3s ease',
    gap: '16px'
  },
  hamburgerButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    color: '#5f6368',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchForm: {
    position: 'relative',
    flex: '1 1 0%',
    maxWidth: '720px'
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#5f6368'
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 48px',
    background: 'rgb(241, 243, 244)',
    border: 'none',
    borderRadius: '20px',
    fontSize: '14px',
    outline: 'none',
    transition: 'background 0.2s'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    position: 'relative'
  },
  userButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    padding: '8px 12px',
    borderRadius: '24px',
    transition: 'background 0.2s ease'
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600'
  },
  username: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#202124'
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
    minWidth: '280px',
    padding: '16px',
    zIndex: 1000
  },
  dropdownHeader: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '16px'
  },
  avatarLarge: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '20px',
    fontWeight: '600'
  },
  dropdownName: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#202124'
  },
  dropdownEmail: {
    margin: 0,
    fontSize: '12px',
    color: '#5f6368'
  },
  divider: {
    height: '1px',
    background: '#e0e0e0',
    margin: '12px 0'
  },
  logoutButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    background: 'none',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#5f6368',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    textAlign: 'left'
  }
};

export default Header;