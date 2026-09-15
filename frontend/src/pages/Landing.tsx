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

  const isOnline = apiStatus && !apiStatus.includes('offline');

  return (
    <>
      <img src="/logo.png" className="watermark-logo" alt="" aria-hidden="true" />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '960px', margin: '0 auto', padding: '3rem 2rem' }}>

        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5rem' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: '500', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0' }}>
            Ministério de Louvor
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.18)',
              color: 'rgba(255,255,255,0.75)',
              padding: '0.5rem 1.2rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'border-color 140ms ease, color 140ms ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.35)';
              (e.currentTarget as HTMLElement).style.color = '#fff';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.18)';
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)';
            }}
          >
            Entrar
          </button>
        </header>

        {/* Main hero */}
        <main style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4rem', alignItems: 'end' }}>
          <div>
            <p style={{ fontSize: '0.78rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.25rem' }}>
              Plataforma de Gestão
            </p>
            <h1
              className="display-title"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1, marginBottom: '1.5rem', color: 'rgba(255,255,255,0.92)' }}
            >
              Adoração com<br/>Excelência.
            </h1>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, maxWidth: '440px', marginBottom: '2.5rem' }}>
              Gerencie escalas, repertórios e membros do Ministério em um único lugar, simples e organizado.
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'var(--color-accent)',
                color: '#fff',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '6px',
                fontFamily: 'var(--font-body)',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'background 140ms ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hi)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
            >
              Acessar o Painel
            </button>
          </div>

          {/* Status panel */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '1.5rem',
            minWidth: '220px',
          }}>
            <p style={{ fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginBottom: '1.25rem' }}>
              Status do Sistema
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{
                  width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
                  background: isOnline ? 'var(--color-success)' : 'var(--color-danger)',
                }} />
                <div>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.1rem' }}>Backend</p>
                  <p style={{ fontSize: '0.83rem', color: isOnline ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: '500' }}>
                    {isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

              <div>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.2rem' }}>Próximo Culto</p>
                <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>Domingo, 18h30</p>
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

              <div>
                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.2rem' }}>Avisos</p>
                <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>Bem-vindo ao painel!</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
