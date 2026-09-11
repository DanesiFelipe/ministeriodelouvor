import { API_URL } from '../config';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Music, Bell, ChevronRight, Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{name: string, role: string} | null>(null);
  const [nextService, setNextService] = useState<any>(null);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
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
      const [servicesRes, noticesRes] = await Promise.all([
        fetch(`${API_URL}/api/services`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/notices`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const services = await servicesRes.json();
      const noticesData = await noticesRes.json();
      
      setAllServices(services);
      setNotices(noticesData.slice(0, 3)); // Pega os 3 mais recentes
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

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '2.5rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(167,207,168,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            {getGreeting()},
          </p>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '700', lineHeight: 1.1 }}>
            {user?.name || 'bem-vindo'} 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1rem 1.8rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cultos agendados</p>
          <p style={{ fontSize: '2.8rem', fontWeight: '700', lineHeight: 1 }}>{loading ? '—' : allServices.length}</p>
        </div>
      </div>

      {/* Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

        {/* Próxima Escala */}
        <div
          onClick={() => nextService && navigate(`/admin/services/${nextService.id}`)}
          onMouseEnter={e => { if (nextService) { (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(167,207,168,0.15)'; }}}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
          style={{
            background: 'linear-gradient(135deg, rgba(167,207,168,0.12) 0%, rgba(255,255,255,0.03) 100%)',
            border: '1px solid rgba(167,207,168,0.25)',
            borderRadius: '18px',
            padding: '1.8rem',
            cursor: nextService ? 'pointer' : 'default',
            transition: 'transform 0.25s, box-shadow 0.25s',
            position: 'relative',
            overflow: 'hidden',
          }}>
          <div style={{ position: 'absolute', bottom: '-30px', right: '-30px', opacity: 0.06 }}><Calendar size={110} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
            <div style={{ background: 'rgba(167,207,168,0.2)', borderRadius: '12px', padding: '0.7rem', display: 'inline-flex' }}>
              <Calendar size={22} color="#a7cfa8" />
            </div>
            {nextService && <ChevronRight size={16} style={{ opacity: 0.35, marginTop: '0.3rem' }} />}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.6rem' }}>Próxima Escala</p>
          {loading ? <p style={{ color: 'rgba(255,255,255,0.3)' }}>Carregando...</p>
            : nextService ? (
              <>
                <p style={{ fontSize: '1.9rem', fontWeight: '700', lineHeight: 1.1, textTransform: 'capitalize' }}>{dayName}</p>
                <p style={{ fontSize: '1rem', color: '#a7cfa8', fontWeight: '600', marginTop: '0.3rem' }}>{dayNum} · {nextService.time}</p>
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Users size={16} style={{ color: '#a7cfa8' }} />
                  <p style={{ fontSize: '1.15rem', fontWeight: '600', color: 'white' }}>
                    {hasSchedule ? (nextService.schedules[0].band?.name || 'Avulso') : 'Sem escala definida'}
                  </p>
                </div>
              </>
            ) : <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1rem' }}>Nenhum culto agendado.</p>
          }
        </div>

        {/* Repertório */}
        <div
          onClick={() => nextService && navigate(`/admin/services/${nextService.id}`)}
          onMouseEnter={e => { if (nextService) (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
          style={{
            background: hasRepertoire
              ? 'linear-gradient(135deg, rgba(100,180,255,0.12) 0%, rgba(255,255,255,0.03) 100%)'
              : 'linear-gradient(135deg, rgba(255,180,80,0.1) 0%, rgba(255,255,255,0.03) 100%)',
            border: hasRepertoire ? '1px solid rgba(100,180,255,0.25)' : '1px solid rgba(255,180,80,0.25)',
            borderRadius: '18px',
            padding: '1.8rem',
            cursor: nextService ? 'pointer' : 'default',
            transition: 'transform 0.25s',
            position: 'relative',
            overflow: 'hidden',
          }}>
          <div style={{ position: 'absolute', bottom: '-30px', right: '-30px', opacity: 0.06 }}><Music size={110} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
            <div style={{ background: hasRepertoire ? 'rgba(100,180,255,0.2)' : 'rgba(255,180,80,0.2)', borderRadius: '12px', padding: '0.7rem', display: 'inline-flex' }}>
              <Music size={22} color={hasRepertoire ? '#64b4ff' : '#ffb450'} />
            </div>
            {nextService && <ChevronRight size={16} style={{ opacity: 0.35, marginTop: '0.3rem' }} />}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.6rem' }}>Repertório Atual</p>
          {loading ? <p style={{ color: 'rgba(255,255,255,0.3)' }}>Carregando...</p>
            : hasRepertoire ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircle2 size={22} color="#64b4ff" />
                  <p style={{ fontSize: '1.9rem', fontWeight: '700', color: '#64b4ff' }}>Enviado</p>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.8rem' }}>Músicas prontas para o próximo culto.</p>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Clock size={22} color="#ffb450" />
                  <p style={{ fontSize: '1.9rem', fontWeight: '700', color: '#ffb450' }}>Pendente</p>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.8rem' }}>O Ministro ainda não adicionou as músicas.</p>
              </>
            )
          }
        </div>

        {/* Avisos */}
        <div 
          onClick={() => navigate('/admin/notices')}
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '18px',
            padding: '1.8rem',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer'
          }}
        >
          <div style={{ position: 'absolute', bottom: '-30px', right: '-30px', opacity: 0.05 }}><Bell size={110} /></div>
          <div style={{ marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '12px', padding: '0.7rem', display: 'inline-flex' }}>
              <Bell size={22} color="rgba(255,255,255,0.4)" />
            </div>
            <ChevronRight size={16} style={{ opacity: 0.35, marginTop: '0.3rem' }} />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.6rem' }}>Mural de Avisos</p>
          
          {loading ? (
            <p style={{ color: 'rgba(255,255,255,0.3)' }}>Carregando...</p>
          ) : notices.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {notices.map(notice => (
                <div key={notice.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  <p style={{ fontSize: '0.95rem', fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>{notice.title}</p>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                    Por {notice.createdBy.name} · {new Date(notice.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <AlertCircle size={20} style={{ opacity: 0.35 }} />
                <p style={{ fontSize: '1.4rem', fontWeight: '600', opacity: 0.5 }}>Nenhum aviso</p>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.8rem' }}>Sem comunicados recentes.</p>
            </>
          )}
        </div>
      </div>

      {/* Upcoming Timeline */}
      {!loading && upcomingServices.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '1.8rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.5rem' }}>
            Próximos Cultos
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {upcomingServices.map((service: any, index: number) => {
              const d = new Date(service.date);
              const isNext = index === 0;
              const hasRep = service.repertoires?.length > 0;
              return (
                <div
                  key={service.id}
                  onClick={() => navigate(`/admin/services/${service.id}`)}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isNext ? 'rgba(167,207,168,0.12)' : 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isNext ? 'rgba(167,207,168,0.06)' : 'rgba(255,255,255,0.02)'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1.2rem',
                    padding: '1rem 1.2rem',
                    background: isNext ? 'rgba(167,207,168,0.06)' : 'rgba(255,255,255,0.02)',
                    border: isNext ? '1px solid rgba(167,207,168,0.18)' : '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'background 0.18s',
                  }}>
                  <div style={{ textAlign: 'center', minWidth: '44px' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700', lineHeight: 1 }}>{d.getDate().toString().padStart(2, '0')}</p>
                    <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>{d.toLocaleDateString('pt-BR', { month: 'short' })}</p>
                  </div>
                  <div style={{ width: '1px', height: '36px', background: 'rgba(255,255,255,0.08)' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      Culto de {service.type}
                      {isNext && <span style={{ fontSize: '0.65rem', background: 'rgba(167,207,168,0.2)', color: '#a7cfa8', padding: '0.15rem 0.45rem', borderRadius: '5px' }}>Próximo</span>}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.2rem' }}>
                      {service.schedules?.[0]?.band?.name || 'Sem banda definida'} · {service.time}
                    </p>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    fontSize: '0.73rem', fontWeight: '500',
                    color: hasRep ? '#a7cfa8' : '#ffb450',
                    background: hasRep ? 'rgba(167,207,168,0.1)' : 'rgba(255,180,80,0.1)',
                    padding: '0.3rem 0.7rem', borderRadius: '8px'
                  }}>
                    {hasRep ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {hasRep ? 'OK' : 'Pendente'}
                  </div>
                  <ChevronRight size={15} style={{ opacity: 0.25 }} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


