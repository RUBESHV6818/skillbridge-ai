import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setIsError(false);
    setShowResend(false);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setIsError(false);
        setMsg('✅ Logged in successfully! Redirecting...');
        localStorage.setItem('token', data.token);
        setTimeout(() => navigate('/'), 1000);
      } else {
        setIsError(true);
        setMsg(`❌ ${data.message || 'Login failed'}`);
        if (data.message && data.message.toLowerCase().includes('verify')) {
          setShowResend(true);
        }
      }
    } catch (err) {
      setIsError(true);
      setMsg('❌ Network error connecting to backend.');
    }
  };

  const handleResend = async () => {
    if (!form.email) return;
    setResending(true);
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    try {
      const res = await fetch(`${API_BASE}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsError(false);
        setMsg('📬 ' + data.message);
      } else {
        setIsError(true);
        setMsg(`❌ ${data.message}`);
      }
    } catch (err) {
      setIsError(true);
      setMsg('❌ Network error.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '420px', margin: '40px auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
        <h2 style={{ margin: '0 0 1.5rem 0', textAlign: 'center', fontSize: '1.6rem' }}>Sign In</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem', color: '#374151' }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="e.g. you@example.com"
              required
              style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.8rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem', color: '#374151' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.8rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem' }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
        </form>

        {msg && (
          <div style={{ marginTop: '1.2rem', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem', background: isError ? '#fef2f2' : '#f0fdf4', color: isError ? '#991b1b' : '#166534', border: `1px solid ${isError ? '#fecaca' : '#bbf7d0'}` }}>
            {msg}
          </div>
        )}

        {showResend && (
          <div style={{ marginTop: '0.8rem', textAlign: 'center' }}>
            <button
              onClick={handleResend}
              disabled={resending}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#2563eb',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '0.88rem',
                fontWeight: 600,
              }}
            >
              {resending ? 'Sending...' : '✉️ Click here to resend verification link'}
            </button>
          </div>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#6b7280' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
