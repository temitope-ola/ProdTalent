/**
 * Service SendGrid - Remplacement fiable d'EmailJS
 * Plus stable et professionnel
 */

interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface MessageNotificationData {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  senderRole: string;
  messagePreview: string;
}

interface RecommendationNotificationData {
  recipientEmail: string;
  recipientName: string;
  coachName: string;
  message: string;
  jobTitle?: string;
  isForTalent: boolean;
}

interface AppointmentNotificationData {
  recipientEmail: string;
  recipientName: string;
  coachName: string;
  date: string;
  time: string;
  meetLink?: string;
  calendarLink?: string;
}

class SendGridService {
  private readonly API_KEY = import.meta.env.VITE_SENDGRID_API_KEY || localStorage.getItem('SENDGRID_API_KEY') || '';
  private readonly FROM_EMAIL = 'noreply@prodtalent.com'; // Votre domaine
  private readonly API_URL = 'https://api.sendgrid.com/v3/mail/send';

  async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      // Récupérer la clé API dynamiquement
      const apiKey = import.meta.env.VITE_SENDGRID_API_KEY || localStorage.getItem('SENDGRID_API_KEY') || '';
      
      if (!apiKey) {
        console.error('❌ Clé API SendGrid manquante. Configurez VITE_SENDGRID_API_KEY ou utilisez /sendgrid-setup');
        return false;
      }

      console.log('📧 Envoi email SendGrid à:', template.to);

