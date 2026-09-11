import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode';

class WhatsAppService {
  private client: Client;
  private qrCodeStr: string | null = null;
  private isReady: boolean = false;

  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process'
        ],
      },
      webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
      }
    });

    this.client.on('qr', (qr) => {
      this.qrCodeStr = qr;
      console.log('QR Code recebido, pronto para leitura.');
    });

    this.client.on('ready', () => {
      this.isReady = true;
      this.qrCodeStr = null;
      console.log('WhatsApp Bot Conectado e Pronto!');
    });

    this.client.on('disconnected', () => {
      this.isReady = false;
      console.log('WhatsApp Bot Desconectado.');
    });
  }

  public initialize() {
    this.client.initialize().catch(err => console.error('Erro ao inicializar WhatsApp:', err));
  }

  public getStatus() {
    return {
      isReady: this.isReady,
      hasQr: !!this.qrCodeStr
    };
  }

  public async getQrCodeImage(): Promise<string | null> {
    if (!this.qrCodeStr) return null;
    return await qrcode.toDataURL(this.qrCodeStr);
  }

  public async sendMessage(phone: string, message: string): Promise<boolean> {
    if (!this.isReady) {
      console.error('WhatsApp Bot não está pronto para enviar mensagens.');
      return false;
    }

    try {
      // Limpa a formatação do telefone e garante o código do Brasil se não tiver
      let cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length === 10 || cleanPhone.length === 11) {
        cleanPhone = `55${cleanPhone}`;
      }
      
      const chatId = `${cleanPhone}@c.us`;
      await this.client.sendMessage(chatId, message);
      return true;
    } catch (error) {
      console.error(`Erro ao enviar mensagem para ${phone}:`, error);
      return false;
    }
  }
}

export const whatsappService = new WhatsAppService();
