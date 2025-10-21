import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authBg from '../assets/auth.png';

const Register = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!agreeTerms) {
      setMessage('Please agree to the terms of service');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = await register(formData);
    setMessage(result.message);
    
    if (!result.success) {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      height: '100vh',
      backgroundColor: '#0f172a',
      color: '#f1f5f9',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    },
    leftSection: {
      flex: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
      position: 'relative',
      overflow: 'hidden'
    },
    imageContainer: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center',
      opacity: 0.95
    },
    gradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
      animation: 'pulse 8s ease-in-out infinite'
    },
    glowOrb: {
      position: 'absolute',
      width: '500px',
      height: '500px',
      background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
      borderRadius: '50%',
      filter: 'blur(60px)',
      animation: 'float 8s ease-in-out infinite',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    },
    rightSection: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 30px',
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(20px)',
      position: 'relative',
      animation: 'slideIn 0.6s ease-out',
      overflowY: 'auto'
    },
    formContainer: {
      maxWidth: '380px',
      width: '100%',
      background: 'rgba(30, 41, 59, 0.6)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '40px 32px',
      border: '1px solid rgba(148, 163, 184, 0.1)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 80px rgba(59, 130, 246, 0.1)',
      animation: 'fadeIn 0.8s ease-out',
      margin: '20px 0'
    },
    header: {
      marginBottom: '28px',
      textAlign: 'center'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      marginBottom: '8px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    subtitle: {
      fontSize: '13px',
      color: '#cbd5e1',
      lineHeight: '1.6'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '18px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    label: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#cbd5e1',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    icon: {
      position: 'absolute',
      left: '14px',
      color: '#64748b',
      pointerEvents: 'none',
      transition: 'color 0.3s ease'
    },
    input: {
      width: '100%',
      padding: '12px 14px 12px 44px',
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      borderRadius: '10px',
      color: '#f1f5f9',
      fontSize: '14px',
      transition: 'all 0.3s ease',
      outline: 'none'
    },
    togglePassword: {
      position: 'absolute',
      right: '12px',
      background: 'none',
      border: 'none',
      color: '#64748b',
      cursor: 'pointer',
      padding: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'color 0.2s'
    },
    checkboxGroup: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      fontSize: '12px',
      color: '#cbd5e1',
      margin: '8px 0'
    },
    checkbox: {
      width: '18px',
      height: '18px',
      cursor: 'pointer',
      accentColor: '#3b82f6',
      marginTop: '2px',
      flexShrink: 0
    },
    message: {
      padding: '12px 14px',
      borderRadius: '10px',
      fontSize: '13px',
      lineHeight: '1.4',
      animation: 'slideDown 0.3s ease-out'
    },
    messageError: {
      backgroundColor: 'rgba(127, 29, 29, 0.5)',
      border: '1px solid rgba(153, 27, 27, 0.5)',
      color: '#fecaca',
      backdropFilter: 'blur(10px)'
    },
    messageSuccess: {
      backgroundColor: 'rgba(30, 58, 31, 0.5)',
      border: '1px solid rgba(74, 222, 128, 0.5)',
      color: '#86efac',
      backdropFilter: 'blur(10px)'
    },
    button: {
      padding: '13px 24px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '8px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
    },
    buttonDisabled: {
      background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
      cursor: 'not-allowed',
      boxShadow: 'none'
    },
    footer: {
      textAlign: 'center',
      fontSize: '13px',
      color: '#cbd5e1',
      marginTop: '20px'
    },
    link: {
      color: '#3b82f6',
      textDecoration: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      padding: '0',
      font: 'inherit',
      transition: 'color 0.2s'
    }
  };

  return (
    <div style={styles.container}>
      {/* Left Section - Image */}
      <div style={styles.leftSection}>
        <div style={styles.imageContainer}>
          <img src={authBg} alt="Tech Background" style={styles.image} />
          <div style={styles.gradientOverlay} />
        </div>
        <div style={styles.glowOrb} />
      </div>

      {/* Right Section - Form */}
      <div style={styles.rightSection}>
        <div style={styles.formContainer}>
          <div style={styles.header}>
            <h1 style={styles.title}>Create Account</h1>
            <p style={styles.subtitle}>
              Join us to start managing your cloud storage with AI-powered features
            </p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {message && (
              <div
                style={{
                  ...styles.message,
                  ...(message.includes('successful') ? styles.messageSuccess : styles.messageError)
                }}
              >
                {message}
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>Username</label>
              <div style={styles.inputWrapper}>
                <User size={18} style={styles.icon} />
                <input
                  type="text"
                  name="username"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.7)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    e.target.previousSibling.style.color = '#3b82f6';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)';
                    e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.5)';
                    e.target.style.boxShadow = 'none';
                    e.target.previousSibling.style.color = '#64748b';
                  }}
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} style={styles.icon} />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.7)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    e.target.previousSibling.style.color = '#3b82f6';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)';
                    e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.5)';
                    e.target.style.boxShadow = 'none';
                    e.target.previousSibling.style.color = '#64748b';
                  }}
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} style={styles.icon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  style={{...styles.input, paddingRight: '44px'}}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.7)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    e.target.previousSibling.style.color = '#3b82f6';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)';
                    e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.5)';
                    e.target.style.boxShadow = 'none';
                    e.target.previousSibling.style.color = '#64748b';
                  }}
                  required
                />
                <button
                  type="button"
                  style={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#94a3b8'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} style={styles.icon} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{...styles.input, paddingRight: '44px'}}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.7)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    e.target.previousSibling.style.color = '#3b82f6';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)';
                    e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.5)';
                    e.target.style.boxShadow = 'none';
                    e.target.previousSibling.style.color = '#64748b';
                  }}
                  required
                />
                <button
                  type="button"
                  style={styles.togglePassword}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#94a3b8'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={styles.checkbox}
              />
              <label htmlFor="terms">
                I agree to the terms of service and privacy policy
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {})
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div style={styles.footer}>
            <span>Already have an account? </span>
            <button 
              style={styles.link} 
              onClick={onToggleMode}
              onMouseEnter={(e) => e.currentTarget.style.color = '#60a5fa'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#3b82f6'}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(30px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input::placeholder {
          color: #475569;
        }
      `}</style>
    </div>
  );
};

export default Register;