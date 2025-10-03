import React from 'react';
import { Cloud, Zap } from 'lucide-react';

const Logo = ({ size = 'medium', showText = true }) => {
  const sizes = {
    small: { icon: 24, text: 16 },
    medium: { icon: 50, text: 24 },
    large: { icon: 55, text: 30 }
  };

  const currentSize = sizes[size];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <div style={{
        position: 'relative',
        width: currentSize.icon,
        height: currentSize.icon
      }}>
        <img
          src={require('../assets/logo.png')}
          alt="Logo"
          style={{
            position: 'absolute',
            top: 10,
            left: 0,
            width: currentSize.icon,
            height: currentSize.icon,
            objectFit: 'contain'
          }}
        />
        {/* <Cloud
          size={currentSize.icon}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            color: '#667eea'
          }}
        />
        <Zap
          size={currentSize.icon * 0.5}
          style={{
            position: 'absolute',
            top: '25%',
            left: '25%',
            color: '#f39c12',
            fill: '#f39c12'
          }}
        /> */}
      </div>
      
      {showText && (
        <span style={{
          fontSize: currentSize.text,
          fontWeight: '700',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          AI Cloud Storage
        </span>
      )}
    </div>
  );
};

export default Logo;