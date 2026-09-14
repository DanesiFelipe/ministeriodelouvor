import { API_URL } from '../config';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMinister, setIsMinister] = useState(false);

  // States for manual scheduling
  const [bands, setBands] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedBand, setSelectedBand] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedMember, setSelectedMember] = useState('');

  // States for Repertoire
  const [songs, setSongs] = useState<any[]>([]);
  const [, setRepertoire] = useState<any>(null);
  const [repertoireSongs, setRepertoireSongs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // States for New Song Modal
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongArtist, setNewSongArtist] = useState('');
  const [newSongKey, setNewSongKey] = useState('');
  const [newSongLink, setNewSongLink] = useState('');

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setIsAdmin(user.role === 'ADMIN');
      setIsMinister(user.isMinistro === true);
    } catch (e) {}
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [servRes, bandsRes, rolesRes, membersRes, songsRes, repRes] = await Promise.all([
        fetch(`${API_URL}/api/services`, { headers }),
        fetch(`${API_URL}/api/bands`, { headers }),
        fetch(`${API_URL}/api/roles`, { headers }),
        fetch(`${API_URL}/api/users`, { headers }),
        fetch(`${API_URL}/api/songs`, { headers }),
        fetch(`${API_URL}/api/repertoires/service/${id}`, { headers })
      ]);

      const servicesData = await servRes.json();
      const currentService = servicesData.find((s: any) => s.id === id);
      setService(currentService);
      setBands(await bandsRes.json());
      setRoles(await rolesRes.json());
      setMembers(await membersRes.json());
      setSongs(await songsRes.json());
      
      const repData = await repRes.json();
      if (repData && repData.id) {
        setRepertoire(repData);
        setRepertoireSongs(repData.songs.map((rs: any) => rs.song));
      } else {
        setRepertoire(null);
        setRepertoireSongs([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ serviceId: id, bandId: selectedBand || null })
      });
      fetchData();
    } catch (err) {
      alert('Erro ao criar escala base');
    }
  };

  const autoFillSchedule = async (scheduleId: string) => {
    if (!window.confirm('Isto irá alocar os membros disponíveis automaticamente. Deseja continuar?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/schedules/${scheduleId}/auto-fill`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.warnings && data.warnings.length > 0) {
        alert('Escala gerada com alguns avisos:\n' + data.warnings.join('\n'));
      } else {
        alert(data.message || 'Escala gerada com sucesso!');
      }
      fetchData();
    } catch (err) {
      alert('Erro ao gerar escala automática');
    }
  };

  const addParticipant = async (scheduleId: string) => {
    if (!selectedMember || !selectedRole) {
      alert('Selecione o membro e a função');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/schedules/${scheduleId}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: selectedMember, roleId: selectedRole })
      });
      fetchData();
    } catch (err) {
      alert('Erro ao adicionar membro à escala');
    }
  };

  const removeParticipant = async (scheduleId: string, participantId: string) => {
    if (!window.confirm('Remover membro da escala?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/schedules/${scheduleId}/participants/${participantId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Erro ao remover membro');
    }
  };

  // Repertoire Functions
  const saveRepertoire = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      // const songIds = repertoireSongs.map(s => s.id);
      await fetch(`${API_URL}/api/repertoires/service/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          songs: repertoireSongs.map(s => ({ songId: s.id, key: s.selectedKey })),
          ministerId: user.id
        })
      });
      alert('Repertório salvo com sucesso!');
      fetchData();
    } catch (err) {
      alert('Erro ao salvar repertório');
    }
  };

  const addSongToRepertoire = (song: any) => {
    let finalKey = song.selectedKey;
    if (finalKey === undefined) {
      finalKey = window.prompt(`Qual o tom para "${song.title}" neste culto?`, song.key || '') || '';
    }

    if (repertoireSongs.find(s => s.id === song.id)) {
      alert('Música já está no repertório!');
      return;
    }
    
    setRepertoireSongs([...repertoireSongs, { ...song, selectedKey: finalKey }]);
    setSearchQuery('');
  };

  const removeSongFromRepertoire = (songId: string) => {
    setRepertoireSongs(repertoireSongs.filter(s => s.id !== songId));
  };

  const openAddSongModal = (title: string) => {
    setNewSongTitle(title);
    setNewSongArtist('');
    setNewSongKey('');
    setNewSongLink('');
    setShowAddSongModal(true);
  };

  const handleCreateAndAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          title: newSongTitle, 
          artist: newSongArtist, 
          key: newSongKey, 
          links: newSongLink 
        })
      });
      const newSong = await res.json();
      
      setSongs([...songs, newSong]);
      addSongToRepertoire({ ...newSong, selectedKey: newSongKey });
      setShowAddSongModal(false);
    } catch (err) {
      alert('Erro ao criar música');
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (!service) return <p>Culto não encontrado.</p>;

  const dateObj = new Date(service.date);
  const formattedDate = dateObj.toLocaleDateString('pt-BR');
  const schedule = service.schedules?.[0]; // Assume 1 schedule per service for MVP

  return (
    <>
      <header style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate('/admin/services')} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none',
          color: 'var(--color-accent)', cursor: 'pointer', marginBottom: '0.75rem', fontWeight: '500',
          fontSize: '0.9rem', padding: '0.4rem 0'
        }}>
          <ArrowLeft size={18} /> Voltar
        </button>
        <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>Culto de {service.type}</h1>
        <p style={{ color: 'var(--color-light)', marginTop: '0.4rem', fontSize: 'clamp(0.9rem, 3vw, 1.2rem)' }}>{formattedDate} às {service.time}</p>
      </header>

      {/* Modal Nova Música */}
      {showAddSongModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Cadastrar Nova Música</h2>
            <form onSubmit={handleCreateAndAddSong} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input placeholder="Título" required value={newSongTitle} onChange={e=>setNewSongTitle(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
              <input placeholder="Artista / Banda Original" value={newSongArtist} onChange={e=>setNewSongArtist(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
              <input placeholder="Tom (Ex: E, G#m...)" value={newSongKey} onChange={e=>setNewSongKey(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
              <input placeholder="Link do YouTube" value={newSongLink} onChange={e=>setNewSongLink(e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddSongModal(false)} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'var(--color-accent)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Salvar & Adicionar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '1.5rem' }}>
        
        {/* ESCALA SECTION */}
        <div className="glass-panel">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Escala da Equipe</h2>
          
          {!schedule ? (
            <div>
              <p style={{ color: 'var(--color-light)', marginBottom: '1rem' }}>Nenhuma escala definida para este culto ainda.</p>
              {isAdmin && (
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <select 
                    value={selectedBand} 
                    onChange={e => setSelectedBand(e.target.value)}
                    style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    <option value="" style={{ color: 'black' }}>Nenhuma Banda (Avulso)</option>
                    {bands.map(b => <option key={b.id} value={b.id} style={{ color: 'black' }}>{b.name}</option>)}
                  </select>
                  <button onClick={createSchedule} style={{
                    background: 'var(--color-accent)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer'
                  }}>
                    Iniciar Escala
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p><strong>Banda Escalada:</strong> {schedule.band?.name || 'Avulso'}</p>
                  <p><strong>Status:</strong> <span style={{ color: 'var(--color-accent)' }}>{schedule.status}</span></p>
                </div>
                {isAdmin && (
                  <button onClick={() => autoFillSchedule(schedule.id)} style={{
                    background: 'var(--color-secondary)', color: 'white', border: '1px solid var(--color-accent)', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer'
                  }}>
                    ✨ Auto-Completar Escala
                  </button>
                )}
              </div>

              {/* Tabela de Participantes */}
              <div className="table-container">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '2rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '1rem 0' }}>Membro</th>
                      <th style={{ padding: '1rem 0' }}>Função</th>
                      {isAdmin && <th style={{ padding: '1rem 0', textAlign: 'right' }}>Remover</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.participants?.map((p: any) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem 0', fontWeight: 'bold' }}>{p.user.name}</td>
                        <td style={{ padding: '1rem 0', color: 'var(--color-light)' }}>{p.role.name}</td>
                        {isAdmin && (
                          <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                            <button onClick={() => removeParticipant(schedule.id, p.id)} style={{ background: 'none', border: 'none', color: '#ffaaaa', cursor: 'pointer' }}>
                              <Trash2 size={18} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {(!schedule.participants || schedule.participants.length === 0) && (
                      <tr><td colSpan={3} style={{ padding: '1rem 0', color: 'var(--color-light)' }}>Nenhum membro escalado ainda.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Formulário para adicionar participante (Escala Manual) */}
              {isAdmin && (
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ marginBottom: '1rem' }}>Adicionar Membro</h4>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <select 
                      value={selectedMember} 
                      onChange={e => setSelectedMember(e.target.value)}
                      style={{ flex: 1, minWidth: '200px', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                    >
                      <option value="" style={{ color: 'black' }}>Selecione o Membro</option>
                      {members.map(m => <option key={m.id} value={m.id} style={{ color: 'black' }}>{m.name}</option>)}
                    </select>

                    <select 
                      value={selectedRole} 
                      onChange={e => setSelectedRole(e.target.value)}
                      style={{ flex: 1, minWidth: '200px', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                    >
                      <option value="" style={{ color: 'black' }}>Selecione a Função</option>
                      {roles.map(r => <option key={r.id} value={r.id} style={{ color: 'black' }}>{r.name}</option>)}
                    </select>

                    <button onClick={() => addParticipant(schedule.id)} style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      background: 'var(--color-accent)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
                    }}>
                      <Plus size={20} /> Escalar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* REPERTÓRIO SECTION */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.5rem' }}>Repertório</h2>
            {(isAdmin || isMinister) && (
              <button onClick={saveRepertoire} style={{
                background: 'var(--color-primary)', color: 'white', border: '1px solid var(--color-accent)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
              }}>
                Salvar
              </button>
            )}
          </div>

          {(isAdmin || isMinister) && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: 'var(--color-light)', marginBottom: '0.5rem' }}>Buscar música na biblioteca:</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="Ex: Lindo És..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                />
              </div>
              {/* Search Results */}
              {searchQuery && (
                <div style={{ background: 'rgba(0,0,0,0.5)', marginTop: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '200px', overflowY: 'auto' }}>
                  {songs.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase())).map(song => (
                    <div key={song.id} onClick={() => addSongToRepertoire(song)} style={{ padding: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                      <strong style={{ color: 'var(--color-white)' }}>{song.title}</strong>
                      <span style={{ color: 'var(--color-light)', marginLeft: '0.5rem', fontSize: '0.8rem' }}>{song.artist} ({song.key})</span>
                    </div>
                  ))}
                  {songs.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <div style={{ padding: '1rem', textAlign: 'center' }}>
                      <p style={{ color: 'var(--color-light)', marginBottom: '0.5rem' }}>Música não encontrada.</p>
                      <button onClick={() => openAddSongModal(searchQuery)} style={{ background: 'var(--color-accent)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                        + Adicionar "{searchQuery}"
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div style={{ flex: 1 }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--color-light)' }}>Músicas Selecionadas ({repertoireSongs.length})</h4>
            {repertoireSongs.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>Nenhuma música no repertório.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {repertoireSongs.map((song, index) => (
                  <div key={song.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ opacity: 0.5 }}>{index + 1}.</span>
                      <div>
                        <strong>{song.title}</strong>
                        <span style={{ marginLeft: '0.5rem', color: 'var(--color-accent)', fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                          {song.selectedKey || song.key || '?'}
                        </span>
                      </div>
                    </div>
                    {(isAdmin || isMinister) && (
                      <button onClick={() => removeSongFromRepertoire(song.id)} style={{ background: 'none', border: 'none', color: '#ffaaaa', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
