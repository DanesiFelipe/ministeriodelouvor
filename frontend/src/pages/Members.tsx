import { API_URL } from '../config';
import { useEffect, useState } from 'react';
import { Plus, Users, ShieldCheck, ShieldOff, UserCheck, UserX, Music } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  active: boolean;
  memberRoles?: Array<{ role: { name: string } }>;
}

const inputStyle = {
  padding: '0.8rem 1rem',
  borderRadius: '8px',
  background: 'rgba(255,255,255,0.07)',
  color: 'white',
  border: '1px solid rgba(255,255,255,0.15)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.9rem',
  outline: 'none',
  width: '100%',
};

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function getAvatarGradient(name: string) {
  const gradients = [
    'linear-gradient(135deg, #569B67, #3a7a4a)',
    'linear-gradient(135deg, #4a90d9, #2e6aad)',
    'linear-gradient(135deg, #c97c3a, #a05a20)',
    'linear-gradient(135deg, #9b56a0, #6d2f73)',
    'linear-gradient(135deg, #3ab8c4, #1a8a96)',
  ];
  const idx = name.charCodeAt(0) % gradients.length;
  return gradients[idx];
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [bands, setBands] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedBand, setSelectedBand] = useState('');

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Falha ao carregar membros');
      setMembers(await res.json());
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const fetchAuxData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [rRes, bRes] = await Promise.all([
        fetch(`${API_URL}/api/roles`, { headers }),
        fetch(`${API_URL}/api/bands`, { headers })
      ]);
      setRoles(await rRes.json());
      setBands(await bRes.json());
    } catch (e) {}
  };

  useEffect(() => { fetchMembers(); fetchAuxData(); }, []);

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, username, email, phone, password, roleIds: selectedRoles, bandId: selectedBand || null })
      });
      if (!res.ok) { const d = await res.json(); alert(d.error || 'Erro ao criar'); return; }
      setShowModal(false);
      setName(''); setUsername(''); setEmail(''); setPhone(''); setPassword(''); setSelectedRoles([]); setSelectedBand('');
      fetchMembers();
    } catch { alert('Erro ao criar membro'); }
  };

  const deactivateMember = async (id: string) => {
    if (!window.confirm('Deseja desativar este membro?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      fetchMembers();
    } catch { alert('Erro ao desativar membro'); }
  };

  const approveMember = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/users/${id}/approve`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      fetchMembers();
    } catch { alert('Erro ao aprovar membro'); }
  };

  const toggleAdminRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    const msg = currentRole === 'ADMIN'
      ? 'Remover os privilégios de administrador deste membro?'
      : 'Promover este membro a administrador? Ele terá acesso total ao sistema.';
    if (!window.confirm(msg)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole })
      });
      if (!res.ok) throw new Error();
      if (!res.ok) throw new Error();
      fetchMembers();
    } catch { alert('Erro ao alterar privilégios'); }
  };

  const toggleMinistroRole = async (id: string, isCurrentlyMinistro: boolean) => {
    const msg = isCurrentlyMinistro
      ? 'Remover o acesso de Ministro de Louvor deste membro?'
      : 'Conceder acesso de Ministro de Louvor a este membro? Ele poderá gerenciar músicas e repertórios.';
    if (!window.confirm(msg)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/${id}/ministro`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isMinistro: !isCurrentlyMinistro })
      });
      if (!res.ok) throw new Error();
      fetchMembers();
    } catch { alert('Erro ao alterar privilégio de ministro'); }
  };

  const activeMembers = members.filter(m => m.active);
  const pendingMembers = members.filter(m => !m.active);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Membros</h1>
          <p className="page-subtitle">{activeMembers.length} ativos · {pendingMembers.length} pendentes de aprovação</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} /> Novo Membro
        </button>
      </div>

      {/* Modal Novo Membro */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <h2 style={{ marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={22} color="var(--color-light)" /> Cadastrar Membro
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginBottom: '1.5rem', fontFamily: 'var(--font-body)' }}>
              O membro receberá acesso ao sistema com as permissões configuradas.
            </p>
            <form onSubmit={handleCreateMember} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.9rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Nome Completo *</label>
                  <input placeholder="João da Silva" required value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Usuário (login) *</label>
                  <input placeholder="joao" required value={username} onChange={e => setUsername(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.9rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Telefone (WhatsApp)</label>
                  <input placeholder="(11) 99999-9999" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>E-mail</label>
                  <input placeholder="joao@email.com" type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Senha Provisória *</label>
                <input placeholder="••••••" required type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Funções Musicais</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {roles.map(r => (
                    <label key={r.id} style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      background: selectedRoles.includes(r.id) ? 'rgba(86,155,103,0.2)' : 'rgba(255,255,255,0.05)',
                      border: selectedRoles.includes(r.id) ? '1px solid rgba(86,155,103,0.4)' : '1px solid rgba(255,255,255,0.1)',
                      padding: '0.4rem 0.8rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.82rem',
                      transition: 'all 0.15s', userSelect: 'none',
                    }}>
                      <input type="checkbox" checked={selectedRoles.includes(r.id)} style={{ display: 'none' }}
                        onChange={e => {
                          if (e.target.checked) setSelectedRoles([...selectedRoles, r.id]);
                          else setSelectedRoles(selectedRoles.filter(id => id !== r.id));
                        }} />
                      {r.name}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Banda Fixa (Opcional)</label>
                <select value={selectedBand} onChange={e => setSelectedBand(e.target.value)} style={inputStyle}>
                  <option value="" style={{ background: '#06392D' }}>Nenhuma (Avulso / Ministro)</option>
                  {bands.map(b => <option key={b.id} value={b.id} style={{ background: '#06392D' }}>{b.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Salvar Membro</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && <div style={{ background: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.3)', padding: '0.8rem 1.2rem', borderRadius: '8px', color: '#e05c5c', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

      {loading ? (
        <div className="loading-spinner"><Users size={20} /> Carregando membros...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Pendentes de aprovação */}
          {pendingMembers.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <span className="badge badge-orange"><UserCheck size={11} /> {pendingMembers.length} aguardando aprovação</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                {pendingMembers.map(m => (
                  <div key={m.id} style={{
                    background: 'rgba(255,180,80,0.05)',
                    border: '1px solid rgba(255,180,80,0.2)',
                    borderRadius: '14px',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    animation: 'slideUp 0.3s ease',
                  }}>
                    <div style={{
                      width: '44px', height: '44px', flexShrink: 0,
                      background: 'rgba(255,180,80,0.15)',
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', fontWeight: '700', color: '#ffb450',
                    }}>
                      {getInitials(m.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: '600', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</p>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>{m.email}</p>
                    </div>
                    <button onClick={() => approveMember(m.id)} className="btn btn-primary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', flexShrink: 0 }}>
                      <UserCheck size={13} /> Aprovar
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Membros Ativos */}
          <section>
            <p style={{ fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
              Membros Ativos ({activeMembers.length})
            </p>
            {activeMembers.length === 0 ? (
              <div className="empty-state"><Users size={48} /><p>Nenhum membro ativo.</p></div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.85rem' }}>
                {activeMembers.map(m => (
                  <div key={m.id} style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'all 0.2s ease',
                    animation: 'slideUp 0.3s ease',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(86,155,103,0.2)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: '46px', height: '46px', flexShrink: 0,
                      background: m.role === 'ADMIN' ? 'linear-gradient(135deg, #d4a032, #a0751a)' : getAvatarGradient(m.name),
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', fontWeight: '700', color: 'white',
                      boxShadow: m.role === 'ADMIN' ? '0 0 12px rgba(212,160,50,0.35)' : '0 2px 8px rgba(0,0,0,0.3)',
                    }}>
                      {getInitials(m.name)}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <p style={{ fontWeight: '600', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</p>
                        {m.role === 'ADMIN' && (
                          <span style={{ background: 'rgba(212,160,50,0.18)', border: '1px solid rgba(212,160,50,0.3)', borderRadius: '20px', padding: '0.1rem 0.5rem', fontSize: '0.65rem', color: '#ffb450', fontWeight: '600', flexShrink: 0 }}>
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.email}</p>
                    </div>

                    {/* Actions */}
                    {(() => {
                      const isMinistro = m.memberRoles?.some(mr => 
                        mr.role.name.toLowerCase().includes('ministr')
                      ) ?? false;
                      
                      return (
                        <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                          <button
                            onClick={() => toggleMinistroRole(m.id, isMinistro)}
                            title={isMinistro ? 'Remover Ministro' : 'Tornar Ministro'}
                            style={{
                              background: isMinistro ? 'rgba(86,155,103,0.12)' : 'rgba(255,255,255,0.05)',
                              border: isMinistro ? '1px solid rgba(86,155,103,0.25)' : '1px solid rgba(255,255,255,0.1)',
                              color: isMinistro ? '#a7cfa8' : 'rgba(255,255,255,0.3)',
                              cursor: 'pointer', padding: '0.45rem', borderRadius: '8px',
                              transition: 'all 0.15s', display: 'flex', alignItems: 'center',
                            }}
                          >
                            <Music size={15} />
                          </button>
                          <button
                            onClick={() => toggleAdminRole(m.id, m.role)}
                            title={m.role === 'ADMIN' ? 'Remover Admin' : 'Tornar Admin'}
                            style={{
                              background: m.role === 'ADMIN' ? 'rgba(255,180,80,0.12)' : 'rgba(100,180,255,0.1)',
                              border: m.role === 'ADMIN' ? '1px solid rgba(255,180,80,0.25)' : '1px solid rgba(100,180,255,0.2)',
                              color: m.role === 'ADMIN' ? '#ffb450' : 'var(--color-info)',
                              cursor: 'pointer', padding: '0.45rem', borderRadius: '8px',
                              transition: 'all 0.15s', display: 'flex', alignItems: 'center',
                            }}
                          >
                            {m.role === 'ADMIN' ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}
                          </button>
                          <button
                            onClick={() => deactivateMember(m.id)}
                            title="Desativar membro"
                            style={{
                              background: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.2)',
                              color: 'rgba(224,92,92,0.7)', cursor: 'pointer', padding: '0.45rem',
                              borderRadius: '8px', transition: 'all 0.15s', display: 'flex', alignItems: 'center',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(224,92,92,0.2)'; (e.currentTarget as HTMLElement).style.color = '#e05c5c'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(224,92,92,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgba(224,92,92,0.7)'; }}
                          >
                            <UserX size={15} />
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
