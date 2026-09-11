import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao realizar login');
      }

      // Salva o token no localStorage para uso futuro
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/logo.png" className="watermark-logo" alt="Logo Menonita" />
      
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '3rem', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Acesso Restrito</h2>
          <p style={{ color: 'var(--color-light)', fontSize: '0.9rem' }}>Entre com suas credenciais de acesso</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(255,0,0,0.2)', border: '1px solid rgba(255,0,0,0.3)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', color: '#ffcccc', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--color-light)' }}>Usuário</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ 
                background: 'rgba(255,255,255,0.1)', 
                border: '1px solid rgba(255,255,255,0.2)', 
                padding: '0.8rem', 
                borderRadius: '8px', 
                color: 'white',
                fontFamily: 'var(--font-body)',
                outline: 'none'
              }} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--color-light)' }}>Senha</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ 
                background: 'rgba(255,255,255,0.1)', 
                border: '1px solid rgba(255,255,255,0.2)', 
                padding: '0.8rem', 
                borderRadius: '8px', 
                color: 'white',
                fontFamily: 'var(--font-body)',
                outline: 'none'
              }} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              background: 'var(--color-white)', 
              color: 'var(--color-primary)',
              border: 'none',
              padding: '1rem',
              borderRadius: '8px',
              fontFamily: 'var(--font-heading)',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              marginTop: '1rem',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Entrando...' : 'Entrar no Sistema'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button type="button" onClick={() => navigate('/register')} style={{ background: 'none', border: 'none', color: 'var(--color-light)', cursor: 'pointer', textDecoration: 'underline' }}>
              Ainda não tem conta? Cadastrar-se
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
