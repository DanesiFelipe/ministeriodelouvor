import { API_URL } from '../config';
import { useEffect, useState } from 'react';
import { Trash2, Plus, Shield } from 'lucide-react';

interface Role { id: string; name: string; description: string; }

const inputStyle = {
  padding: '0.8rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.07)',
  color: 'white', border: '1px solid rgba(255,255,255,0.15)', fontFamily: 'var(--font-body)',
  fontSize: '0.9rem', outline: 'none', width: '100%',
};

const ROLE_ICONS: Record<string, string> = {
  ministro: '🎤', ministra: '🎤', violão: '🎸', guitarra: '🎸', baixo: '🎸',
  teclado: '🎹', piano: '🎹', bateria: '🥁', percussão: '🥁',
  backing: '🎵', vocal: '🎵', saxofone: '🎷', trompete: '🎺',
};

const getRoleIcon = (name: string) => {
  const key = name.toLowerCase();
  return Object.entries(ROLE_ICONS).find(([k]) => key.includes(k))?.[1] || '🎼';
};

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      setRoles(await (await fetch(`${API_URL}/api/roles`, { headers: { Authorization: `Bearer ${token}` } })).json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRoles(); }, []);

  const createRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, description })
      });
      setShowModal(false); setName(''); setDescription('');
      fetchRoles();
    } catch { alert('Erro ao criar função'); }
  };

  const deleteRole = async (id: string) => {
    if (!window.confirm('Excluir esta função musical?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/roles/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      fetchRoles();
    } catch { alert('Erro ao excluir'); }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Funções Musicais</h1>
          <p className="page-subtitle">Instrumentos e papéis na equipe de louvor.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} /> Nova Função
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={22} color="var(--color-light)" /> Nova Função Musical
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginBottom: '1.5rem', fontFamily: 'var(--font-body)' }}>
              Defina um instrumento ou papel na equipe de louvor.
            </p>
            <form onSubmit={createRole} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Nome da Função *</label>
                <input placeholder="Ex: Violão, Ministro, Backing..." required value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Descrição (opcional)</label>
                <input placeholder="Ex: Responsável pela harmonia..." value={description} onChange={e => setDescription(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Criar Função</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner"><Shield size={20} /> Carregando funções...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.9rem' }}>
          {roles.map(r => (
            <div key={r.id} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px', padding: '1.2rem',
              display: 'flex', flexDirection: 'column', gap: '0.5rem',
              position: 'relative', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              <button onClick={() => deleteRole(r.id)} style={{
                position: 'absolute', top: '0.8rem', right: '0.8rem',
                background: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.2)',
                color: 'rgba(224,92,92,0.6)', cursor: 'pointer', padding: '0.25rem',
                borderRadius: '6px', transition: 'all 0.15s'
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(224,92,92,0.2)'; (e.currentTarget as HTMLElement).style.color = '#e05c5c'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(224,92,92,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgba(224,92,92,0.6)'; }}
              ><Trash2 size={13} /></button>

              <div style={{ fontSize: '1.8rem', lineHeight: 1 }}>{getRoleIcon(r.name)}</div>
              <h3 style={{ fontSize: '0.95rem', fontFamily: 'var(--font-heading)', fontWeight: '600', paddingRight: '1.5rem' }}>{r.name}</h3>
              {r.description && <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', fontFamily: 'var(--font-body)' }}>{r.description}</p>}
            </div>
          ))}
          {roles.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <Shield size={48} /><p>Nenhuma função cadastrada ainda.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
