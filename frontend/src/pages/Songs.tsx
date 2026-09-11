import { API_URL } from '../config';
import { useEffect, useState } from 'react';
import { Trash2, Edit2, Plus, Music, ExternalLink, Search } from 'lucide-react';

interface Song {
  id: string;
  title: string;
  artist: string | null;
  key: string | null;
  links: string | null;
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

const KEYS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  'Cm', 'C#m', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bbm', 'Bm'];

export default function Songs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [key, setKey] = useState('');
  const [links, setLinks] = useState('');

  const fetchSongs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/songs`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      setSongs(await res.json());
    } catch { alert('Erro ao carregar músicas'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSongs(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingId ? `${API_URL}/api/songs/${editingId}` : `${API_URL}/api/songs`;
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, artist, key, links })
      });
      if (!res.ok) throw new Error();
      setShowModal(false);
      setTitle(''); setArtist(''); setKey(''); setLinks(''); setEditingId(null);
      fetchSongs();
    } catch { alert('Erro ao salvar música'); }
  };

  const editSong = (s: Song) => {
    setEditingId(s.id); setTitle(s.title); setArtist(s.artist || '');
    setKey(s.key || ''); setLinks(s.links || ''); setShowModal(true);
  };

  const deleteSong = async (id: string) => {
    if (!window.confirm('Excluir esta música da biblioteca?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/songs/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      fetchSongs();
    } catch { alert('Erro ao excluir (você pode não ter permissão)'); }
  };

  const filtered = songs.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    (s.artist || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Biblioteca de Músicas</h1>
          <p className="page-subtitle">{songs.length} músicas no acervo do Ministério</p>
        </div>
        <button onClick={() => { setShowModal(true); setEditingId(null); setTitle(''); setArtist(''); setKey(''); setLinks(''); }}
          className="btn btn-primary">
          <Plus size={18} /> Nova Música
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
        <input
          placeholder="Buscar por título ou artista..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, paddingLeft: '2.8rem' }}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <h2 style={{ marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Music size={22} color="var(--color-light)" />
              {editingId ? 'Editar Música' : 'Adicionar Música'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginBottom: '1.5rem', fontFamily: 'var(--font-body)' }}>
              Preencha os dados da música para o acervo.
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Título *</label>
                <input placeholder="Ex: Grande é o Senhor" required value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Artista / Banda</label>
                <input placeholder="Ex: Hillsong United" value={artist} onChange={e => setArtist(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Tom Original</label>
                <select value={key} onChange={e => setKey(e.target.value)} style={inputStyle}>
                  <option value="" style={{ background: '#06392D' }}>Selecione o tom...</option>
                  {KEYS.map(k => <option key={k} value={k} style={{ background: '#06392D' }}>{k}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Link YouTube / Cifra</label>
                <input placeholder="https://youtube.com/..." value={links} onChange={e => setLinks(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner"><Music size={20} /> Carregando biblioteca...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {filtered.map(song => (
            <div key={song.id} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '1.3rem',
              transition: 'all 0.2s',
              position: 'relative',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              {/* Actions */}
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.3rem' }}>
                <button onClick={() => editSong(song)} title="Editar" style={{ background: 'rgba(255,255,255,0.07)', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '0.3rem', borderRadius: '6px', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'white'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; }}>
                  <Edit2 size={14} />
                </button>
                <button onClick={() => deleteSong(song.id)} title="Excluir" style={{ background: 'rgba(224,92,92,0.1)', border: 'none', color: 'rgba(224,92,92,0.6)', cursor: 'pointer', padding: '0.3rem', borderRadius: '6px', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#e05c5c'; (e.currentTarget as HTMLElement).style.background = 'rgba(224,92,92,0.2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(224,92,92,0.6)'; (e.currentTarget as HTMLElement).style.background = 'rgba(224,92,92,0.1)'; }}>
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Music Icon */}
              <div style={{ width: '40px', height: '40px', background: 'rgba(86,155,103,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.9rem' }}>
                <Music size={20} color="var(--color-light)" />
              </div>

              {/* Title */}
              <h3 style={{ fontSize: '1rem', fontWeight: '600', fontFamily: 'var(--font-heading)', marginBottom: '0.2rem', paddingRight: '4rem', lineHeight: 1.2 }}>
                {song.title}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', fontFamily: 'var(--font-body)', marginBottom: '1rem' }}>
                {song.artist || 'Artista desconhecido'}
              </p>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.8rem' }}>
                <span className="badge badge-gray" style={{ fontSize: '0.78rem' }}>
                  🎵 Tom: {song.key || '?'}
                </span>
                {song.links && (
                  <a href={song.links} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-info)', fontSize: '0.78rem', fontFamily: 'var(--font-body)' }}
                    onClick={e => e.stopPropagation()}>
                    <ExternalLink size={12} /> YouTube
                  </a>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <Music size={48} />
              <p>{search ? `Nenhuma música encontrada para "${search}"` : 'Nenhuma música cadastrada ainda.'}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