      // Utiliser notre backend pour éviter CORS
      const response = await fetch('http://localhost:3000/api/sendgrid/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: apiKey,
          to: template.to,
          subject: template.subject,
          html: template.html,
          from: template.from || this.FROM_EMAIL
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Email SendGrid envoyé avec succès');
        return true;
      } else {
        console.error('❌ Erreur SendGrid:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur envoi SendGrid:', error);
      return false;
    }
  }

  async sendMessageNotification(data: MessageNotificationData): Promise<boolean> {
    const html = this.createEmailTemplate({
      title: '📧 Nouveau message',
      recipientName: data.recipientName,
      content: `
        <p>Vous avez reçu un nouveau message de <strong>${data.senderName}</strong> (${data.senderRole}).</p>
        <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #ffcc00; margin: 20px 0; border-radius: 4px;">
          <h3 style="color: #333; margin: 0 0 10px 0;">Aperçu du message:</h3>
          <p style="font-style: italic; color: #555; margin: 0;">"${data.messagePreview}"</p>
        </div>
      `,
      actionButton: {
        text: '📱 Voir le message',
        url: 'https://prodtalent.com/messages'
      }
    });

    return this.sendEmail({
      to: data.recipientEmail,
      subject: `Nouveau message de ${data.senderName} - ProdTalent`,
      html
    });
  }

  async sendRecommendationNotification(data: RecommendationNotificationData): Promise<boolean> {
    const html = this.createEmailTemplate({
      title: data.isForTalent ? '🎯 Vous avez été recommandé!' : '🎯 Nouveau talent recommandé',
      recipientName: data.recipientName,
      content: `
        <p>${data.isForTalent 
          ? `<strong>${data.coachName}</strong> vous a recommandé${data.jobTitle ? ` pour le poste "${data.jobTitle}"` : ''}.`
          : `<strong>${data.coachName}</strong> vous recommande un nouveau talent.`}
        </p>
        <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #ffcc00; margin: 20px 0; border-radius: 4px;">
          <h3 style="color: #333; margin: 0 0 10px 0;">Message du coach:</h3>
          <p style="font-style: italic; color: #555; margin: 0;">"${data.message}"</p>
        </div>
      `,
      actionButton: {
        text: '🎯 Voir les détails',
        url: data.isForTalent ? 'https://prodtalent.com/talent/recommendations' : 'https://prodtalent.com/dashboard'
      }
    });

    return this.sendEmail({
      to: data.recipientEmail,
      subject: data.isForTalent 
        ? `Nouvelle recommandation de ${data.coachName} - ProdTalent`
        : `Talent recommandé par ${data.coachName} - ProdTalent`,
      html
    });
  }

  async sendAppointmentConfirmation(data: AppointmentNotificationData): Promise<boolean> {
    const html = this.createEmailTemplate({
      title: '📅 Rendez-vous coaching confirmé',
      recipientName: data.recipientName,
      content: `
        <p>Votre rendez-vous de coaching avec <strong>${data.coachName}</strong> a été confirmé.</p>
        <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0; border-radius: 4px;">
          <h3 style="color: #333; margin: 0 0 15px 0;">📋 Détails du rendez-vous:</h3>
          <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${data.date}</p>
          <p style="margin: 5px 0;"><strong>🕐 Heure:</strong> ${data.time}</p>
          <p style="margin: 5px 0;"><strong>👨‍🏫 Coach:</strong> ${data.coachName}</p>
          ${data.meetLink ? `<p style="margin: 15px 0 5px 0;"><strong>🎥 Lien Google Meet:</strong></p>
          <a href="${data.meetLink}" style="color: #1a73e8; font-weight: bold;">${data.meetLink}</a>` : ''}
        </div>
        ${data.calendarLink ? `
        <p style="text-align: center; margin: 20px 0;">
          <a href="${data.calendarLink}" style="background: #4285f4; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 0 10px;">
            📅 Ajouter au calendrier
          </a>
        </p>` : ''}
      `,
      actionButton: data.meetLink ? {
        text: '🎥 Rejoindre la réunion',
        url: data.meetLink
      } : undefined
    });

    return this.sendEmail({
      to: data.recipientEmail,
      subject: `Rendez-vous coaching confirmé - ${data.date} à ${data.time} - ProdTalent`,
      html
    });
  }

  async sendAppointmentReminder(data: AppointmentNotificationData): Promise<boolean> {
    const html = this.createEmailTemplate({
      title: '⏰ Rappel - Rendez-vous coaching dans 30 minutes',
      recipientName: data.recipientName,
      content: `
        <p>Votre rendez-vous de coaching avec <strong>${data.coachName}</strong> commence dans <strong style="color: #ff6b6b;">30 minutes</strong>.</p>
        <div style="background: #fff3cd; padding: 20px; border-left: 4px solid #ffcc00; margin: 20px 0; border-radius: 4px;">
          <h3 style="color: #856404; margin: 0 0 15px 0;">⏰ Rappel:</h3>
          <p style="margin: 5px 0; color: #856404;"><strong>📅 Date:</strong> ${data.date}</p>
          <p style="margin: 5px 0; color: #856404;"><strong>🕐 Heure:</strong> ${data.time}</p>
          <p style="margin: 5px 0; color: #856404;"><strong>👨‍🏫 Coach:</strong> ${data.coachName}</p>
        </div>
        <p style="text-align: center; font-weight: bold; color: #333;">Préparez-vous pour votre session de coaching !</p>
      `,
      actionButton: data.meetLink ? {
        text: '🎥 Rejoindre maintenant',
        url: data.meetLink
      } : undefined
    });

    return this.sendEmail({
      to: data.recipientEmail,
      subject: `⏰ Rappel - Coaching dans 30 min avec ${data.coachName} - ProdTalent`,
      html
    });
  }

  private createEmailTemplate(data: {
    title: string;
    recipientName: string;
    content: string;
    actionButton?: { text: string; url: string };
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ffcc00 0%, #ffb300 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #000; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">
              ProdTalent
            </h1>
            <p style="color: #333; margin: 8px 0 0 0; font-size: 14px; opacity: 0.8;">
              Plateforme de coaching professionnel
            </p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 22px; font-weight: 600;">
              ${data.title}
            </h2>
            <p style="color: #333; margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">
              Bonjour <strong>${data.recipientName}</strong>,
            </p>
            <div style="color: #333; font-size: 16px; line-height: 1.6;">
              ${data.content}
            </div>
            
            ${data.actionButton ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.actionButton.url}" style="background: linear-gradient(135deg, #ffcc00 0%, #ffb300 100%); color: #000; padding: 15px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 2px 10px rgba(255,204,0,0.3);">
                ${data.actionButton.text}
              </a>
            </div>
            ` : ''}
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 30px; border-top: 1px solid #e9ecef; text-align: center;">
            <p style="color: #6c757d; margin: 0 0 10px 0; font-size: 14px;">
              Cet email a été envoyé automatiquement par ProdTalent
            </p>
            <p style="color: #adb5bd; margin: 0; font-size: 12px;">
              © 2025 ProdTalent - Plateforme de coaching professionnel
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Test de configuration
  async testConfiguration(): Promise<boolean> {
    console.log('🧪 Test de configuration SendGrid...');
    
    return this.sendEmail({
      to: 'test@example.com',
      subject: 'Test ProdTalent - Configuration SendGrid',
      html: this.createEmailTemplate({
        title: '🧪 Test de configuration',
        recipientName: 'Utilisateur Test',
        content: '<p>Si vous recevez cet email, SendGrid est correctement configuré !</p>',
        actionButton: {
          text: '✅ Configuration OK',
          url: 'https://prodtalent.com'
        }
      })
    });
  }
}

export const sendGridService = new SendGridService();
export default sendGridService;