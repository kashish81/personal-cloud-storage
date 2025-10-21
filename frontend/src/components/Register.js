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
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    leftSection: {
      flex: 2,
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute'
    },
    image: {
      width: '100%',
      height: '100%',
      opacity: 0.9,
      objectFit: 'cover',  
  objectPosition: 'center'
    },
    glow: {
      position: 'absolute',
      width: '400px',
      height: '400px',
      background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
      borderRadius: '50%',
      filter: 'blur(40px)',
      animation: 'float 6s ease-in-out infinite'
    },
    rightSection: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '40px 30px',
      background: '#0f172a',
      overflowY: 'auto'
    },
    formContainer: {
      maxWidth: '350px',
      margin: '0 auto',
      width: '100%'
    },
    header: {
      marginBottom: '32px'
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      marginBottom: '12px',
      color: '#f1f5f9'
    },
    subtitle: {
      fontSize: '14px',
      color: '#cbd5e1',
      lineHeight: '1.6'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    label: {
      fontSize: '13px',
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
      pointerEvents: 'none'
    },
    input: {
      width: '100%',
      padding: '12px 14px 12px 44px',
      backgroundColor: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '8px',
      color: '#f1f5f9',
      fontSize: '14px',
      transition: 'all 0.3s ease',
      outline: 'none'
    },
    inputFocus: {
      borderColor: '#3b82f6',
      backgroundColor: '#1e293b',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
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
      margin: '12px 0'
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
      borderRadius: '6px',
      fontSize: '13px',
      lineHeight: '1.4'
    },
    messageError: {
      backgroundColor: '#7f1d1d',
      border: '1px solid #991b1b',
      color: '#fecaca'
    },
    messageSuccess: {
      backgroundColor: '#1e3a1f',
      border: '1px solid #4ade80',
      color: '#86efac'
    },
    button: {
      padding: '12px 24px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '8px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    buttonDisabled: {
      backgroundColor: '#475569',
      cursor: 'not-allowed'
    },
    footer: {
      textAlign: 'center',
      fontSize: '13px',
      color: '#cbd5e1',
      marginTop: '16px'
    },
    link: {
      color: '#3b82f6',
      textDecoration: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      padding: '0',
      font: 'inherit'
    }
  };

  return (
    <div style={styles.container}>
      {/* Left Section - Image */}
      <div style={styles.leftSection}>
        <div style={styles.glow} />
        <div style={styles.imageContainer}>
          <img
            src={authBg}
            alt="Tech Background"
            style={styles.image}
          />
        </div>
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
                  style={{...styles.input}}
                  onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#334155';
                    e.target.style.backgroundColor = '#1e293b';
                    e.target.style.boxShadow = 'none';
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
                  style={{...styles.input}}
                  onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#334155';
                    e.target.style.backgroundColor = '#1e293b';
                    e.target.style.boxShadow = 'none';
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
                  onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#334155';
                    e.target.style.backgroundColor = '#1e293b';
                    e.target.style.boxShadow = 'none';
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
                  onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#334155';
                    e.target.style.backgroundColor = '#1e293b';
                    e.target.style.boxShadow = 'none';
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
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(59, 130, 246, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div style={styles.footer}>
            <span>Already have an account? </span>
            <button style={styles.link} onClick={onToggleMode}>
              Sign in
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
        }
        input::placeholder {
          color: #475569;
        }
      `}</style>
    </div>
  );
};

export default Register;