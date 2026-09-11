import { Router, Response } from 'express';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';
import { whatsappService } from '../services/whatsapp';

const router = Router();

// Retorna o status do bot
router.get('/status', requireAuth, requireAdmin, (req: AuthRequest, res: Response) => {
  const status = whatsappService.getStatus();
  res.json(status);
});

// Retorna o QR Code em base64
router.get('/qr', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const qrImage = await whatsappService.getQrCodeImage();
    if (!qrImage) {
      res.status(404).json({ error: 'QR Code não disponível (já conectado ou carregando)' });
      return;
    }
    res.json({ qr: qrImage });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar QR Code' });
  }
});

// Força a inicialização (caso o bot tenha morrido ou não inciado)
router.post('/start', requireAuth, requireAdmin, (req: AuthRequest, res: Response) => {
  whatsappService.initialize();
  res.json({ message: 'Inicialização do WhatsApp solicitada' });
});

export default router;
