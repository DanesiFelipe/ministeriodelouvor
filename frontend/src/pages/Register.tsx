import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [roles, setRoles] = useState<any[]>([]);
  const [bands, setBands] = useState<any[]>([]);
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedBand, setSelectedBand] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3000/api/auth/register-data')
      .then(r => r.json())
      .then(data => {
        setRoles(data.roles || []);
        setBands(data.bands || []);
      })
      .catch(() => console.error('Failed to load auxiliary data'));
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, username, email, phone, password, 
          roleIds: selectedRoles, 
          bandId: selectedBand || null 
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao realizar cadastro');

      alert('Cadastro realizado com sucesso! Você já pode fazer login.');
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
      <img src="/logo.png" className="watermark-logo" alt="Logo Menonita" />

      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '3rem', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Auto-Cadastro</h2>
          <p style={{ color: 'var(--color-light)', fontSize: '0.9rem' }}>Preencha seus dados para entrar no ministério</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(255,0,0,0.2)', border: '1px solid rgba(255,0,0,0.3)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', color: '#ffcccc', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--color-light)' }}>Nome Completo *</label>
              <input required value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.8rem', borderRadius: '8px', color: 'white' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--color-light)' }}>Usuário (Login) *</label>
              <input required value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.8rem', borderRadius: '8px', color: 'white' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--color-light)' }}>Telefone / WhatsApp</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(DD) 99999-9999" style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.8rem', borderRadius: '8px', color: 'white' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--color-light)' }}>Senha *</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.8rem', borderRadius: '8px', color: 'white' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-light)', marginBottom: '0.5rem' }}>E-mail (Opcional)</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.8rem', borderRadius: '8px', color: 'white' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-light)', fontSize: '0.9rem' }}>Seus Instrumentos/Funções (Pode selecionar várias):</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {roles.map(r => (
                <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedRoles.includes(r.id)} onChange={(e) => {
                    if (e.target.checked) setSelectedRoles([...selectedRoles, r.id]);
                    else setSelectedRoles(selectedRoles.filter(id => id !== r.id));
                  }} /> {r.name}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-light)', fontSize: '0.9rem' }}>Banda Fixa (Opcional):</label>
            <select value={selectedBand} onChange={e=>setSelectedBand(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
              <option value="" style={{ color: 'black' }}>Nenhuma (Ministro/Back/Avulso)</option>
              {bands.map(b => <option key={b.id} value={b.id} style={{ color: 'black' }}>{b.name}</option>)}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              background: 'var(--color-white)', color: 'var(--color-primary)', border: 'none', padding: '1rem', borderRadius: '8px',
              fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem', marginTop: '1rem', opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button type="button" onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'var(--color-light)', cursor: 'pointer', textDecoration: 'underline' }}>
              Já tenho uma conta. Fazer login.
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
