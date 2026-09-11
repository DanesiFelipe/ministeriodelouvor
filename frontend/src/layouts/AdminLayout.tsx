import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LogOut, Users, Music, Calendar, Bell, Guitar, LayoutDashboard, Shield, Smartphone } from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<{name: string, role: string} | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userDataStr = localStorage.getItem('user');
    if (!token || !userDataStr) { navigate('/login'); return; }
    try { setUser(JSON.parse(userDataStr)); } catch { navigate('/login'); }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');
  const isExact = (path: string) => location.pathname === path;

  const navLinkStyle = (path: string, exact = false) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '0.7rem 1rem',
    borderRadius: '8px',
    color: (exact ? isExact(path) : isActive(path)) ? 'white' : 'rgba(255,255,255,0.5)',
    background: (exact ? isExact(path) : isActive(path)) ? 'rgba(86,155,103,0.18)' : 'transparent',
    border: (exact ? isExact(path) : isActive(path)) ? '1px solid rgba(86,155,103,0.25)' : '1px solid transparent',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontFamily: 'var(--font-body)',
    fontWeight: '500',
    transition: 'all 0.18s ease',
    cursor: 'pointer',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="sidebar" style={{
        width: '260px',
        background: 'rgba(3, 20, 14, 0.6)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
      }}>
        {/* Brand */}
        <div style={{ marginBottom: '2rem', padding: '0.5rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, #569B67, #3a7a4a)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Guitar size={18} color="white" />
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-heading)', fontWeight: '600', fontSize: '0.95rem', lineHeight: 1.1 }}>Ministério</p>
              <p style={{ fontFamily: 'var(--font-heading)', fontWeight: '400', fontSize: '0.95rem', lineHeight: 1.1, opacity: 0.6 }}>de Louvor</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '1.5rem' }} />

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
          <p style={{ fontSize: '0.65rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', padding: '0 1rem', marginBottom: '0.5rem' }}>
            Principal
          </p>
          
          <a href="/admin/dashboard" style={navLinkStyle('/admin/dashboard', true) as any}>
            <LayoutDashboard size={17} />
            Visão Geral
          </a>
          
          <a href="/admin/services" style={navLinkStyle('/admin/services') as any}>
            <Calendar size={17} />
            Agenda & Escalas
          </a>

          <a href="/admin/songs" style={navLinkStyle('/admin/songs') as any}>
            <Music size={17} />
            Biblioteca de Músicas
          </a>

          <a href="/admin/bands" style={navLinkStyle('/admin/bands') as any}>
            <Guitar size={17} />
            Bandas
          </a>

          {user.role === 'ADMIN' && (
            <>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.7rem 0' }} />
              <p style={{ fontSize: '0.65rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', padding: '0 1rem', marginBottom: '0.5rem' }}>
                Administração
              </p>

              <a href="/admin/notices" style={navLinkStyle('/admin/notices') as any}>
                <Bell size={17} />
                Mural de Avisos
              </a>

              <a href="/admin/whatsapp" style={navLinkStyle('/admin/whatsapp') as any}>
                <Smartphone size={17} />
                WhatsApp
              </a>

              <a href="/admin/members" style={navLinkStyle('/admin/members') as any}>
                <Users size={17} />
                Membros
              </a>

              <a href="/admin/roles" style={navLinkStyle('/admin/roles') as any}>
                <Shield size={17} />
                Funções Musicais
              </a>
            </>
          )}
        </nav>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              width: '34px', height: '34px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: '600',
              flexShrink: 0
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
              <span style={{
                fontSize: '0.7rem',
                background: user.role === 'ADMIN' ? 'rgba(255,180,80,0.15)' : 'rgba(86,155,103,0.15)',
                color: user.role === 'ADMIN' ? '#ffb450' : '#a7cfa8',
                padding: '0.1rem 0.4rem',
                borderRadius: '4px',
              }}>
                {user.role === 'ADMIN' ? 'Admin' : 'Membro'}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            background: 'rgba(224,92,92,0.08)', border: '1px solid rgba(224,92,92,0.2)',
            color: '#e05c5c', cursor: 'pointer', fontFamily: 'var(--font-body)',
            fontSize: '0.8rem', padding: '0.55rem 1rem', borderRadius: '8px', width: '100%',
            transition: 'background 0.15s'
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(224,92,92,0.18)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(224,92,92,0.08)')}
          >
            <LogOut size={15} /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{ flex: 1, marginLeft: '260px', padding: '2.5rem', overflowY: 'auto', minHeight: '100vh' }}>
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="bottom-nav">
        <ul className="bottom-nav-list">
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "bottom-nav-item active" : "bottom-nav-item"}>
            <LayoutDashboard size={20} />
            <span>Início</span>
          </NavLink>
          <NavLink to="/admin/services" className={({ isActive }) => isActive ? "bottom-nav-item active" : "bottom-nav-item"}>
            <Calendar size={20} />
            <span>Cultos</span>
          </NavLink>
          <NavLink to="/admin/members" className={({ isActive }) => isActive ? "bottom-nav-item active" : "bottom-nav-item"}>
            <Users size={20} />
            <span>Membros</span>
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin/whatsapp" className={({ isActive }) => isActive ? "bottom-nav-item active" : "bottom-nav-item"}>
              <Smartphone size={20} />
              <span>WhatsApp</span>
            </NavLink>
          )}
        </ul>
      </nav>
    </div>
  );
}
