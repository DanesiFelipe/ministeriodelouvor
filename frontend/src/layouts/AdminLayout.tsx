import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  LogOut, Users, Music, Calendar, Bell, Guitar,
  LayoutDashboard, Shield, Smartphone, MoreHorizontal, X
} from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<{name: string, role: string, isMinistro?: boolean} | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userDataStr = localStorage.getItem('user');
    if (!token || !userDataStr) { navigate('/login'); return; }
    try { setUser(JSON.parse(userDataStr)); } catch { navigate('/login'); }
  }, [navigate]);

  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');
  const isExact = (path: string) => location.pathname === path;

  const linkStyle = (path: string, exact = false): React.CSSProperties => {
    const active = exact ? isExact(path) : isActive(path);
    return {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.55rem 0.85rem',
      borderRadius: '6px',
      color: active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.48)',
      background: active ? 'rgba(78,148,96,0.16)' : 'transparent',
      border: `1px solid ${active ? 'rgba(78,148,96,0.22)' : 'transparent'}`,
      textDecoration: 'none',
      fontSize: '0.875rem',
      fontFamily: 'var(--font-body)',
      fontWeight: active ? '500' : '400',
      transition: 'color 140ms ease, background 140ms ease, border-color 140ms ease',
      cursor: 'pointer',
    };
  };

  const adminDrawerItems = [
    { path: '/admin/bands',    icon: <Guitar size={19} />,    label: 'Bandas' },
    { path: '/admin/notices',  icon: <Bell size={19} />,      label: 'Mural de Avisos' },
    { path: '/admin/members',  icon: <Users size={19} />,     label: 'Membros' },
    { path: '/admin/roles',    icon: <Shield size={19} />,    label: 'Funções Musicais' },
    { path: '/admin/whatsapp', icon: <Smartphone size={19} />, label: 'WhatsApp' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* SIDEBAR */}
      <aside
        className="sidebar"
        style={{
          width: '240px',
          background: 'rgba(4,18,13,0.85)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.25rem 1rem',
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          zIndex: 100,
          gap: '0',
        }}
      >
        {/* Brand */}
        <div style={{ padding: '0.5rem 0.5rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px', height: '32px',
              background: 'var(--color-accent)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Guitar size={16} color="white" />
            </div>
            <div style={{ lineHeight: 1.25 }}>
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: '600', fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)' }}>Ministério</p>
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: '400', fontSize: '0.8rem', color: 'rgba(255,255,255,0.38)' }}>de Louvor</p>
            </div>
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '1rem' }} />

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', flex: 1 }}>
          <p className="section-label" style={{ marginBottom: '0.6rem' }}>Principal</p>

          <a href="/admin/dashboard" style={linkStyle('/admin/dashboard', true)}>
            <LayoutDashboard size={16} /> Visão Geral
          </a>
          <a href="/admin/services" style={linkStyle('/admin/services')}>
            <Calendar size={16} /> Agenda & Escalas
          </a>
          <a href="/admin/songs" style={linkStyle('/admin/songs')}>
            <Music size={16} /> Biblioteca de Músicas
          </a>
          <a href="/admin/bands" style={linkStyle('/admin/bands')}>
            <Guitar size={16} /> Bandas
          </a>

          {isAdmin && (
            <>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.85rem 0 0.75rem' }} />
              <p className="section-label" style={{ marginBottom: '0.6rem' }}>Administração</p>

              <a href="/admin/notices" style={linkStyle('/admin/notices')}>
                <Bell size={16} /> Mural de Avisos
              </a>
              <a href="/admin/whatsapp" style={linkStyle('/admin/whatsapp')}>
                <Smartphone size={16} /> WhatsApp
              </a>
              <a href="/admin/members" style={linkStyle('/admin/members')}>
                <Users size={16} /> Membros
              </a>
              <a href="/admin/roles" style={linkStyle('/admin/roles')}>
                <Shield size={16} /> Funções Musicais
              </a>
            </>
          )}
        </nav>

        {/* User Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: '30px', height: '30px',
              background: 'rgba(78,148,96,0.25)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-accent-hi)', flexShrink: 0,
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{ fontWeight: '500', fontSize: '0.83rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'rgba(255,255,255,0.85)' }}>
                {user.name}
              </p>
              <p style={{ fontSize: '0.7rem', color: isAdmin ? 'var(--color-warning)' : 'var(--color-accent-hi)', marginTop: '0.05rem' }}>
                {isAdmin ? 'Administrador' : user.isMinistro ? 'Ministro' : 'Membro'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'transparent', border: 'none',
              color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontFamily: 'var(--font-body)',
              fontSize: '0.8rem', padding: '0.45rem 0.5rem', borderRadius: '6px', width: '100%',
              transition: 'color 140ms ease, background 140ms ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--color-danger)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(217,96,96,0.08)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <LogOut size={14} /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main
        className="main-content"
        style={{ flex: 1, marginLeft: '240px', padding: '2rem 2.5rem', overflowY: 'auto', minHeight: '100vh' }}
      >
        <Outlet />
      </main>

      {/* BOTTOM NAV (mobile) */}
      <nav className="bottom-nav">
        <ul className="bottom-nav-list">
          <NavLink to="/admin/dashboard" end
            className={({ isActive }) => isActive ? 'bottom-nav-item active' : 'bottom-nav-item'}>
            <LayoutDashboard size={21} />
            <span>Início</span>
          </NavLink>

          <NavLink to="/admin/services"
            className={({ isActive }) => isActive ? 'bottom-nav-item active' : 'bottom-nav-item'}>
            <Calendar size={21} />
            <span>Cultos</span>
          </NavLink>

          <NavLink to="/admin/songs"
            className={({ isActive }) => isActive ? 'bottom-nav-item active' : 'bottom-nav-item'}>
            <Music size={21} />
            <span>Músicas</span>
          </NavLink>

          <NavLink to="/admin/notices"
            className={({ isActive }) => isActive ? 'bottom-nav-item active' : 'bottom-nav-item'}>
            <Bell size={21} />
            <span>Avisos</span>
          </NavLink>

          <button
            className={`bottom-nav-item ${drawerOpen ? 'active' : ''}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setDrawerOpen(prev => !prev)}
          >
            {drawerOpen ? <X size={21} /> : <MoreHorizontal size={21} />}
            <span>Mais</span>
          </button>
        </ul>
      </nav>

      {/* MOBILE DRAWER */}
      {drawerOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="mobile-drawer" onClick={e => e.stopPropagation()}>
            <div className="mobile-drawer-handle" />

            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.5rem 0.25rem 1.25rem',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              marginBottom: '1rem',
            }}>
              <div style={{
                width: '38px', height: '38px',
                background: 'rgba(78,148,96,0.2)',
                borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '600', fontSize: '0.95rem', color: 'var(--color-accent-hi)',
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.name}</p>
                <p style={{ fontSize: '0.72rem', color: isAdmin ? 'var(--color-warning)' : 'var(--color-accent-hi)', marginTop: '0.15rem' }}>
                  {isAdmin ? 'Administrador' : user.isMinistro ? 'Ministro de Louvor' : 'Membro'}
                </p>
              </div>
            </div>

            {isAdmin && (
              <>
                <p className="mobile-drawer-title">Administração</p>
                {adminDrawerItems.map(item => (
                  <a
                    key={item.path}
                    href={item.path}
                    className={`mobile-drawer-link ${isActive(item.path) ? 'active-link' : ''}`}
                  >
                    {item.icon}
                    {item.label}
                  </a>
                ))}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0.75rem 0' }} />
              </>
            )}

            {!isAdmin && (
              <>
                <p className="mobile-drawer-title">Mais Opções</p>
                <a href="/admin/bands" className={`mobile-drawer-link ${isActive('/admin/bands') ? 'active-link' : ''}`}>
                  <Guitar size={19} /> Bandas
                </a>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0.75rem 0' }} />
              </>
            )}

            <button
              className="mobile-drawer-link"
              onClick={handleLogout}
              style={{ color: 'var(--color-danger)', width: '100%' }}
            >
              <LogOut size={19} /> Sair do Sistema
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
