/**
 * Service Google Calendar moderne avec Google Identity Services (GIS)
 * Remplace l'ancienne API gapi.auth2 dépréciée
 */

declare global {
  interface Window {
    google: any;
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

class ModernGoogleCalendarService {
  private CLIENT_ID = '939426446725-cgmd8eudsqmkccv94u2hsrj3idlb7fps.apps.googleusercontent.com';
  private SCOPES = ['https://www.googleapis.com/auth/calendar'];
  private isSignedIn = false;
  private isInitialized = false;
  private accessToken = '';

  constructor() {
    console.log('🆕 Initialisation Google Calendar moderne (GIS):', {
      CLIENT_ID: this.CLIENT_ID,
      SCOPES: this.SCOPES,
      currentOrigin: window.location.origin
    });
  }

  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      console.log('🚀 Chargement Google Identity Services...');
      
      // Charger Google Identity Services
      await this.loadGoogleIdentityServices();
      
      // Charger Google API Client
      await this.loadGoogleAPIClient();

      // Initialiser le client GAPI
      await new Promise<void>((resolve, reject) => {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
            });
            
            this.isInitialized = true;
            console.log('✅ Google Calendar moderne initialisé');
            resolve();
          } catch (error) {
            console.error('❌ Erreur init GAPI client:', error);
            reject(error);
          }
        });
      });

      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation Google Calendar moderne:', error);
      return false;
    }
  }

  private loadGoogleIdentityServices(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        console.log('✅ Google Identity Services chargé');
        resolve();
      };
      script.onerror = () => reject(new Error('Impossible de charger Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  private loadGoogleAPIClient(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        console.log('✅ Google API Client chargé');
        resolve();
      };
      script.onerror = () => reject(new Error('Impossible de charger Google API Client'));
      document.head.appendChild(script);
    });
  }

  async signIn(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        const success = await this.initialize();
        if (!success) return false;
      }

      console.log('🔐 Connexion avec Google Identity Services...');

      return new Promise((resolve) => {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: this.CLIENT_ID,
          scope: this.SCOPES.join(' '),
          callback: (response: any) => {
            if (response.error) {
              console.error('❌ Erreur authentification:', response.error);
              resolve(false);
              return;
            }

            this.accessToken = response.access_token;
            this.isSignedIn = true;
            
            // Configurer le token pour les appels API
            window.gapi.client.setToken({
              access_token: this.accessToken
            });

            console.log('✅ Connexion Google Calendar réussie');
            resolve(true);
          },
        });

        tokenClient.requestAccessToken();
      });
    } catch (error) {
      console.error('❌ Erreur connexion Google Calendar moderne:', error);
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

      console.log('📅 Création rendez-vous avec Google Meet moderne...', data);

      // Créer les dates ISO
      const startDateTime = new Date(`${data.date}T${data.startTime}:00`);
      const endDateTime = new Date(`${data.date}T${data.endTime}:00`);

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
        conferenceData: {
          createRequest: {
            requestId: `prodtalent-${Date.now()}`,
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
        sendUpdates: 'all'
      });

      if (response.status === 200) {
        const createdEvent = response.result;
        const meetLink = createdEvent.hangoutLink || createdEvent.conferenceData?.entryPoints?.[0]?.uri;
        
        console.log('✅ Rendez-vous moderne créé avec Meet:', {
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
        return { success: false, error: `Erreur API: ${response.status}` };
      }

    } catch (error) {
      console.error('❌ Erreur création rendez-vous moderne:', error);
      return { success: false, error: (error as Error).message };
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
        q: 'Coaching'
      });

      return response.result.items || [];
    } catch (error) {
      console.error('❌ Erreur récupération rendez-vous modernes:', error);
      return [];
    }
  }

  getConnectionStatus(): { isSignedIn: boolean; isInitialized: boolean; message: string } {
    return {
      isSignedIn: this.isSignedIn,
      isInitialized: this.isInitialized,
      message: this.isSignedIn 
        ? 'Connecté à Google Calendar (moderne)' 
        : this.isInitialized 
        ? 'Initialisé, mais non connecté'
        : 'Non initialisé'
    };
  }

  async testCalendar(): Promise<boolean> {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const testData: AppointmentData = {
        coachName: 'Coach Test Moderne',
        coachEmail: 'admin@prodtalent.com',
        talentName: 'Talent Test Moderne',
        talentEmail: 'admin@prodtalent.com',
        date: tomorrow.toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '15:00',
        description: 'Test de création avec Google Identity Services moderne'
      };

      const result = await this.createAppointmentWithMeet(testData);
      return result.success;
    } catch (error) {
      console.error('❌ Erreur test Calendar moderne:', error);
      return false;
    }
  }
}

export const modernGoogleCalendarService = new ModernGoogleCalendarService();
export default modernGoogleCalendarService;