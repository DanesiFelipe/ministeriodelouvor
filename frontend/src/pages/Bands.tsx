import { useEffect, useState } from 'react';
import { Trash2, Plus, Guitar, Users, UserPlus } from 'lucide-react';

interface Band { id: string; name: string; description: string; }
interface User { id: string; name: string; email: string; }
interface MemberBand { id: string; userId: string; bandId: string; user: User; }

const inputStyle = {
  padding: '0.8rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.07)',
  color: 'white', border: '1px solid rgba(255,255,255,0.15)', fontFamily: 'var(--font-body)',
  fontSize: '0.9rem', outline: 'none', width: '100%',
};

export default function Bands() {
  const [bands, setBands] = useState<Band[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Estados para gerenciar membros da banda
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedBand, setSelectedBand] = useState<Band | null>(null);
  const [bandMembers, setBandMembers] = useState<MemberBand[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState('');

  useEffect(() => {
    try { const user = JSON.parse(localStorage.getItem('user') || '{}'); setIsAdmin(user.role === 'ADMIN'); } catch (e) {}
    fetchBands();
    fetchAllUsers();
  }, []);

  const fetchBands = async () => {
    try {
      const token = localStorage.getItem('token');
      setBands(await (await fetch('http://localhost:3000/api/bands', { headers: { Authorization: `Bearer ${token}` } })).json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/users', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setAllUsers(data.filter((u: any) => u.active)); // Apenas ativos
    } catch (err) { console.error(err); }
  };

  const fetchBandMembers = async (bandId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/bands/${bandId}/members`, { headers: { Authorization: `Bearer ${token}` } });
      setBandMembers(await res.json());
    } catch (err) { console.error(err); }
  };

  const createBand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3000/api/bands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, description })
      });
      setShowModal(false); setName(''); setDescription('');
      fetchBands();
    } catch { alert('Erro ao criar banda'); }
  };

  const deleteBand = async (id: string) => {
    if (!window.confirm('Excluir esta banda?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3000/api/bands/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      fetchBands();
    } catch { alert('Erro ao excluir'); }
  };

  const openMembersModal = (band: Band) => {
    setSelectedBand(band);
    fetchBandMembers(band.id);
    setShowMembersModal(true);
  };

  const addMemberToBand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBand || !selectedUserToAdd) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/bands/${selectedBand.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: selectedUserToAdd })
      });
      if (!res.ok) throw new Error('Erro (membro já pode estar na banda)');
      setSelectedUserToAdd('');
      fetchBandMembers(selectedBand.id);
    } catch (err: any) { alert(err.message); }
  };

  const removeMemberFromBand = async (userId: string) => {
    if (!selectedBand) return;
    if (!window.confirm('Remover membro desta banda?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3000/api/bands/${selectedBand.id}/members/${userId}`, { 
        method: 'DELETE', 
        headers: { Authorization: `Bearer ${token}` } 
      });
      fetchBandMembers(selectedBand.id);
    } catch { alert('Erro ao remover'); }
  };

  const colors = ['rgba(86,155,103,0.15)', 'rgba(100,180,255,0.12)', 'rgba(255,180,80,0.12)', 'rgba(180,100,255,0.12)'];
  const borderColors = ['rgba(86,155,103,0.3)', 'rgba(100,180,255,0.25)', 'rgba(255,180,80,0.25)', 'rgba(180,100,255,0.25)'];
  const textColors = ['#a7cfa8', '#64b4ff', '#ffb450', '#c87eff'];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Bandas</h1>
          <p className="page-subtitle">Grupos de louvor do Ministério.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={18} /> Nova Banda
          </button>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Guitar size={22} color="var(--color-light)" /> Nova Banda
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginBottom: '1.5rem', fontFamily: 'var(--font-body)' }}>
              Crie um grupo para organizar as escalas por domingos.
            </p>
            <form onSubmit={createBand} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Nome da Banda *</label>
                <input placeholder="Ex: Banda 1, Banda Jovem..." required value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Descrição (opcional)</label>
                <input placeholder="Ex: Escala nos domingos de semanas pares" value={description} onChange={e => setDescription(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Criar Banda</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMembersModal && selectedBand && (
        <div className="modal-overlay" onClick={() => setShowMembersModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={22} color="var(--color-info)" /> Membros: {selectedBand.name}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginBottom: '1.5rem', fontFamily: 'var(--font-body)' }}>
              Adicione ou remova membros da banda.
            </p>

            {isAdmin && (
              <form onSubmit={addMemberToBand} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <select 
                  value={selectedUserToAdd} 
                  onChange={e => setSelectedUserToAdd(e.target.value)} 
                  style={{ ...inputStyle, flex: 1 }}
                  required
                >
                  <option value="" style={{ background: '#06392D' }}>Selecionar membro...</option>
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id} style={{ background: '#06392D' }}>{u.name}</option>
                  ))}
                </select>
                <button type="submit" className="btn btn-primary" style={{ padding: '0 1rem' }}>
                  <UserPlus size={16} /> Adicionar
                </button>
              </form>
            )}

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              {bandMembers.length === 0 ? (
                <p style={{ padding: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Nenhum membro nesta banda.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {bandMembers.map((mb) => (
                    <div key={mb.id} style={{ 
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                      padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' 
                    }}>
                      <div>
                        <p style={{ fontWeight: '500', fontSize: '0.95rem' }}>{mb.user.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{mb.user.email}</p>
                      </div>
                      {isAdmin && (
                        <button onClick={() => removeMemberFromBand(mb.userId)} style={{
                          background: 'rgba(224,92,92,0.1)', border: 'none', color: '#ffaaaa',
                          cursor: 'pointer', padding: '0.4rem', borderRadius: '6px', transition: 'all 0.15s'
                        }}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setShowMembersModal(false)} className="btn btn-ghost">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner"><Guitar size={20} /> Carregando bandas...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {bands.map((b, index) => {
            const ci = index % colors.length;
            return (
              <div key={b.id} style={{
                background: colors[ci], border: `1px solid ${borderColors[ci]}`,
                borderRadius: '16px', padding: '1.5rem', position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex', flexDirection: 'column'
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
              >
                {isAdmin && (
                  <button onClick={() => deleteBand(b.id)} style={{
                    position: 'absolute', top: '1rem', right: '1rem',
                    background: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.2)',
                    color: 'rgba(224,92,92,0.6)', cursor: 'pointer', padding: '0.3rem',
                    borderRadius: '6px', transition: 'all 0.15s'
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(224,92,92,0.2)'; (e.currentTarget as HTMLElement).style.color = '#e05c5c'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(224,92,92,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgba(224,92,92,0.6)'; }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <div style={{ width: '44px', height: '44px', background: `${borderColors[ci].replace('0.3', '0.2')}`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Guitar size={22} color={textColors[ci]} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', fontWeight: '600', marginBottom: '0.3rem', color: textColors[ci] }}>
                  {b.name}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', fontFamily: 'var(--font-body)', flex: 1, marginBottom: '1.5rem' }}>
                  {b.description || 'Sem descrição'}
                </p>
                
                <button 
                  onClick={() => openMembersModal(b)}
                  style={{
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
                >
                  <Users size={16} /> {isAdmin ? 'Gerenciar Membros' : 'Ver Membros'}
                </button>
              </div>
            );
          })}
          {bands.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <Guitar size={48} />
              <p>Nenhuma banda cadastrada ainda.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
