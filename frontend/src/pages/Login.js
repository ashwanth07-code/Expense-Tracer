// pages/Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  FiMail, 
  FiLock, 
  FiLogIn, 
  FiDollarSign,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Clear any stored form data on mount
  useEffect(() => {
    setEmail('');
    setPassword('');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Professional color palette
  const colors = {
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    secondary: '#10B981',
    error: '#EF4444',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8'
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      background: `linear-gradient(135deg, ${colors.background} 0%, #1E293B 100%)`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Animated background elements - minimized */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        background: `radial-gradient(circle, ${colors.primary}20 0%, transparent 70%)`,
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 20s infinite'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-5%',
        width: '500px',
        height: '500px',
        background: `radial-gradient(circle, ${colors.secondary}20 0%, transparent 70%)`,
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 25s infinite reverse'
      }} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-30px, 30px) rotate(240deg); }
        }
      `}</style>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          position: 'relative',
          zIndex: 10,
          margin: '20px'
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              width: '72px',
              height: '72px',
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: `0 10px 20px -5px ${colors.primary}40`
            }}
          >
            <FiDollarSign size={36} color="white" />
          </motion.div>
          
          <h1 style={{
            fontSize: '28px',
            fontWeight: '600',
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>
            Welcome Back
          </h1>
          
          <p style={{ color: colors.textSecondary, fontSize: '14px' }}>
            Sign in to continue to your dashboard
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: `${colors.error}15`,
              border: `1px solid ${colors.error}30`,
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: colors.error,
              fontSize: '14px',
              textAlign: 'center'
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Email Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: colors.text,
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              <FiMail size={16} color={colors.primary} />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              autoComplete="off"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
                color: colors.text,
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary;
                e.target.style.background = 'rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: colors.text,
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              <FiLock size={16} color={colors.primary} />
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                autoComplete="new-password"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '14px',
                  color: colors.text,
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  paddingRight: '48px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary;
                  e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: colors.textSecondary,
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '24px'
          }}>
            <Link
              to="/forgot-password"
              style={{
                color: colors.primary,
                fontSize: '13px',
                textDecoration: 'none',
                opacity: 0.8,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.8'}
            >
              Forgot password?
            </Link>
          </div>

          {/* Login Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            style={{
              width: '100%',
              padding: '16px',
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              opacity: loading ? 0.7 : 1,
              boxShadow: `0 10px 20px -5px ${colors.primary}60`
            }}
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}
                />
                Signing in...
              </>
            ) : (
              <>
                <FiLogIn size={18} />
                Sign In to Dashboard
              </>
            )}
          </motion.button>
        </form>

        {/* Register Link */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <span style={{ color: colors.textSecondary, fontSize: '14px' }}>
            Don't have an account?{' '}
          </span>
          <Link
            to="/register"
            style={{
              color: colors.primary,
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = colors.secondary}
            onMouseLeave={(e) => e.target.style.color = colors.primary}
          >
            Create free account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;