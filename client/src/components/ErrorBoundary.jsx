import { Component } from 'react';
import Icon from './Icon';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '60vh', gap: '16px',
          padding: '40px', textAlign: 'center', color: 'var(--bark)'
        }}>
          <Icon name="needle" size={48} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400 }}>Something went wrong</h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>We encountered an unexpected error. Please try refreshing the page.</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.href = '/'}
          >
            Go Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
