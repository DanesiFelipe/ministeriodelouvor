import { API_URL } from '../config';
import { useEffect, useState } from 'react';
import { Calendar, Plus, Users, Music, ChevronRight, CheckCircle2, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Service {
  id: string;
  type: string;
  date: string;
  time: string;
  status: string;
  schedules: any[];
  repertoires: any[];
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

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);
  const [formType, setFormType] = useState('DOMINGO');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('18:30');
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setIsAdmin(user.role === 'ADMIN');
    } catch (e) {}
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/services`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setServices(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const createService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: formType, date: formDate, time: formTime })
      });
      setShowModal(false);
      setFormDate(''); setFormType('DOMINGO'); setFormTime('18:30');
      fetchServices();
    } catch (err) { alert('Erro ao criar culto'); }
  };

  const generateMonth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/services/generate-month`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ month: genMonth, year: genYear })
      });
      setShowGenModal(false);
      fetchServices();
      alert('Mês gerado com sucesso!');
    } catch (err) { alert('Erro ao gerar mês'); }
  };

  const now = new Date(); now.setHours(0, 0, 0, 0);
  const upcoming = services.filter(s => new Date(s.date) >= now);
  const past = services.filter(s => new Date(s.date) < now);

  const ServiceCard = ({ s }: { s: Service }) => {
    const dateObj = new Date(s.date);
    const hasRep = s.repertoires && s.repertoires.length > 0;
    const hasSched = s.schedules && s.schedules.length > 0;
    const dayNum = dateObj.getDate().toString().padStart(2, '0');
    const monthStr = dateObj.toLocaleDateString('pt-BR', { month: 'short' });
    const dayStr = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' });

    return (
      <div
        onClick={() => navigate(`/admin/services/${s.id}`)}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(86,155,103,0.3)';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        }}
      >
        <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
          {/* Date Badge */}
          <div style={{
            textAlign: 'center',
            minWidth: '50px',
            background: 'rgba(86,155,103,0.12)',
            border: '1px solid rgba(86,155,103,0.2)',
            borderRadius: '10px',
            padding: '0.5rem',
          }}>
            <p style={{ fontSize: '1.6rem', fontWeight: '700', lineHeight: 1, color: '#a7cfa8' }}>{dayNum}</p>
            <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginTop: '0.1rem' }}>{monthStr}</p>
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontWeight: '600', fontSize: '1.05rem', textTransform: 'capitalize' }}>{dayStr}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', marginTop: '0.2rem' }}>Culto de {s.type} · {s.time}</p>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.9rem', flexWrap: 'wrap' }}>
              <span className={`badge ${hasSched ? 'badge-green' : 'badge-gray'}`}>
                {hasSched ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                {hasSched ? 'Escala OK' : 'Sem Escala'}
              </span>
              <span className={`badge ${hasRep ? 'badge-blue' : 'badge-orange'}`}>
                {hasRep ? <Music size={11} /> : <Clock size={11} />}
                {hasRep ? 'Repertório OK' : 'Repertório Pendente'}
              </span>
            </div>
          </div>
          <ChevronRight size={16} style={{ opacity: 0.25, marginTop: '0.3rem', flexShrink: 0 }} />
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Agenda & Escalas</h1>
          <p className="page-subtitle">Gerencie os cultos e escalas do Ministério.</p>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setShowGenModal(true)} className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>
              <Sparkles size={16} /> Gerar Mês
            </button>
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              <Plus size={18} /> Novo Culto
            </button>
          </div>
        )}
      </div>

      {/* Modal Novo Culto */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={22} color="var(--color-light)" /> Novo Culto
            </h2>
            <form onSubmit={createService} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>Tipo de Culto</label>
                <select value={formType} onChange={e => setFormType(e.target.value)} style={{ ...inputStyle }}>
                  <option value="DOMINGO" style={{ background: '#06392D' }}>DOMINGO</option>
                  <option value="QUINTA" style={{ background: '#06392D' }}>QUINTA-FEIRA</option>
                  <option value="ESPECIAL" style={{ background: '#06392D' }}>ESPECIAL</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>Data</label>
                <input type="date" required value={formDate} onChange={e => setFormDate(e.target.value)} style={{ ...inputStyle }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>Horário</label>
                <input type="time" required value={formTime} onChange={e => setFormTime(e.target.value)} style={{ ...inputStyle }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Criar Culto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Gerar Mês */}
      {showGenModal && (
        <div className="modal-overlay" onClick={() => setShowGenModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={22} color="var(--color-light)" /> Gerar Mês Completo
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Cria automaticamente todos os cultos de domingo do mês selecionado.
            </p>
            <form onSubmit={generateMonth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>Mês</label>
                  <select value={genMonth} onChange={e => setGenMonth(Number(e.target.value))} style={{ ...inputStyle }}>
                    {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map((m, i) => (
                      <option key={i+1} value={i+1} style={{ background: '#06392D' }}>{m}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>Ano</label>
                  <input type="number" value={genYear} onChange={e => setGenYear(Number(e.target.value))} style={{ ...inputStyle }} min="2020" max="2030" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowGenModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}><Sparkles size={16} /> Gerar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner"><Clock size={20} /> Carregando cultos...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section>
              <p style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: '1rem' }}>
                Próximos Cultos ({upcoming.length})
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {upcoming.map(s => <ServiceCard key={s.id} s={s} />)}
              </div>
            </section>
          )}

          {/* Past */}
          {past.length > 0 && (
            <section>
              <p style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginBottom: '1rem' }}>
                Cultos Anteriores ({past.length})
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', opacity: 0.55 }}>
                {past.map(s => <ServiceCard key={s.id} s={s} />)}
              </div>
            </section>
          )}

          {services.length === 0 && (
            <div className="empty-state">
              <Calendar size={48} />
              <p>Nenhum culto agendado ainda.</p>
              {isAdmin && <p style={{ fontSize: '0.8rem' }}>Clique em "Gerar Mês" para começar.</p>}
            </div>
          )}
        </div>
      )}
    </>
  );
}
