import { API_URL } from '../config';
import { useEffect, useState } from 'react';
import { Trash2, Edit2, Plus, Music, ExternalLink, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface Song {
  id: string;
  title: string;
  artist: string | null;
  key: string | null;
  links: string | null;
}

const inputStyle: React.CSSProperties = {
  padding: '0.65rem 0.9rem',
  borderRadius: '6px',
  background: 'rgba(255,255,255,0.05)',
  color: 'rgba(255,255,255,0.9)',
  border: '1px solid rgba(255,255,255,0.1)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.9rem',
  outline: 'none',
  width: '100%',
  transition: 'border-color 140ms ease',
};

const KEYS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  'Cm', 'C#m', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bbm', 'Bm'];

/* Key → hue map for subtle color coding */
const KEY_HUES: Record<string, number> = {
  C: 0, D: 30, E: 280, F: 240, G: 190, A: 160, B: 120
};
function getKeyHue(k: string | null): number {
  if (!k) return 0;
  return KEY_HUES[k.replace(/[#bm]/g, '')] ?? 0;
}

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

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canEdit = user.role === 'ADMIN' || user.isMinistro;

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
    const token = localStorage.getItem('token');
    const url = editingId ? `${API_URL}/api/songs/${editingId}` : `${API_URL}/api/songs`;
    const req = fetch(url, {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, artist, key, links })
    }).then(async res => {
      if (!res.ok) throw new Error();
      setShowModal(false);
      setTitle(''); setArtist(''); setKey(''); setLinks(''); setEditingId(null);
      fetchSongs();
    });

    toast.promise(req, {
      loading: 'Salvando música...',
      success: 'Música salva com sucesso!',
      error: 'Erro ao salvar música'
    });
  };

  const editSong = (song: Song) => {
    setEditingId(song.id);
    setTitle(song.title);
    setArtist(song.artist || '');
    setKey(song.key || '');
    setLinks(song.links || '');
    setShowModal(true);
  };

  const deleteSong = async (id: string) => {
    if (!window.confirm('Deseja excluir esta música do acervo?')) return;
    const token = localStorage.getItem('token');
    const req = fetch(`${API_URL}/api/songs/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }).then(async res => {
      if (!res.ok) throw new Error();
      fetchSongs();
    });

    toast.promise(req, {
      loading: 'Excluindo música...',
      success: 'Música excluída!',
      error: 'Erro ao excluir'
    });
  };

  const filtered = songs.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    (s.artist || '').toLowerCase().includes(search.toLowerCase())
  );

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.35rem',
    fontSize: '0.78rem',
    fontWeight: '500',
    color: 'rgba(255,255,255,0.4)',
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Biblioteca de Músicas</h1>
          <p className="page-subtitle">{songs.length} músicas no acervo do Ministério</p>
        </div>
        {canEdit && (
          <button
            onClick={() => { setShowModal(true); setEditingId(null); setTitle(''); setArtist(''); setKey(''); setLinks(''); }}
            className="btn btn-primary"
          >
            <Plus size={16} /> Nova Música
          </button>
        )}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search
          size={15}
          style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }}
        />
        <input
          placeholder="Buscar por título ou artista..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, paddingLeft: '2.5rem' }}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <h2 className="modal-title">{editingId ? 'Editar Música' : 'Adicionar Música'}</h2>
            <p className="modal-subtitle">Preencha os dados da música para o acervo.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Título *</label>
                <input placeholder="Ex: Grande é o Senhor" required value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Artista / Banda</label>
                <input placeholder="Ex: Hillsong United" value={artist} onChange={e => setArtist(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Tom Original</label>
                <select value={key} onChange={e => setKey(e.target.value)} style={inputStyle}>
                  <option value="" style={{ background: '#0c3d2c' }}>Selecione o tom...</option>
                  {KEYS.map(k => <option key={k} value={k} style={{ background: '#0c3d2c' }}>{k}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Link YouTube / Cifra</label>
                <input placeholder="https://youtube.com/..." value={links} onChange={e => setLinks(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner"><Music size={18} /> Carregando biblioteca...</div>
      ) : (
        <>
          {/* Songs as a table-like list */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            {filtered.map((song, index) => {
              const hue = getKeyHue(song.key);
              const keyColor = song.key
                ? `hsl(${hue}, 55%, 65%)`
                : 'rgba(255,255,255,0.3)';

              return (
                <div
                  key={song.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.9rem 1.25rem',
                    borderBottom: index < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    transition: 'background 140ms ease',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  {/* Key badge */}
                  <span style={{
                    flexShrink: 0,
                    width: '32px',
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: keyColor,
                    background: `hsla(${hue}, 55%, 65%, 0.12)`,
                    borderRadius: '4px',
                    padding: '0.2rem 0',
                  }}>
                    {song.key || '?'}
                  </span>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: '500', color: 'rgba(255,255,255,0.88)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {song.title}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.32)', marginTop: '0.1rem' }}>
                      {song.artist || 'Artista desconhecido'}
                    </p>
                  </div>

                  {/* Link */}
                  {song.links && (
                    <a
                      href={song.links}
                      target="_blank"
                      rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-info)', fontSize: '0.78rem', flexShrink: 0 }}
                    >
                      <ExternalLink size={12} />
                      <span className="hide-mobile">Ver</span>
                    </a>
                  )}

                  {/* Actions */}
                  {canEdit && (
                    <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                      <button
                        onClick={() => editSong(song)}
                        title="Editar"
                        style={{
                          background: 'none', border: 'none', color: 'rgba(255,255,255,0.28)',
                          cursor: 'pointer', padding: '0.35rem', borderRadius: '5px',
                          display: 'flex', alignItems: 'center', transition: 'color 140ms ease, background 140ms ease',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.28)'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteSong(song.id)}
                        title="Excluir"
                        style={{
                          background: 'none', border: 'none', color: 'rgba(217,96,96,0.45)',
                          cursor: 'pointer', padding: '0.35rem', borderRadius: '5px',
                          display: 'flex', alignItems: 'center', transition: 'color 140ms ease, background 140ms ease',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-danger)'; (e.currentTarget as HTMLElement).style.background = 'rgba(217,96,96,0.08)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(217,96,96,0.45)'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="empty-state">
                <Music size={40} />
                <p>{search ? `Nenhuma música encontrada para "${search}"` : 'Nenhuma música cadastrada ainda.'}</p>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
