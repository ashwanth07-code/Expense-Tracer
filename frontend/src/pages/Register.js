// pages/Register.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiLogIn,
  FiDollarSign,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Clear any stored form data on mount
  useEffect(() => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  }, []);

  // Calculate password strength
  const calculateStrength = (pass) => {
    if (pass.length === 0) return 0;
    if (pass.length < 6) return 1;
    if (pass.length < 8) return 2;
    if (pass.match(/[A-Z]/) && pass.match(/[0-9]/) && pass.match(/[^A-Za-z0-9]/)) return 4;
    if (pass.match(/[A-Z]/) && pass.match(/[0-9]/)) return 3;
    return 2;
  };

  const handlePasswordChange = (e) => {
    const pass = e.target.value;
    setPassword(pass);
    setPasswordStrength(calculateStrength(pass));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const result = await register(name, email, password);
      if (result.success) {
        setSuccess(result.message);
        // Clear form
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
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
    success: '#10B981',
    warning: '#F59E0B',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8'
  };

  const strengthColors = ['#EF4444', '#F59E0B', '#FBBF24', '#10B981', '#10B981'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];

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

      {/* Register Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          position: 'relative',
          zIndex: 10,
          margin: '20px',
          maxHeight: '90vh',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

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
            Create Account
          </h1>
          
          <p style={{ color: colors.textSecondary, fontSize: '14px' }}>
            Join thousands of smart savers today
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: `${colors.success}15`,
              border: `1px solid ${colors.success}30`,
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: colors.success,
              fontSize: '14px',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <FiCheckCircle size={18} />
            {success} Redirecting to login...
          </motion.div>
        )}

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
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <FiXCircle size={18} />
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Name Field */}
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
              <FiUser size={16} color={colors.primary} />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your full name"
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
              <FiLock size={16} color={colors.primary} />
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="new-password"
                value={password}
                onChange={handlePasswordChange}
                required
                placeholder="Create a password"
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

            {/* Password Strength Indicator */}
            {password && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: '12px' }}
              >
                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      style={{
                        height: '4px',
                        flex: 1,
                        borderRadius: '2px',
                        background: level <= passwordStrength ? strengthColors[passwordStrength] : 'rgba(255, 255, 255, 0.1)',
                        transition: 'background 0.3s'
                      }}
                    />
                  ))}
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ 
                    fontSize: '12px', 
                    color: strengthColors[passwordStrength], 
                    fontWeight: '500'
                  }}>
                    Strength: {strengthLabels[passwordStrength]}
                  </span>
                  {passwordStrength >= 3 && (
                    <FiCheckCircle size={14} color={colors.success} />
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Confirm Password Field */}
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
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password"
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
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {confirmPassword && password === confirmPassword && (
              <div style={{ 
                marginTop: '8px', 
                color: colors.success, 
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <FiCheckCircle size={12} />
                Passwords match
              </div>
            )}
          </div>

          {/* Terms */}
          <div style={{ 
            marginBottom: '24px',
            padding: '0 4px'
          }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              cursor: 'pointer'
            }}>
              <input 
                type="checkbox" 
                required 
                style={{ 
                  width: '16px', 
                  height: '16px',
                  accentColor: colors.primary,
                  cursor: 'pointer'
                }} 
              />
              <span style={{ color: colors.textSecondary, fontSize: '13px' }}>
                I agree to the{' '}
                <a href="#" style={{ color: colors.primary, textDecoration: 'none' }}>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" style={{ color: colors.primary, textDecoration: 'none' }}>
                  Privacy Policy
                </a>
              </span>
            </label>
          </div>

          {/* Register Button */}
          <motion.button
            type="submit"
            disabled={loading || success}
            whileHover={{ scale: (loading || success) ? 1 : 1.02 }}
            whileTap={{ scale: (loading || success) ? 1 : 0.98 }}
            style={{
              width: '100%',
              padding: '16px',
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (loading || success) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              opacity: (loading || success) ? 0.7 : 1,
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
                Creating Account...
              </>
            ) : success ? (
              <>
                <FiCheckCircle size={18} />
                Registration Successful!
              </>
            ) : (
              <>
                <FiLogIn size={18} />
                Create Free Account
              </>
            )}
          </motion.button>
        </form>

        {/* Login Link */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <span style={{ color: colors.textSecondary, fontSize: '14px' }}>
            Already have an account?{' '}
          </span>
          <Link
            to="/login"
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
            Sign in here
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;