import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

export default function NotFound() {
  return (
    <div className="fade-in" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh', gap: '16px',
      padding: '40px', textAlign: 'center'
    }}>
      <Icon name="needle" size={64} />
      <h1 className="display" style={{ fontSize: '48px', fontWeight: 400, color: 'var(--bark)' }}>404</h1>
      <p style={{ color: 'var(--muted)', fontSize: '14px' }}>This thread seems to have come loose — page not found.</p>
      <Link to="/" className="btn btn-clay">Weave back home</Link>
    </div>
  );
}
