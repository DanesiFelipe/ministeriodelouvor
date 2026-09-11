import { useEffect, useState } from 'react';
import { Smartphone, RefreshCw, CheckCircle2, XCircle, QrCode } from 'lucide-react';

export default function WhatsAppSettings() {
  const [status, setStatus] = useState<{ isReady: boolean; hasQr: boolean } | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setIsAdmin(user.role === 'ADMIN');
    } catch (e) {}
    
    fetchStatus();
    // Poll status every 5 seconds if not ready
    const interval = setInterval(() => {
      fetchStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/whatsapp/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setStatus(data);
      
      if (data.hasQr && !data.isReady) {
        fetchQrCode();
      } else if (data.isReady) {
        setQrCode(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQrCode = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/whatsapp/qr', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQrCode(data.qr);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const restartBot = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3000/api/whatsapp/start', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimeout(fetchStatus, 3000);
    } catch (err) {
      alert('Erro ao tentar reiniciar o bot.');
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="empty-state">
        <XCircle size={48} color="#ffaaaa" />
        <p>Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Integração WhatsApp</h1>
          <p className="page-subtitle">Conecte um aparelho para ativar as notificações automáticas.</p>
        </div>
        <button onClick={restartBot} className="btn btn-ghost" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
          <RefreshCw size={18} /> Reiniciar Robô
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <Smartphone size={48} color={status?.isReady ? '#a7cfa8' : '#ffb450'} />
          </div>
          
          <h2 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Status da Conexão</h2>
          
          {loading && !status ? (
            <p style={{ color: 'var(--color-light)' }}>Verificando status...</p>
          ) : status?.isReady ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(167,207,168,0.15)', color: '#a7cfa8', padding: '0.8rem 1.5rem', borderRadius: '20px', fontWeight: '600' }}>
                <CheckCircle2 size={20} /> Conectado e Operante
              </div>
              <p style={{ color: 'var(--color-light)', marginTop: '1rem', fontSize: '0.9rem' }}>
                O bot está ativo e enviará notificações automáticas para os ministros escalados conforme os agendamentos semanais.
              </p>
            </>
          ) : status?.hasQr ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,180,80,0.15)', color: '#ffb450', padding: '0.8rem 1.5rem', borderRadius: '20px', fontWeight: '600' }}>
                <QrCode size={20} /> Aguardando Leitura
              </div>
              <p style={{ color: 'var(--color-light)', marginTop: '1rem', fontSize: '0.9rem' }}>
                1. Abra o WhatsApp no celular da igreja.<br/>
                2. Vá em "Aparelhos Conectados".<br/>
                3. Escaneie o QR Code ao lado.
              </p>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.8rem 1.5rem', borderRadius: '20px', fontWeight: '600' }}>
                <RefreshCw size={20} /> Iniciando sessão...
              </div>
              <p style={{ color: 'var(--color-light)', marginTop: '1rem', fontSize: '0.9rem' }}>
                O bot está tentando se conectar ou gerar o QR Code. Isso pode levar alguns segundos.
              </p>
            </>
          )}
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px' }}>
          {!status?.isReady && qrCode ? (
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px' }}>
              <img src={qrCode} alt="WhatsApp QR Code" style={{ width: '250px', height: '250px' }} />
            </div>
          ) : status?.isReady ? (
            <div style={{ textAlign: 'center' }}>
              <CheckCircle2 size={80} color="#a7cfa8" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: '#a7cfa8' }}>Tudo Certo!</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.5 }}>
              <QrCode size={64} style={{ marginBottom: '1rem' }} />
              <p>QR Code aparecerá aqui</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
