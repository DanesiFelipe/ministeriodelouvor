import { API_URL } from '../config';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Music, Bell, ChevronRight, Users, CheckCircle2, Clock } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{name: string, role: string, isMinistro?: boolean} | null>(null);
  const [nextService, setNextService] = useState<any>(null);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [mySchedules, setMySchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userDataStr = localStorage.getItem('user');
    if (userDataStr) {
      try { setUser(JSON.parse(userDataStr)); } catch {}
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [servicesRes, noticesRes, mySchedulesRes] = await Promise.all([
        fetch(`${API_URL}/api/services`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/notices`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/schedules/my-schedules`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const services = await servicesRes.json();
      const noticesData = await noticesRes.json();
      const mySchedulesData = await mySchedulesRes.json();

      setAllServices(services);
      setNotices(noticesData.slice(0, 3));
      setMySchedules(mySchedulesData || []);

      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const upcoming = services.find((s: any) => new Date(s.date) >= now);
      setNextService(upcoming);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasRepertoire = nextService?.repertoires?.length > 0;
  const hasSchedule = nextService?.schedules?.length > 0;
  const nextDate = nextService ? new Date(nextService.date) : null;
  const dayName = nextDate ? nextDate.toLocaleDateString('pt-BR', { weekday: 'long' }) : '';
  const dayNum = nextDate ? nextDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '';
  const upcomingServices = allServices.filter((s: any) => {
    const d = new Date(s.date); d.setHours(0,0,0,0);
    const now = new Date(); now.setHours(0,0,0,0);
    return d >= now;
  }).slice(0, 5);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const surfaceCard: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px',
    padding: '1.5rem',
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>

      {/* Greeting */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.78rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.4rem' }}>
          {getGreeting()}
        </p>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '600', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
          {user?.name || 'Bem-vindo'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.3)', marginTop: '0.3rem', fontSize: '0.875rem' }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          <span style={{ marginLeft: '0.75rem', color: 'rgba(255,255,255,0.18)' }}>·</span>
          <span style={{ marginLeft: '0.75rem' }}>{loading ? '—' : allServices.length} cultos agendados</span>
        </p>
      </div>

      {/* My Schedules */}
      {!loading && mySchedules.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.28)', marginBottom: '1rem' }}>
            Minhas Escalas
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {mySchedules.map((schedule: any) => {
              const d = new Date(schedule.service.date);
              const dayStr = d.toLocaleDateString('pt-BR', { weekday: 'long' });
              const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
              const myRoles = schedule.participants.map((p: any) => p.role.name).join(', ');

              return (
                <div
                  key={schedule.id}
                  onClick={() => navigate(`/admin/services/${schedule.service.id}`)}
                  style={{
                    ...surfaceCard,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    cursor: 'pointer',
                    transition: 'background 140ms ease',
                    padding: '1rem 1.25rem',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.055)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}
                >
                  {/* Date block */}
                  <div style={{ textAlign: 'center', minWidth: '42px', flexShrink: 0 }}>
                    <p style={{ fontSize: '1.1rem', fontWeight: '700', lineHeight: 1, color: 'var(--color-accent-hi)' }}>{dateStr.split('/')[0]}</p>
                    <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginTop: '0.15rem' }}>{d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</p>
                  </div>
                  <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: '500', textTransform: 'capitalize', marginBottom: '0.15rem' }}>{dayStr}</p>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)' }}>
                      {schedule.service.type} · {schedule.service.time} · <span style={{ color: 'rgba(255,255,255,0.55)' }}>{myRoles}</span>
                    </p>
                  </div>
                  <ChevronRight size={15} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>

        {/* Próxima Escala */}
        <div
          onClick={() => nextService && navigate(`/admin/services/${nextService.id}`)}
          style={{
            ...surfaceCard,
            cursor: nextService ? 'pointer' : 'default',
            transition: 'background 140ms ease',
          }}
          onMouseEnter={e => { if (nextService) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.055)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={15} style={{ color: 'var(--color-accent-hi)' }} />
              <p style={{ fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)' }}>Próxima Escala</p>
            </div>
            {nextService && <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.2)' }} />}
          </div>

          {loading ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>Carregando...</p>
          ) : nextService ? (
            <>
              <p style={{ fontSize: '1.5rem', fontWeight: '600', textTransform: 'capitalize', letterSpacing: '-0.01em', lineHeight: 1.2 }}>{dayName}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-accent-hi)', marginTop: '0.25rem' }}>{dayNum} · {nextService.time}</p>
              <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Users size={13} />
                {hasSchedule ? (nextService.schedules[0].band?.name || 'Avulso') : 'Sem escala definida'}
              </p>
            </>
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>Nenhum culto agendado.</p>
          )}
        </div>

        {/* Repertório */}
        <div
          onClick={() => nextService && navigate(`/admin/services/${nextService.id}`)}
          style={{
            ...surfaceCard,
            cursor: nextService ? 'pointer' : 'default',
            transition: 'background 140ms ease',
          }}
          onMouseEnter={e => { if (nextService) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.055)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Music size={15} style={{ color: hasRepertoire ? 'var(--color-info)' : 'var(--color-warning)' }} />
              <p style={{ fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)' }}>Repertório</p>
            </div>
            {nextService && <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.2)' }} />}
          </div>

          {loading ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>Carregando...</p>
          ) : hasRepertoire ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--color-info)', flexShrink: 0 }} />
                <p style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--color-info)' }}>Enviado</p>
              </div>
              <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.35)' }}>Músicas prontas para o próximo culto.</p>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Clock size={16} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
                <p style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--color-danger)' }}>Pendente</p>
              </div>
              <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.35)' }}>O Ministro ainda não adicionou as músicas.</p>
            </>
          )}
        </div>

        {/* Avisos */}
        <div
          onClick={() => navigate('/admin/notices')}
          style={{ ...surfaceCard, cursor: 'pointer', transition: 'background 140ms ease' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.055)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={15} style={{ color: 'rgba(255,255,255,0.4)' }} />
              <p style={{ fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)' }}>Mural de Avisos</p>
            </div>
            <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.2)' }} />
          </div>

          {loading ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem' }}>Carregando...</p>
          ) : notices.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notices.map(notice => (
                <div key={notice.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.6rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'rgba(255,255,255,0.85)' }}>{notice.title}</p>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.32)', marginTop: '0.15rem' }}>
                    {notice.createdBy.name} · {new Date(notice.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.28)' }}>Sem comunicados recentes.</p>
          )}
        </div>
      </div>

      {/* Upcoming timeline */}
      {!loading && upcomingServices.length > 0 && (
        <div>
          <p style={{ fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.28)', marginBottom: '1rem' }}>
            Próximos Cultos
          </p>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
            {upcomingServices.map((service: any, index: number) => {
              const d = new Date(service.date);
              const isNext = index === 0;
              const hasRep = service.repertoires?.length > 0;
              return (
                <div
                  key={service.id}
                  onClick={() => navigate(`/admin/services/${service.id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.9rem 1.25rem',
                    borderBottom: index < upcomingServices.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    cursor: 'pointer',
                    transition: 'background 140ms ease',
                    background: isNext ? 'rgba(78,148,96,0.06)' : 'transparent',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isNext ? 'rgba(78,148,96,0.1)' : 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isNext ? 'rgba(78,148,96,0.06)' : 'transparent'}
                >
                  {/* Date */}
                  <div style={{ textAlign: 'center', minWidth: '36px', flexShrink: 0 }}>
                    <p style={{ fontSize: '1rem', fontWeight: '700', lineHeight: 1, color: isNext ? 'var(--color-accent-hi)' : 'rgba(255,255,255,0.7)' }}>
                      {d.toLocaleDateString('pt-BR', { day: '2-digit' })}
                    </p>
                    <p style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: '0.1rem' }}>
                      {d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                    </p>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: isNext ? '500' : '400', color: isNext ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.65)', textTransform: 'capitalize' }}>
                      {d.toLocaleDateString('pt-BR', { weekday: 'long' }).replace('-feira', '')}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.32)' }}>{service.time}</span>
                      <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.7rem' }}>·</span>
                      <span style={{ fontSize: '0.75rem', color: hasRep ? 'var(--color-info)' : 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {hasRep ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                        {hasRep ? 'Repertório pronto' : 'Pendente'}
                      </span>
                    </div>
                  </div>

                  <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.18)', flexShrink: 0 }} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
