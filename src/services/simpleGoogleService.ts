/**
 * Service Google simplifié et fonctionnel
 * Remplace EmailJS par Gmail + Calendar
 */

declare global {
  interface Window {
    gapi: any;
  }
}

interface EmailData {
  to: string;
  subject: string;
  body: string;
}

interface CalendarEventData {
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  attendeeEmail?: string;
}

class SimpleGoogleService {
  private CLIENT_ID = '939426446725-cgmd8eudsqmkccv94u2hsrj3idlb7fps.apps.googleusercontent.com';
  private SCOPES = 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/calendar';
  private isSignedIn = false;

  async initialize(): Promise<boolean> {
    try {
      console.log('🚀 Initialisation Google Service...');
      
      // Charger Google API si pas déjà fait
      if (!window.gapi) {
        await this.loadGoogleAPI();
      }

      // Charger les modules nécessaires
      await new Promise<void>((resolve, reject) => {
        window.gapi.load('auth2:client', async () => {
          try {
            await window.gapi.client.init({
              clientId: this.CLIENT_ID,
              scope: this.SCOPES,
              discoveryDocs: [
                'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
                'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'
              ]
            });

            const authInstance = window.gapi.auth2.getAuthInstance();
            this.isSignedIn = authInstance.isSignedIn.get();
            
            console.log('✅ Google Service initialisé, connecté:', this.isSignedIn);
            resolve();
          } catch (error) {
            console.error('❌ Erreur init Google:', error);
            reject(error);
          }
        });
      });

      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
      return false;
    }
  }

  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Impossible de charger Google API'));
      document.head.appendChild(script);
    });
  }

  async signIn(): Promise<boolean> {
    try {
      console.log('🔄 Début signIn...');
      
      // Forcer l'initialisation complète
      const initSuccess = await this.initialize();
      if (!initSuccess) {
        console.error('❌ Échec initialisation');
        return false;
      }

      // Vérifier que auth2 est bien disponible
      if (!window.gapi || !window.gapi.auth2) {
        console.error('❌ gapi.auth2 non disponible');
        return false;
      }

      const authInstance = window.gapi.auth2.getAuthInstance();
      if (!authInstance) {
        console.error('❌ authInstance non disponible');
        return false;
      }

      console.log('🔄 Tentative de connexion...');
      const user = await authInstance.signIn();
      
      if (user && user.isSignedIn()) {
        this.isSignedIn = true;
        console.log('✅ Connexion Google réussie');
        return true;
      }
      
      console.error('❌ Utilisateur non connecté après signIn');
      return false;
    } catch (error) {
      console.error('❌ Erreur connexion:', error);
      return false;
    }
  }

  async sendEmail(data: EmailData): Promise<boolean> {
    try {
      if (!this.isSignedIn) {
        const success = await this.signIn();
        if (!success) return false;
      }

      // Créer le message email au format RFC 2822
      const email = [
        `To: ${data.to}`,
        `Subject: ${data.subject}`,
        'Content-Type: text/html; charset=utf-8',
        '',
        data.body
      ].join('\\r\\n');

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

      console.log('✅ Email envoyé:', response);
      return true;
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      return false;
    }
  }

  async createCalendarEvent(data: CalendarEventData): Promise<string | null> {
    try {
      if (!this.isSignedIn) {
        const success = await this.signIn();
        if (!success) return null;
      }

      const event = {
        summary: data.summary,
        description: data.description,
        start: {
          dateTime: data.startDateTime,
          timeZone: 'Europe/Paris'
        },
        end: {
          dateTime: data.endDateTime,
          timeZone: 'Europe/Paris'
        },
        attendees: data.attendeeEmail ? [{ email: data.attendeeEmail }] : [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 }
          ]
        }
      };

      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });

      console.log('✅ Événement créé:', response.result.id);
      return response.result.id;
    } catch (error) {
      console.error('❌ Erreur création événement:', error);
      return null;
    }
  }

  // === FONCTIONS MÉTIER PRODTALENT ===

  async sendMessageNotification(data: {
    recipientEmail: string;
    recipientName: string;
    senderName: string;
    messagePreview: string;
  }): Promise<boolean> {
    const htmlBody = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: #ffcc00; padding: 30px; text-align: center;">
          <h1 style="color: #000; margin: 0;">📧 ProdTalent</h1>
        </div>
        <div style="background: #fff; padding: 30px;">
          <h2 style="color: #333;">Nouveau message reçu</h2>
          <p>Bonjour ${data.recipientName},</p>
          <p>Vous avez reçu un nouveau message de <strong>${data.senderName}</strong>.</p>
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-left: 4px solid #ffcc00;">
            <p style="font-style: italic; margin: 0;">"${data.messagePreview}"</p>
          </div>
          <p style="text-align: center;">
            <a href="http://127.0.0.1:5173/messages" 
               style="background: #ffcc00; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              📱 Voir le message
            </a>
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
    jobTitle?: string;
  }): Promise<boolean> {
    const htmlBody = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: #ffcc00; padding: 30px; text-align: center;">
          <h1 style="color: #000; margin: 0;">🎯 ProdTalent</h1>
        </div>
        <div style="background: #fff; padding: 30px;">
          <h2 style="color: #333;">Nouvelle recommandation</h2>
          <p>Bonjour ${data.recipientName},</p>
          <p><strong>${data.coachName}</strong> vous a recommandé${data.jobTitle ? ` pour le poste "${data.jobTitle}"` : ''}.</p>
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-left: 4px solid #ffcc00;">
            <h3>Message du coach:</h3>
            <p style="font-style: italic; margin: 0;">"${data.message}"</p>
          </div>
          <p style="text-align: center;">
            <a href="http://127.0.0.1:5173/talent/recommendations" 
               style="background: #ffcc00; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              🎯 Voir les détails
            </a>
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: data.recipientEmail,
      subject: `Nouvelle recommandation de ${data.coachName} - ProdTalent`,
      body: htmlBody
    });
  }

  async createCoachingAppointment(data: {
    coachName: string;
    talentName: string;
    talentEmail: string;
    date: string;
    startTime: string;
    duration: number; // minutes
  }): Promise<{ eventId: string | null; emailSent: boolean }> {
    // Créer les dates
    const startDateTime = new Date(`${data.date}T${data.startTime}`);
    const endDateTime = new Date(startDateTime.getTime() + data.duration * 60000);

    // Créer l'événement Calendar
    const eventId = await this.createCalendarEvent({
      summary: `Coaching - ${data.talentName} avec ${data.coachName}`,
      description: `Session de coaching ProdTalent\\n\\nCoach: ${data.coachName}\\nTalent: ${data.talentName}`,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      attendeeEmail: data.talentEmail
    });

    // Envoyer email de confirmation
    const htmlBody = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: #ffcc00; padding: 30px; text-align: center;">
          <h1 style="color: #000; margin: 0;">📅 ProdTalent</h1>
        </div>
        <div style="background: #fff; padding: 30px;">
          <h2 style="color: #333;">Rendez-vous coaching confirmé</h2>
          <p>Bonjour ${data.talentName},</p>
          <p>Votre rendez-vous de coaching avec <strong>${data.coachName}</strong> a été confirmé.</p>
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-left: 4px solid #ffcc00;">
            <h3>Détails:</h3>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Heure:</strong> ${data.startTime}</p>
            <p><strong>Durée:</strong> ${data.duration} minutes</p>
            <p><strong>Coach:</strong> ${data.coachName}</p>
          </div>
          <p>L'événement a été ajouté à votre calendrier Google.</p>
        </div>
      </div>
    `;

    const emailSent = await this.sendEmail({
      to: data.talentEmail,
      subject: `Rendez-vous coaching confirmé - ${data.date} - ProdTalent`,
      body: htmlBody
    });

    return { eventId, emailSent };
  }

  getConnectionStatus(): { isSignedIn: boolean; message: string } {
    return {
      isSignedIn: this.isSignedIn,
      message: this.isSignedIn ? 'Connecté à Google' : 'Non connecté'
    };
  }
}

export const simpleGoogleService = new SimpleGoogleService();
export default simpleGoogleService;