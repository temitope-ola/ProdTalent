/**
 * Service Google Calendar + Meet pour ProdTalent
 * Crée des rendez-vous avec Google Meet automatique
 */

declare global {
  interface Window {
    gapi: any;
  }
}

interface CalendarEvent {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: Array<{
    email: string;
    displayName?: string;
  }>;
  conferenceData?: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: {
        type: string;
      };
    };
  };
  reminders?: {
    useDefault: boolean;
    overrides: Array<{
      method: string;
      minutes: number;
    }>;
  };
}

interface AppointmentData {
  coachName: string;
  coachEmail: string;
  talentName: string;
  talentEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
}

class GoogleCalendarMeetService {
  private CLIENT_ID = '939426446725-cgmd8eudsqmkccv94u2hsrj3idlb7fps.apps.googleusercontent.com';
  private SCOPES = 'https://www.googleapis.com/auth/calendar';
  private isSignedIn = false;
  private isInitialized = false;

  // Vérification du CLIENT_ID
  constructor() {
    console.log('🔧 Configuration Google Calendar:', {
      CLIENT_ID: this.CLIENT_ID,
      SCOPES: this.SCOPES,
      currentOrigin: window.location.origin
    });
  }

  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      console.log('🚀 Initialisation Google Calendar + Meet...');
      
      // Charger Google API
      if (!window.gapi) {
        await this.loadGoogleAPI();
      }

      // Attendre que gapi soit complètement chargé
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Initialiser GAPI avec les bonnes permissions
      await new Promise<void>((resolve, reject) => {
        window.gapi.load('auth2:client', async () => {
          try {
            // Initialiser Auth2 d'abord
            await window.gapi.auth2.init({
              client_id: this.CLIENT_ID,
              scope: this.SCOPES
            });

            // Puis initialiser Client
            await window.gapi.client.init({
              clientId: this.CLIENT_ID,
              scope: this.SCOPES,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
            });

            this.isInitialized = true;
            
            // Vérifier si déjà connecté
            const authInstance = window.gapi.auth2.getAuthInstance();
            this.isSignedIn = authInstance ? authInstance.isSignedIn.get() : false;

            console.log('✅ Google Calendar + Meet initialisé, connecté:', this.isSignedIn);
            resolve();
          } catch (error) {
            console.error('❌ Erreur initialisation complète:', {
              message: error.message,
              details: error.details,
              error: error
            });
            reject(error);
          }
        });
      });

