/**
 * Service Google Simplifié - Gmail API seulement
 * Solution directe et fiable pour remplacer EmailJS
 */

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface NotificationData {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  senderRole?: string;
  messagePreview?: string;
  subject?: string;
  body?: string;
}

class GoogleIntegratedService {
  private accessToken: string | null = null;
  private isInitialized = false;
  
  private readonly CLIENT_ID = '892968324511-09kecigslmf1an439rs8jlt78ftcmogj.apps.googleusercontent.com';
  private readonly API_KEY = 'AIzaSyB0iIQJv39kyFOX-8OjUtw_6sC_OKfBEzo';
  private readonly SCOPES = 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events';

  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      console.log('🚀 Gmail API désactivé - utilisant Firebase Functions');
      this.isInitialized = true;
      return true;
      
      // Code original désactivé temporairement
      /*
      console.log('🚀 Initialisation Gmail API...');
      
      // Charger GAPI
      await this.loadGapi();
      
      // Initialiser client avec vérification supplémentaire
      await new Promise<void>((resolve, reject) => {
        if (!window.gapi || !window.gapi.client) {
          reject(new Error('GAPI client non disponible'));
          return;
        }
        
        window.gapi.client.init({
          apiKey: this.API_KEY,
          discoveryDocs: [
            'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
            'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'
          ]
        }).then(() => {
          console.log('✅ Gmail API client initialisé');
          this.isInitialized = true;
          resolve();
        }).catch(reject);
      });

      return true;
      */
    } catch (error) {
      console.error('❌ Erreur initialisation Gmail:', error);
      return false;
    }
  }

  private loadGapi(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window.gapi !== 'undefined' && window.gapi.client) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client', () => {
          console.log('✅ GAPI chargé');
          // Attendre que gapi.client soit disponible
          const checkClient = () => {
            if (window.gapi.client) {
              resolve();
            } else {
              setTimeout(checkClient, 50);
            }
          };
          checkClient();
        });
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async signIn(): Promise<boolean> {
    try {
      console.log('🔑 Authentification Google...');
      
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Charger Google Identity Services si pas déjà fait
      if (typeof window.google === 'undefined') {
        await this.loadGoogleIdentity();
      }

      return new Promise((resolve) => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: this.CLIENT_ID,
          scope: this.SCOPES,
          callback: (response: any) => {
            if (response.access_token) {
              this.accessToken = response.access_token;
              window.gapi.client.setToken({ access_token: this.accessToken });
              console.log('✅ Authentification réussie');
              resolve(true);
            } else {
              console.error('❌ Pas de token reçu');
              resolve(false);
            }
          },
          error_callback: (error: any) => {
            console.error('❌ Erreur authentification:', error);
            resolve(false);
          }
        });
        
        client.requestAccessToken();
      });
    } catch (error) {
      console.error('❌ Erreur signIn:', error);
      return false;
    }
  }

  private loadGoogleIdentity(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window.google !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        console.log('✅ Google Identity Services chargé');
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async sendEmail(to: string, subject: string, htmlBody: string): Promise<boolean> {
    console.log('📧 GoogleIntegratedService désactivé - utilisant Firebase Functions');
    return false;
    /*
    try {
      if (!this.accessToken) {
        console.log('🔑 Authentification requise pour envoi email');
        const authenticated = await this.signIn();
        if (!authenticated) {
          throw new Error('Authentification échouée');
        }
      }

      console.log('📧 Envoi email via Gmail API...');

      const email = [
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        '',
        htmlBody
      ].join('\r\n');

      // Encodage correct pour éviter les problèmes d'accents
      const encoder = new TextEncoder();
      const encodedBytes = encoder.encode(email);
      const base64String = btoa(String.fromCharCode(...encodedBytes));
      const encodedEmail = base64String
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await window.gapi.client.gmail.users.messages.send({
        userId: 'me',
        resource: { raw: encodedEmail }
      });

      if (response.result && response.result.id) {
        console.log('✅ Email envoyé avec succès:', response.result.id);
        return true;
      } else {
        console.error('❌ Pas de ID de message reçu');
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      return false;
    }
    */
  }

  async sendMessageNotification(data: NotificationData): Promise<boolean> {
    console.log('📧 GoogleIntegratedService désactivé - utilisant Firebase Functions');
    return false;
    /*
    const subject = data.subject || `Nouveau message de ${data.senderName} - ProdTalent`;
    
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f7;">
        <!-- Header ProdTalent -->
        <div style="background: linear-gradient(135deg, #ffcc00 0%, #ffd700 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #0a0a0a; margin: 0; font-size: 28px; font-weight: bold;">ProdTalent</h1>
          <p style="color: #0a0a0a; margin: 10px 0 0 0; font-size: 16px;">Nouveau message recu</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1a1a1a; margin-top: 0;">Bonjour ${data.recipientName}</h2>
          
          <div style="background: #f5f5f7; padding: 20px; border-radius: 8px; border-left: 4px solid #ffcc00; margin: 20px 0;">
            <p style="margin: 0; color: #1a1a1a; font-size: 16px;">
              <strong style="color: #0a0a0a;">${data.senderName}</strong> ${data.senderRole ? `<span style="color: #ffcc00;">(${data.senderRole})</span>` : ''} vous a envoyé un message :
            </p>
            ${data.messagePreview ? `<p style="margin: 15px 0 0 0; color: #555; font-style: italic; background: #ffffff; padding: 12px; border-radius: 6px;">"${data.messagePreview.substring(0, 100)}${data.messagePreview.length > 100 ? '...' : ''}"</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://prodtalent.com/messages" 
               style="background: linear-gradient(135deg, #ffcc00 0%, #ffd700 100%); 
                      color: #0a0a0a; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;
                      transition: transform 0.2s;
                      box-shadow: 0 2px 4px rgba(255, 204, 0, 0.3);">
              Répondre au message
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #f5f5f7; margin: 30px 0;">
          
          <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
            ProdTalent - Connecter les talents et opportunités<br>
            <a href="https://prodtalent.com" style="color: #ffcc00; text-decoration: none;">prodtalent.com</a>
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail(data.recipientEmail, subject, htmlBody);
  }

  // Templates d'email pour les appointments
  async sendAppointmentConfirmation(data: {
    recipientEmail: string;
    recipientName: string;
    coachName: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentType: string;
    meetLink?: string;
    calendarLink?: string;
  }): Promise<boolean> {
    console.log('📧 GoogleIntegratedService désactivé - utilisant Firebase Functions');
    return false;
    /*
    const subject = `Rendez-vous confirme avec ${data.coachName} - ProdTalent`;
    
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f7;">
        <!-- Header succès -->
        <div style="background: linear-gradient(135deg, #ffcc00 0%, #ffd700 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #0a0a0a; margin: 0; font-size: 28px; font-weight: bold;">Rendez-vous Confirme</h1>
          <p style="color: #0a0a0a; margin: 10px 0 0 0; font-size: 16px;">Votre session de coaching est confirmee</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1a1a1a; margin-top: 0;">Bonjour ${data.recipientName}</h2>
          
          <!-- Détails appointment -->
          <div style="background: #f5f5f7; padding: 20px; border-radius: 8px; border-left: 4px solid #ffcc00; margin: 20px 0;">
            <h3 style="color: #ffcc00; margin-top: 0; font-weight: bold;">Details de votre rendez-vous</h3>
            <p style="margin: 10px 0; color: #1a1a1a;"><strong style="color: #0a0a0a;">Coach :</strong> ${data.coachName}</p>
            <p style="margin: 10px 0; color: #1a1a1a;"><strong style="color: #0a0a0a;">Date :</strong> ${new Date(data.appointmentDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="margin: 10px 0; color: #1a1a1a;"><strong style="color: #0a0a0a;">Heure :</strong> ${data.appointmentTime}</p>
            <p style="margin: 10px 0; color: #1a1a1a;"><strong style="color: #0a0a0a;">Type :</strong> ${data.appointmentType}</p>
          </div>
          
          ${data.meetLink ? `
          <!-- Lien Meet -->
          <div style="background: linear-gradient(135deg, #ffcc00 0%, #ffd700 100%); padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0a0a0a; margin-top: 0; font-weight: bold;">Lien de reunion</h3>
            <p style="margin: 10px 0; color: #1a1a1a;">Cliquez sur le lien ci-dessous pour rejoindre la session :</p>
            <div style="text-align: center; margin: 15px 0;">
              <a href="${data.meetLink}" 
                 style="background: #0a0a0a; 
                        color: #ffcc00; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        display: inline-block;
                        box-shadow: 0 2px 4px rgba(10, 10, 10, 0.3);">
                Rejoindre la reunion
              </a>
            </div>
            <p style="margin: 0; color: #1a1a1a; font-size: 12px; text-align: center; opacity: 0.8;">
              Lien Meet : <a href="${data.meetLink}" style="color: #0a0a0a; text-decoration: none;">${data.meetLink}</a>
            </p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              Vous avez des questions ? Contactez directement votre coach via ProdTalent.
            </p>
            <a href="https://prodtalent.com/messages" 
               style="background: linear-gradient(135deg, #ffcc00 0%, #ffd700 100%); 
                      color: #0a0a0a; 
                      padding: 10px 20px; 
                      text-decoration: none; 
                      border-radius: 20px; 
                      font-weight: bold; 
                      display: inline-block;
                      margin-top: 15px;
                      box-shadow: 0 2px 4px rgba(255, 204, 0, 0.3);">
              Envoyer un message
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #f5f5f7; margin: 30px 0;">
          
          <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
            ProdTalent - Connecter les talents et opportunités<br>
            <a href="https://prodtalent.com" style="color: #ffcc00; text-decoration: none;">prodtalent.com</a>
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail(data.recipientEmail, subject, htmlBody);
    */
  }

  async sendNewAppointment(data: {
    recipientEmail: string;
    recipientName: string;
    coachName: string;
    appointmentDate: string;
    appointmentTime: string;
    meetingType: string;
    meetLink?: string;
    calendarLink?: string;
  }): Promise<boolean> {
    console.log('📧 GoogleIntegratedService désactivé - utilisant Firebase Functions');
    return false;
    /*
    const subject = `Nouveau rendez-vous avec ${data.coachName} - ProdTalent`;
    
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f7;">
        <!-- Header nouveau RDV -->
        <div style="background: linear-gradient(135deg, #ffcc00 0%, #ffd700 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #0a0a0a; margin: 0; font-size: 28px; font-weight: bold;">Nouveau Rendez-vous</h1>
          <p style="color: #0a0a0a; margin: 10px 0 0 0; font-size: 16px;">Votre session de coaching a ete programmee</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1a1a1a; margin-top: 0;">Bonjour ${data.recipientName}</h2>
          
          <!-- Détails RDV -->
          <div style="background: #f5f5f7; padding: 20px; border-radius: 8px; border-left: 4px solid #ffcc00; margin: 20px 0;">
            <h3 style="color: #ffcc00; margin-top: 0; font-weight: bold;">Details de votre rendez-vous</h3>
            <p style="margin: 10px 0; color: #1a1a1a;"><strong style="color: #0a0a0a;">Coach :</strong> ${data.coachName}</p>
            <p style="margin: 10px 0; color: #1a1a1a;"><strong style="color: #0a0a0a;">Date :</strong> ${new Date(data.appointmentDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="margin: 10px 0; color: #1a1a1a;"><strong style="color: #0a0a0a;">Heure :</strong> ${data.appointmentTime}</p>
            <p style="margin: 10px 0; color: #1a1a1a;"><strong style="color: #0a0a0a;">Type :</strong> ${data.meetingType}</p>
          </div>
          
          <!-- En attente -->
          <div style="background: #fff8e1; padding: 20px; border-radius: 8px; border-left: 4px solid #ffcc00; margin: 20px 0; border: 1px solid #ffcc00;">
            <h3 style="color: #0a0a0a; margin-top: 0; font-weight: bold;">En attente de confirmation</h3>
            <p style="margin: 0; color: #1a1a1a;">
              Votre coach va examiner votre demande et la confirmer sous peu. 
              Vous recevrez une notification de confirmation avec tous les détails.
            </p>
          </div>
          
          ${data.meetLink ? `
          <!-- Lien Meet -->
          <div style="background: #f5f5f7; padding: 20px; border-radius: 8px; border-left: 4px solid #ffcc00; margin: 20px 0; opacity: 0.7;">
            <h3 style="color: #ffcc00; margin-top: 0; font-weight: bold;">Lien de reunion (Une fois confirme)</h3>
            <p style="margin: 10px 0; color: #1a1a1a;">Votre lien Meet sera disponible :</p>
            <p style="margin: 0; color: #666; font-size: 12px; text-align: center;">
              <a href="${data.meetLink}" style="color: #ffcc00; text-decoration: none;">${data.meetLink}</a>
            </p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://prodtalent.com/appointments" 
               style="background: linear-gradient(135deg, #ffcc00 0%, #ffd700 100%); 
                      color: #0a0a0a; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 2px 4px rgba(255, 204, 0, 0.3);">
              Voir mes rendez-vous
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #f5f5f7; margin: 30px 0;">
          
          <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
            ProdTalent - Connecter les talents et opportunités<br>
            <a href="https://prodtalent.com" style="color: #ffcc00; text-decoration: none;">prodtalent.com</a>
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail(data.recipientEmail, subject, htmlBody);
    */
  }

  // Google Calendar API
  async createCalendarEvent(eventData: {
    summary: string;
    description: string;
    startDateTime: string;
    endDateTime: string;
    attendeeEmail: string;
    attendeeName: string;
    meetLink?: string;
  }): Promise<string | null> {
    console.log('📅 GoogleIntegratedService désactivé - utilisant Firebase Functions');
    return null;
    /*
    try {
      if (!this.accessToken) {
        console.log('🔑 Authentification requise pour Calendar');
        const authenticated = await this.signIn();
        if (!authenticated) {
          throw new Error('Authentification Calendar échouée');
        }
      }

      console.log('📅 Création événement Google Calendar...');

      // Générer un Meet link si pas fourni
      const meetLink = eventData.meetLink || this.generateMeetLink();

      const event = {
        summary: eventData.summary,
        description: `${eventData.description}\n\n🎥 Lien Meet: ${meetLink}`,
        location: meetLink, // Mettre le lien Meet en location aussi
        start: {
          dateTime: eventData.startDateTime,
          timeZone: 'Europe/Paris'
        },
        end: {
          dateTime: eventData.endDateTime,
          timeZone: 'Europe/Paris'
        },
        attendees: [{
          email: eventData.attendeeEmail,
          displayName: eventData.attendeeName
        }],
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        }
      };

      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendNotifications: true
      });

      if (response.result && response.result.id) {
        console.log('✅ Événement Calendar créé:', response.result.id);
        console.log('🔗 Meet Link:', meetLink);
        return response.result.id;
      } else {
        console.error('❌ Pas d\'ID événement reçu');
        return null;
      }

    } catch (error) {
      console.error('❌ Erreur création Calendar:', error);
      return null;
    }
    */
  }

  // Template d'email pour les notifications d'offres d'emploi
  async sendJobNotification(data: {
    recipientEmail: string;
    recipientName: string;
    jobTitle: string;
    companyName: string;
    jobLocation: string;
    contractType: string;
    jobDescription: string;
  }): Promise<boolean> {
    console.log('📧 GoogleIntegratedService désactivé - utilisant Firebase Functions');
    return false;
    /*
    const subject = `Nouvelle offre d'emploi - ${data.jobTitle} - ProdTalent`;
    
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f7;">
        <!-- Header offre emploi -->
        <div style="background: linear-gradient(135deg, #ffcc00 0%, #ffd700 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #0a0a0a; margin: 0; font-size: 28px; font-weight: bold;">Nouvelle Offre d'Emploi</h1>
          <p style="color: #0a0a0a; margin: 10px 0 0 0; font-size: 16px;">Une opportunité qui pourrait vous intéresser</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1a1a1a; margin-top: 0;">Bonjour ${data.recipientName}</h2>
          
          <!-- Détails offre -->
          <div style="background: #f5f5f7; padding: 20px; border-radius: 8px; border-left: 4px solid #ffcc00; margin: 20px 0;">
            <h3 style="color: #ffcc00; margin-top: 0; font-weight: bold;">${data.jobTitle}</h3>
            <p style="margin: 10px 0; color: #1a1a1a;"><strong style="color: #0a0a0a;">Entreprise :</strong> ${data.companyName}</p>
            <p style="margin: 10px 0; color: #1a1a1a;"><strong style="color: #0a0a0a;">Localisation :</strong> ${data.jobLocation}</p>
            <p style="margin: 10px 0; color: #1a1a1a;"><strong style="color: #0a0a0a;">Type de contrat :</strong> ${data.contractType}</p>
          </div>
          
          <!-- Description -->
          ${data.jobDescription ? `
          <div style="background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #f5f5f7; margin: 20px 0;">
            <h3 style="color: #1a1a1a; margin-top: 0;">Description du poste</h3>
            <p style="margin: 0; color: #1a1a1a; line-height: 1.6;">${data.jobDescription.substring(0, 200)}${data.jobDescription.length > 200 ? '...' : ''}</p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://prodtalent.com/jobs" 
               style="background: linear-gradient(135deg, #ffcc00 0%, #ffd700 100%); 
                      color: #0a0a0a; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 2px 4px rgba(255, 204, 0, 0.3);">
              Voir l'offre complete
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #f5f5f7; margin: 30px 0;">
          
          <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
            ProdTalent - Connecter les talents et opportunités<br>
            <a href="https://prodtalent.com" style="color: #ffcc00; text-decoration: none;">prodtalent.com</a>
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail(data.recipientEmail, subject, htmlBody);
    */
  }

  // Template d'email de bienvenue
  async sendWelcomeEmail(data: {
    recipientEmail: string;
    recipientName: string;
    userRole: string;
    dashboardUrl: string;
  }): Promise<boolean> {
    console.log('📧 GoogleIntegratedService désactivé - utilisant Firebase Functions');
    return false;
    /*
    const subject = `Bienvenue sur ProdTalent - ${data.userRole}`;
    
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f7;">
        <!-- Header bienvenue -->
        <div style="background: linear-gradient(135deg, #ffcc00 0%, #ffd700 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #0a0a0a; margin: 0; font-size: 28px; font-weight: bold;">Bienvenue sur ProdTalent</h1>
          <p style="color: #0a0a0a; margin: 10px 0 0 0; font-size: 16px;">Votre compte ${data.userRole} a ete cree avec succes</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1a1a1a; margin-top: 0;">Bonjour ${data.recipientName}</h2>
          
          <p style="color: #1a1a1a; line-height: 1.6;">
            Felicitations ! Votre compte <strong>${data.userRole}</strong> sur ProdTalent a ete cree avec succes.
          </p>
          
          <!-- Message selon le rôle -->
          <div style="background: #f5f5f7; padding: 20px; border-radius: 8px; border-left: 4px solid #ffcc00; margin: 20px 0;">
            ${data.userRole === 'Talent' ? `
              <h3 style="color: #ffcc00; margin-top: 0; font-weight: bold;">Prochaines etapes pour les talents</h3>
              <ul style="color: #1a1a1a; line-height: 1.6;">
                <li>Completez votre profil avec vos competences</li>
                <li>Explorez les offres d'emploi disponibles</li>
                <li>Connectez-vous avec des recruteurs et coachs</li>
                <li>Participez aux sessions de coaching</li>
              </ul>
            ` : data.userRole === 'Recruteur' ? `
              <h3 style="color: #ffcc00; margin-top: 0; font-weight: bold;">Prochaines etapes pour les recruteurs</h3>
              <ul style="color: #1a1a1a; line-height: 1.6;">
                <li>Completez votre profil entreprise</li>
                <li>Publiez vos premieres offres d'emploi</li>
                <li>Parcourez les profils de talents</li>
                <li>Utilisez notre systeme de recommandations</li>
              </ul>
            ` : `
              <h3 style="color: #ffcc00; margin-top: 0; font-weight: bold;">Prochaines etapes pour les coachs</h3>
              <ul style="color: #1a1a1a; line-height: 1.6;">
                <li>Configurez votre profil de coach</li>
                <li>Definissez vos disponibilites</li>
                <li>Commencez a accompagner les talents</li>
                <li>Utilisez les outils de recommandation</li>
              </ul>
            `}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.dashboardUrl}" 
               style="background: linear-gradient(135deg, #ffcc00 0%, #ffd700 100%); 
                      color: #0a0a0a; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 2px 4px rgba(255, 204, 0, 0.3);">
              Acceder a mon tableau de bord
            </a>
          </div>
          
          <div style="background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #f5f5f7; margin: 20px 0;">
            <h3 style="color: #1a1a1a; margin-top: 0;">Besoin d'aide ?</h3>
            <p style="margin: 0; color: #1a1a1a; line-height: 1.6;">
              Notre equipe est la pour vous accompagner. N'hesitez pas a nous contacter si vous avez des questions.
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #f5f5f7; margin: 30px 0;">
          
          <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
            ProdTalent - Connecter les talents et opportunites<br>
            <a href="https://prodtalent.com" style="color: #ffcc00; text-decoration: none;">prodtalent.com</a>
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail(data.recipientEmail, subject, htmlBody);
    */
  }

  // Template d'email pour notification nouveau profil talent
  async sendProfileNotification(data: {
    recipientEmail: string;
    recipientName: string;
    talentName: string;
    talentSkills: string;
    talentExperience: string;
  }): Promise<boolean> {
    console.log('📧 GoogleIntegratedService désactivé - utilisant Firebase Functions');
    return false;
    /*
    const subject = `Nouveau talent disponible - ${data.talentName} - ProdTalent`;
    
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f7;">
        <!-- Header nouveau talent -->
        <div style="background: linear-gradient(135deg, #ffcc00 0%, #ffd700 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #0a0a0a; margin: 0; font-size: 28px; font-weight: bold;">Nouveau Talent Disponible</h1>
          <p style="color: #0a0a0a; margin: 10px 0 0 0; font-size: 16px;">Un profil qui pourrait vous interesser</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1a1a1a; margin-top: 0;">Bonjour ${data.recipientName}</h2>
          
          <p style="color: #1a1a1a; line-height: 1.6;">
            Un nouveau talent vient de rejoindre ProdTalent et correspond potentiellement a vos besoins de recrutement.
          </p>
          
          <!-- Profil talent -->
          <div style="background: #f5f5f7; padding: 20px; border-radius: 8px; border-left: 4px solid #ffcc00; margin: 20px 0;">
            <h3 style="color: #ffcc00; margin-top: 0; font-weight: bold;">${data.talentName}</h3>
            <p style="margin: 10px 0; color: #1a1a1a;"><strong style="color: #0a0a0a;">Competences :</strong> ${data.talentSkills}</p>
            <p style="margin: 10px 0; color: #1a1a1a;"><strong style="color: #0a0a0a;">Experience :</strong> ${data.talentExperience}</p>
          </div>
          
          <div style="background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #f5f5f7; margin: 20px 0;">
            <h3 style="color: #1a1a1a; margin-top: 0;">Prochaines etapes</h3>
            <ul style="color: #1a1a1a; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li>Consultez le profil complet du talent</li>
              <li>Contactez-le directement via la messagerie</li>
              <li>Proposez-lui vos offres d'emploi</li>
              <li>Organisez un entretien si le profil correspond</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://prodtalent.com/talents" 
               style="background: linear-gradient(135deg, #ffcc00 0%, #ffd700 100%); 
                      color: #0a0a0a; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 2px 4px rgba(255, 204, 0, 0.3);">
              Voir le profil du talent
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #f5f5f7; margin: 30px 0;">
          
          <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
            ProdTalent - Connecter les talents et opportunites<br>
            <a href="https://prodtalent.com" style="color: #ffcc00; text-decoration: none;">prodtalent.com</a>
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail(data.recipientEmail, subject, htmlBody);
    */
  }

  // Générer un lien Meet fonctionnel
  private generateMeetLink(): string {
    const meetCode = `${Date.now().toString(36).substr(-3)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 3)}`;
    return `https://meet.google.com/${meetCode}`;
  }
}

export const googleIntegratedService = new GoogleIntegratedService();