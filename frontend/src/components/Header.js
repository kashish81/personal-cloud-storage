import React, { useState } from 'react';
import { Search, LogOut, Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Header = ({ onSearch, isMobile, onMenuClick }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Real-time search
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  const dynamicStyles = {
    header: {
      height: '64px',
      borderBottom: `1px solid ${theme.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      background: theme.bgSecondary,
      position: 'fixed',
      top: 0,
      right: 0,
      zIndex: 100,
      transition: 'all 0.3s ease',
      gap: '16px',
      left: isMobile ? 0 : '280px'
    },
    hamburgerButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '8px',
      color: theme.textSecondary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'color 0.3s ease'
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
      color: theme.textSecondary,
      transition: 'color 0.3s ease',
      pointerEvents: 'none'
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px 12px 48px',
      paddingRight: searchQuery ? '48px' : '16px',
      background: theme.hover,
      border: `1px solid ${theme.border}`,
      borderRadius: '20px',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.3s ease',
      color: theme.text
    },
    clearButton: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '6px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.textSecondary,
      transition: 'all 0.2s ease',
      opacity: searchQuery ? 1 : 0,
      visibility: searchQuery ? 'visible' : 'hidden'
    },
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      position: 'relative'
    },
    themeButton: {
      background: theme.hover,
      border: `1px solid ${theme.border}`,
      padding: '8px 16px',
      borderRadius: '20px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: theme.text,
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    userButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
      padding: '8px 12px',
      borderRadius: '24px',
      transition: 'background 0.2s ease',
      backgroundColor: theme.hover
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
      color: theme.text,
      transition: 'color 0.3s ease'
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: '8px',
      background: theme.bgSecondary,
      borderRadius: '8px',
      boxShadow: `0 2px 10px rgba(0,0,0,${isDark ? 0.3 : 0.15})`,
      minWidth: '280px',
      padding: '16px',
      zIndex: 1000,
      border: `1px solid ${theme.border}`,
      transition: 'all 0.3s ease'
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
      color: theme.text,
      transition: 'color 0.3s ease'
    },
    dropdownEmail: {
      margin: 0,
      fontSize: '12px',
      color: theme.textSecondary,
      transition: 'color 0.3s ease'
    },
    divider: {
      height: '1px',
      background: theme.border,
      margin: '12px 0',
      transition: 'background 0.3s ease'
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
      color: theme.textSecondary,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'left'
    }
  };

  return (
    <div style={dynamicStyles.header}>
      {isMobile && (
        <button onClick={onMenuClick} style={dynamicStyles.hamburgerButton}>
          <Menu size={24} />
        </button>
      )}

      <form onSubmit={handleSearch} style={dynamicStyles.searchForm}>
        <Search size={20} style={dynamicStyles.searchIcon} />
        <input
          type="text"
          placeholder="Search in files"
          value={searchQuery}
          onChange={handleSearchChange}
          style={dynamicStyles.searchInput}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            style={dynamicStyles.clearButton}
            title="Clear search"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.hover;
              e.currentTarget.style.color = theme.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = theme.textSecondary;
            }}
          >
            <X size={18} />
          </button>
        )}
      </form>

      <div style={dynamicStyles.userSection}>
        <button
          onClick={toggleTheme}
          style={dynamicStyles.themeButton}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          {!isMobile && (isDark ? 'Light' : 'Dark')}
        </button>

        <div
          style={dynamicStyles.userButton}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div style={dynamicStyles.avatar}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          {!isMobile && (
            <span style={dynamicStyles.username}>{user.username}</span>
          )}
        </div>

        {showDropdown && (
          <div style={dynamicStyles.dropdown}>
            <div style={dynamicStyles.dropdownHeader}>
              <div style={dynamicStyles.avatarLarge}>
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={dynamicStyles.dropdownName}>{user.username}</p>
                <p style={dynamicStyles.dropdownEmail}>{user.email}</p>
              </div>
            </div>
            
            <div style={dynamicStyles.divider}></div>
            
            <button
              onClick={() => {
                logout();
                setShowDropdown(false);
              }}
              style={dynamicStyles.logoutButton}
              onMouseEnter={(e) => e.currentTarget.style.background = theme.hover}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
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

export default Header;