import { API_URL } from '../config';
import { useEffect, useState } from 'react';
import { Trash2, Plus, Bell, Clock, Megaphone } from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: { name: string; };
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

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'agora mesmo';
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`;
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export default function Notices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/notices`, { headers: { Authorization: `Bearer ${token}` } });
      setNotices(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/notices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, content })
      });
      if (!res.ok) { alert('Erro ao criar aviso'); return; }
      setShowModal(false); setTitle(''); setContent('');
      fetchNotices();
    } catch { alert('Erro ao criar aviso'); }
  };

  const deleteNotice = async (id: string) => {
    if (!window.confirm('Deseja excluir este aviso?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/notices/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotices();
    } catch { alert('Erro ao excluir aviso'); }
  };

  const accentColors = [
    { border: 'rgba(255,180,80,0.5)', bg: 'rgba(255,180,80,0.06)', dot: '#ffb450' },
    { border: 'rgba(86,155,103,0.45)', bg: 'rgba(86,155,103,0.06)', dot: '#a7cfa8' },
    { border: 'rgba(100,180,255,0.4)', bg: 'rgba(100,180,255,0.05)', dot: '#64b4ff' },
    { border: 'rgba(200,120,200,0.4)', bg: 'rgba(200,120,200,0.05)', dot: '#c878c8' },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mural de Avisos</h1>
          <p className="page-subtitle">Comunicados e avisos importantes para toda a equipe.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} /> Novo Aviso
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={22} color="var(--color-warning)" /> Criar Aviso
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginBottom: '1.5rem', fontFamily: 'var(--font-body)' }}>
              O aviso será visível para todos os membros do sistema.
            </p>
            <form onSubmit={handleCreateNotice} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Título *</label>
                <input placeholder="Ex: Ensaio cancelado neste sábado" required value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Mensagem *</label>
                <textarea
                  placeholder="Detalhes do aviso..."
                  required rows={5}
                  value={content} onChange={e => setContent(e.target.value)}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Publicar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner"><Bell size={20} /> Carregando avisos...</div>
      ) : notices.length === 0 ? (
        <div className="empty-state">
          <Megaphone size={48} />
          <p>Nenhum aviso publicado ainda.</p>
          <p style={{ fontSize: '0.8rem' }}>Clique em "Novo Aviso" para criar um comunicado.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notices.map((notice, index) => {
            const accent = accentColors[index % accentColors.length];
            const isFirst = index === 0;
            return (
              <div key={notice.id} style={{
                background: isFirst ? accent.bg : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isFirst ? accent.border : 'rgba(255,255,255,0.07)'}`,
                borderLeft: `4px solid ${accent.dot}`,
                borderRadius: '16px',
                padding: '1.5rem 1.5rem 1.5rem 1.75rem',
                animation: 'slideUp 0.3s ease',
                transition: 'all 0.2s ease',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = accent.bg; (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isFirst ? accent.bg : 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.transform = 'translateX(0)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.9rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      {isFirst && (
                        <span style={{
                          background: 'rgba(255,180,80,0.2)', border: '1px solid rgba(255,180,80,0.35)',
                          borderRadius: '20px', padding: '0.15rem 0.6rem', fontSize: '0.68rem',
                          color: '#ffb450', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase',
                          display: 'flex', alignItems: 'center', gap: '0.3rem'
                        }}>
                          <Bell size={9} /> Recente
                        </span>
                      )}
                      <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', fontWeight: '600', lineHeight: 1.2 }}>
                        {notice.title}
                      </h3>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <Clock size={11} />
                      Por <strong style={{ color: 'rgba(255,255,255,0.55)' }}>{notice.createdBy.name}</strong>
                      &nbsp;·&nbsp;
                      {timeAgo(notice.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteNotice(notice.id)}
                    style={{
                      background: 'rgba(224,92,92,0.08)', border: '1px solid rgba(224,92,92,0.18)',
                      color: 'rgba(224,92,92,0.6)', cursor: 'pointer', padding: '0.45rem',
                      borderRadius: '8px', transition: 'all 0.15s', flexShrink: 0, marginLeft: '1rem',
                      display: 'flex', alignItems: 'center'
                    }}
                    title="Excluir Aviso"
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(224,92,92,0.2)'; (e.currentTarget as HTMLElement).style.color = '#e05c5c'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(224,92,92,0.08)'; (e.currentTarget as HTMLElement).style.color = 'rgba(224,92,92,0.6)'; }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <p style={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.75,
                  color: 'rgba(255,255,255,0.75)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.93rem',
                }}>
                  {notice.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
