import React from 'react';

const HeroBanner = () => {
  return (
    <div style={styles.banner}>
      <div style={styles.content}>
        <h1 style={styles.title}>Cloud Storage Solution</h1>
        <p style={styles.subtitle}>
          Object storage for companies of all sizes. Secure, durable, and with<br />
          low latency. Store any amount of data.
        </p>
        <button style={styles.upgradeButton}>
          Upgrade Storage
        </button>
      </div>
      
      <div style={styles.illustration}>
        <div style={styles.rocket}>🚀</div>
      </div>
    </div>
  );
};

const styles = {
  banner: {
    background: 'linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 100%)',
    borderRadius: '20px',
    padding: '40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    position: 'relative',
    overflow: 'hidden'
  },
  content: {
    flex: 1,
    zIndex: 2
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1F2937',
    margin: '0 0 12px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '0 0 24px 0',
    lineHeight: '1.6'
  },
  upgradeButton: {
    padding: '12px 32px',
    background: '#1F2937',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s ease'
  },
  illustration: {
    position: 'relative',
    width: '200px',
    height: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rocket: {
    fontSize: '120px',
    animation: 'float 3s ease-in-out infinite'
  }
};

// Add CSS animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
`;
document.head.appendChild(styleSheet);

export default HeroBanner;