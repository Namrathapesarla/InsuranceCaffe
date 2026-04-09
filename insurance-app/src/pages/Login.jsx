import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const result = login(username, password);
      if (result.success) {
        navigate('/', { replace: true });
      } else {
        setError(result.error);
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
      padding: '1rem', position: 'fixed', inset: 0, zIndex: 50,
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo / Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img
            src="/datacaffe_new_logo.png"
            alt="DataCaffe"
            style={{ width: '4.5rem', height: '4.5rem', objectFit: 'contain', margin: '0 auto 0.9rem' }}
          />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
            InsuranceCaffe
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Insurance Management Platform
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: 'white', borderRadius: '1rem', padding: '2rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            Sign in to your account
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.5rem' }}>
            Enter your credentials to access the dashboard
          </p>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem',
              padding: '0.65rem 0.85rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#dc2626',
              fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-input"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '0.7rem', borderRadius: '0.5rem', border: 'none',
                background: loading ? '#93c5fd' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white', fontSize: '0.85rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s', marginTop: '0.5rem',
                boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
