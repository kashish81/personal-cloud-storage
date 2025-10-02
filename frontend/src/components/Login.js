import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const handleGoogleSuccess = async (credentialResponse) => {
  try {
    setLoading(true);
    const response = await fetch('http://localhost:5000/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        credential: credentialResponse.credential 
      })
    });

    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.token);
      window.location.reload(); // Refresh to update auth state
    } else {
      setMessage(data.message);
    }
  } catch (error) {
    setMessage('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
};
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { login } = useAuth();

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

    const result = await login(formData.email, formData.password);
    
    setMessage(result.message);
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Logo size="large" showText={false} />
          <h2>Welcome Back</h2>
          <p>Sign in to your cloud storage</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {message && (
            <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
<div style={{ 
  display: 'flex', 
  alignItems: 'center', 
  margin: '20px 0',
  gap: '10px'
}}>
  <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }}></div>
  <span style={{ color: '#999', fontSize: '14px' }}>OR</span>
  <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }}></div>
</div>

{/* Google Sign In Button */}
<GoogleLogin
  onSuccess={handleGoogleSuccess}
  onError={() => setMessage('Google sign in failed')}
  useOneTap
  theme="filled_blue"
  size="large"
  text="signin_with"
  width="100%"
/>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <button className="link-button" onClick={onToggleMode}>
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;