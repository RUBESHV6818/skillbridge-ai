import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_ORIGIN } from '../../../skillbridge-ai/src/services/apiBaseUrl';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setIsError(false);
    setLoading(true);

    try {
      const res = await fetch(`${API_ORIGIN}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: 'student' }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsError(false);
        setMsg('✅ Account created! Check your backend terminal for the verification link.');
      } else {
        setIsError(true);
        setMsg(`❌ ${data.message || 'Registration failed'}`);
      }
    } catch (err) {
      setIsError(true);
      setMsg('❌ Network error connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '420px', margin: '40px auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
        <h2 style={{ margin: '0 0 1.5rem 0', textAlign: 'center', fontSize: '1.6rem' }}>Create Account</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem', color: '#374151' }}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              required
              style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.8rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem' }}
            />
          </div>

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
            disabled={loading}
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
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        {msg && (
          <div style={{ marginTop: '1.2rem', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem', background: isError ? '#fef2f2' : '#f0fdf4', color: isError ? '#991b1b' : '#166534', border: `1px solid ${isError ? '#fecaca' : '#bbf7d0'}` }}>
            {msg}
          </div>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#6b7280' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
