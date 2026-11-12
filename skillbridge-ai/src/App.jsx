import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SkillBridge Render Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2.5rem', maxWidth: '640px', margin: '40px auto', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', fontFamily: 'system-ui, sans-serif' }}>
          <h2 style={{ color: '#dc2626', margin: '0 0 1rem 0' }}>⚠️ Render Error in SkillBridge</h2>
          <pre style={{ background: '#fef2f2', padding: '1rem', borderRadius: '8px', overflowX: 'auto', color: '#991b1b', fontSize: '0.85rem' }}>
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            style={{ marginTop: '1.5rem', padding: '0.65rem 1.4rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            Reset Session & Login Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
