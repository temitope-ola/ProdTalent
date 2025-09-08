declare global {
  interface Window {
    gapi: any;
  }
}

interface GmailMessage {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}

class GmailService {
  private accessToken: string | null = null;
  private isInitialized = false;

  async initializeGmail(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Charger GAPI si pas déjà chargé
      if (!window.gapi) {
        await this.loadGoogleApi();
      }

      await new Promise<void>((resolve, reject) => {
        window.gapi.load('client:auth2', async () => {
          try {
            await window.gapi.client.init({
              apiKey: 'YOUR_API_KEY', // À configurer
              clientId: 'YOUR_CLIENT_ID', // À configurer
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
              scope: 'https://www.googleapis.com/auth/gmail.send'
            });
            
            this.isInitialized = true;
            console.log('✅ Gmail API initialisé');
            resolve();
          } catch (error) {
            console.error('❌ Erreur initialisation Gmail:', error);
            reject(error);
          }
        });
      });

      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation Gmail service:', error);
      return false;
    }
  }

  private async loadGoogleApi(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  }

  async signIn(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initializeGmail();
      }

      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      
      this.accessToken = user.getAuthResponse().access_token;
      console.log('✅ Gmail connexion réussie');
      return true;
    } catch (error) {
      console.error('❌ Erreur connexion Gmail:', error);
      return false;
    }
  }

  async sendEmail(message: GmailMessage): Promise<boolean> {
    try {
      if (!this.accessToken) {
        const signedIn = await this.signIn();
        if (!signedIn) return false;
      }

      // Créer le message au format RFC 2822
      const email = [
        `To: ${message.to}`,
        message.cc ? `Cc: ${message.cc}` : '',
        message.bcc ? `Bcc: ${message.bcc}` : '',
        `Subject: ${message.subject}`,
        'Content-Type: text/html; charset=utf-8',
        '',
        message.body
      ].filter(line => line !== '').join('\\r\\n');

      // Encoder en base64
      const encodedMessage = btoa(unescape(encodeURIComponent(email)))
        .replace(/\\+/g, '-')
        .replace(/\\//g, '_')
        .replace(/=+$/, '');

      // Envoyer via Gmail API
      const response = await window.gapi.client.gmail.users.messages.send({
        userId: 'me',
        resource: {
          raw: encodedMessage
        }
      });

      console.log('✅ Email envoyé via Gmail:', response);
      return true;
    } catch (error) {
      console.error('❌ Erreur envoi Gmail:', error);
      return false;
    }
  }

  // Fonctions spécialisées pour remplacer EmailJS
  async sendNewMessageNotification(data: {
    recipientEmail: string;
    recipientName: string;
    senderName: string;
    senderRole: string;
    messagePreview: string;
  }): Promise<boolean> {
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ffcc00; padding: 20px; text-align: center;">
          <h1 style="color: #000; margin: 0;">📧 ProdTalent</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Nouveau message reçu</h2>
          <p>Bonjour ${data.recipientName},</p>
          <p>Vous avez reçu un nouveau message de <strong>${data.senderName}</strong> (${data.senderRole}).</p>
          
          <div style="background: #fff; padding: 20px; border-left: 4px solid #ffcc00; margin: 20px 0;">
            <h3>Aperçu du message:</h3>
            <p style="font-style: italic;">"${data.messagePreview}"</p>
          </div>
          
          <p>
            <a href="https://prodtalent.com/messages" style="background: #ffcc00; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              📱 Voir le message
            </a>
          </p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Cet email a été envoyé automatiquement par ProdTalent.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: data.recipientEmail,
      subject: `Nouveau message de ${data.senderName} - ProdTalent`,
      body: htmlBody
    });
  }

  async sendRecommendationNotification(data: {
    recipientEmail: string;
    recipientName: string;
    coachName: string;
    message: string;
    isForTalent: boolean;
    jobTitle?: string;
    talentName?: string;
  }): Promise<boolean> {
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ffcc00; padding: 20px; text-align: center;">
          <h1 style="color: #000; margin: 0;">🎯 ProdTalent</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">${data.isForTalent ? 'Vous avez été recommandé!' : 'Nouveau talent recommandé'}</h2>
          <p>Bonjour ${data.recipientName},</p>
          <p>${data.isForTalent 
            ? `${data.coachName} vous a recommandé pour une opportunité.`
            : `${data.coachName} vous recommande le talent ${data.talentName}.`}
          </p>
          
          ${data.jobTitle ? `<p><strong>Poste:</strong> ${data.jobTitle}</p>` : ''}
          
          <div style="background: #fff; padding: 20px; border-left: 4px solid #ffcc00; margin: 20px 0;">
            <h3>Message du coach:</h3>
            <p style="font-style: italic;">"${data.message}"</p>
          </div>
          
          <p>
            <a href="https://prodtalent.com/dashboard" style="background: #ffcc00; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              🎯 Voir les détails
            </a>
          </p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Cet email a été envoyé automatiquement par ProdTalent.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: data.recipientEmail,
      subject: data.isForTalent 
        ? `Nouvelle recommandation de ${data.coachName} - ProdTalent`
        : `Talent recommandé par ${data.coachName} - ProdTalent`,
      body: htmlBody
    });
  }
}

export const gmailService = new GmailService();
export default gmailService;