      return true;
    } catch (error) {
      console.error('❌ Erreur service Calendar complète:', {
        message: error.message,
        details: error.details,
        error: error
      });
      return false;
    }
  }

  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Impossible de charger Google API'));
      document.head.appendChild(script);
    });
  }

  async signIn(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        const success = await this.initialize();
        if (!success) return false;
      }

      const authInstance = window.gapi.auth2.getAuthInstance();
      if (!authInstance) {
        console.error('❌ Auth instance non disponible');
        return false;
      }

      const user = await authInstance.signIn();
      
      if (user && user.isSignedIn()) {
        this.isSignedIn = true;
        console.log('✅ Connexion Google Calendar réussie');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erreur connexion Calendar:', error);
      return false;
    }
  }

  async createAppointmentWithMeet(data: AppointmentData): Promise<{
    success: boolean;
    eventId?: string;
    meetLink?: string;
    calendarLink?: string;
    error?: string;
  }> {
    try {
      if (!this.isSignedIn) {
        const signedIn = await this.signIn();
        if (!signedIn) {
          return { success: false, error: 'Connexion Google échouée' };
        }
      }

      console.log('📅 Création rendez-vous avec Meet...', data);

      // Créer les dates ISO
      const startDateTime = new Date(`${data.date}T${data.startTime}:00`);
      const endDateTime = new Date(`${data.date}T${data.endTime}:00`);

      // Événement avec Google Meet automatique
      const event: CalendarEvent = {
        summary: `Coaching - ${data.talentName} avec ${data.coachName}`,
        description: data.description || `Session de coaching ProdTalent
        
🧑‍🏫 Coach: ${data.coachName}
👤 Talent: ${data.talentName}
📧 Contact coach: ${data.coachEmail}
📧 Contact talent: ${data.talentEmail}

Cette session de coaching a été planifiée via ProdTalent.
Le lien Google Meet sera généré automatiquement.`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Europe/Paris'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Europe/Paris'
        },
        attendees: [
          {
            email: data.coachEmail,
            displayName: data.coachName
          },
          {
            email: data.talentEmail,
            displayName: data.talentName
          }
        ],
        // IMPORTANT: Ajouter Google Meet automatiquement
        conferenceData: {
          createRequest: {
            requestId: `prodtalent-${Date.now()}`, // ID unique
            conferenceSolutionKey: {
              type: 'hangoutsMeet' // Génère un lien Google Meet
            }
          }
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 jour avant
            { method: 'email', minutes: 60 },      // 1 heure avant
            { method: 'popup', minutes: 30 }       // 30 min avant
          ]
        }
      };

      // Créer l'événement avec Meet
      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1, // IMPORTANT: Active Google Meet
        sendUpdates: 'all' // Envoie les invitations automatiquement
      });

      if (response.status === 200) {
        const createdEvent = response.result;
        const meetLink = createdEvent.hangoutLink || createdEvent.conferenceData?.entryPoints?.[0]?.uri;
        
        console.log('✅ Rendez-vous créé avec Meet:', {
          eventId: createdEvent.id,
          meetLink: meetLink
        });

        return {
          success: true,
          eventId: createdEvent.id,
          meetLink: meetLink,
          calendarLink: createdEvent.htmlLink
        };
      } else {
        console.error('❌ Erreur création événement:', response);
        return { success: false, error: `Erreur API: ${response.status}` };
      }

    } catch (error) {
      console.error('❌ Erreur création rendez-vous:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  async updateAppointment(eventId: string, updates: Partial<AppointmentData>): Promise<boolean> {
    try {
      if (!this.isSignedIn) {
        const signedIn = await this.signIn();
        if (!signedIn) return false;
      }

      // Récupérer l'événement existant
      const getResponse = await window.gapi.client.calendar.events.get({
        calendarId: 'primary',
        eventId: eventId
      });

      if (getResponse.status !== 200) {
        console.error('❌ Événement non trouvé:', eventId);
        return false;
      }

      const existingEvent = getResponse.result;

      // Mettre à jour les champs modifiés
      if (updates.startTime || updates.endTime || updates.date) {
        const date = updates.date || existingEvent.start.dateTime.split('T')[0];
        const startTime = updates.startTime || existingEvent.start.dateTime.split('T')[1];
        const endTime = updates.endTime || existingEvent.end.dateTime.split('T')[1];

        existingEvent.start.dateTime = new Date(`${date}T${startTime}`).toISOString();
        existingEvent.end.dateTime = new Date(`${date}T${endTime}`).toISOString();
      }

      if (updates.coachName || updates.talentName) {
        existingEvent.summary = `Coaching - ${updates.talentName || 'Talent'} avec ${updates.coachName || 'Coach'}`;
      }

      // Sauvegarder les modifications
      const updateResponse = await window.gapi.client.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: existingEvent,
        sendUpdates: 'all'
      });

      console.log('✅ Rendez-vous mis à jour:', updateResponse.result.id);
      return updateResponse.status === 200;

    } catch (error) {
      console.error('❌ Erreur mise à jour rendez-vous:', error);
      return false;
    }
  }

  async cancelAppointment(eventId: string, reason?: string): Promise<boolean> {
    try {
      if (!this.isSignedIn) {
        const signedIn = await this.signIn();
        if (!signedIn) return false;
      }

      // Option 1: Supprimer complètement
      // await window.gapi.client.calendar.events.delete({
      //   calendarId: 'primary',
      //   eventId: eventId,
      //   sendUpdates: 'all'
      // });

      // Option 2: Marquer comme annulé (plus professionnel)
      const getResponse = await window.gapi.client.calendar.events.get({
        calendarId: 'primary',
        eventId: eventId
      });

      if (getResponse.status === 200) {
        const event = getResponse.result;
        event.summary = `[ANNULÉ] ${event.summary}`;
        event.description = `${event.description}\n\n❌ RENDEZ-VOUS ANNULÉ${reason ? `\nRaison: ${reason}` : ''}`;
        event.status = 'cancelled';

        await window.gapi.client.calendar.events.update({
          calendarId: 'primary',
          eventId: eventId,
          resource: event,
          sendUpdates: 'all'
        });

        console.log('✅ Rendez-vous annulé:', eventId);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Erreur annulation rendez-vous:', error);
      return false;
    }
  }

  async getUpcomingAppointments(maxResults = 10): Promise<Array<any>> {
    try {
      if (!this.isSignedIn) {
        const signedIn = await this.signIn();
        if (!signedIn) return [];
      }

      const now = new Date().toISOString();
      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: now,
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime',
        q: 'Coaching' // Rechercher seulement les événements de coaching
      });

      return response.result.items || [];
    } catch (error) {
      console.error('❌ Erreur récupération rendez-vous:', error);
      return [];
    }
  }

  getConnectionStatus(): { isSignedIn: boolean; isInitialized: boolean; message: string } {
    return {
      isSignedIn: this.isSignedIn,
      isInitialized: this.isInitialized,
      message: this.isSignedIn 
        ? 'Connecté à Google Calendar' 
        : this.isInitialized 
        ? 'Initialisé, mais non connecté'
        : 'Non initialisé'
    };
  }

  // Test rapide
  async testCalendar(): Promise<boolean> {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0);

      const endTime = new Date(tomorrow);
      endTime.setHours(15, 0, 0, 0);

      const testData: AppointmentData = {
        coachName: 'Coach Test',
        coachEmail: 'coach@test.com',
        talentName: 'Talent Test',
        talentEmail: 'talent@test.com',
        date: tomorrow.toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '15:00',
        description: 'Test de création d\'événement avec Google Meet automatique'
      };

      const result = await this.createAppointmentWithMeet(testData);
      return result.success;
    } catch (error) {
      console.error('❌ Erreur test Calendar:', error);
      return false;
    }
  }
}

export const googleCalendarMeetService = new GoogleCalendarMeetService();
export default googleCalendarMeetService;