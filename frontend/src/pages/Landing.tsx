import { API_URL } from '../config';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  const [apiStatus, setApiStatus] = useState<string>('Verificando...');

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then(res => res.json())
      .then(data => setApiStatus(data.message))
      .catch(() => setApiStatus('API offline ou não iniciada.'));
  }, []);

  return (
    <>
      <img src="/logo.png" className="watermark-logo" alt="Logo Menonita" />
      <div className="app-container">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <h2>Ministério de Louvor</h2>
          <nav>
            <button onClick={() => navigate('/login')} className="glass-panel" style={{ padding: '0.5rem 1.5rem', borderRadius: '20px', cursor: 'pointer', border: 'none', color: 'white', fontWeight: 'bold' }}>
              Entrar
            </button>
          </nav>
        </header>

        <main style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '4rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '3.5rem', lineHeight: '1.2', marginBottom: '1.5rem' }}>
              Adoração com<br />Excelência
            </h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem', maxWidth: '80%' }}>
              Plataforma de gestão de escalas, repertórios e membros para o nosso Ministério de Louvor.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => navigate('/login')} style={{ 
                background: 'var(--color-white)', 
                color: 'var(--color-primary)',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontFamily: 'var(--font-heading)',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem'
              }}>
                Acessar Painel
              </button>
            </div>
          </div>

          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3>Status do Sistema</h3>
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-light)' }}>Backend Status:</p>
              <p style={{ fontWeight: '500', marginTop: '0.2rem' }}>{apiStatus}</p>
            </div>
            
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-light)' }}>Próximo Culto:</p>
              <p style={{ fontWeight: '500', marginTop: '0.2rem' }}>Domingo, 18h30</p>
            </div>
            
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-light)' }}>Avisos:</p>
              <p style={{ fontWeight: '500', marginTop: '0.2rem' }}>Bem-vindo ao novo painel!</p>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default App
