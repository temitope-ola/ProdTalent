declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
}

export interface AvailabilitySlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// Import additional services for talent integration
import { AppointmentService } from './appointmentService';
import { Appointment } from '../types';

class GoogleCalendarGISService {
  private accessToken: string | null = null;
  private isInitialized = false;

  async initializeGIS(): Promise<boolean> {
    try {
      // Charger Google Identity Services
      await this.loadGoogleIdentityServices();
      
      // Charger aussi GAPI pour l'API Calendar
      await this.loadGoogleApi();
      
      await new Promise<void>((resolve, reject) => {
        window.gapi.load('client', {
          callback: resolve,
          onerror: reject
        });
      });

      // Initialiser le client GAPI pour l'API Calendar
      await window.gapi.client.init({
        apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
      });

      this.isInitialized = true;
      console.log('✅ Google Identity Services initialisé avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
      return false;
    }
  }

  private async loadGoogleIdentityServices(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
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

  async authenticate(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initializeGIS();
        if (!initialized) return false;
      }

      return new Promise<boolean>((resolve) => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
          callback: (response: any) => {
            if (response.error) {
              console.error('❌ Erreur d\'authentification:', response.error);
              resolve(false);
              return;
            }
            
            this.accessToken = response.access_token;
            console.log('✅ Connexion Google réussie !');
            
            // Configurer le token pour les requêtes GAPI
            window.gapi.client.setToken({
              access_token: this.accessToken
            });
            
            resolve(true);
          },
        });

        // Démarrer le processus d'authentification
        client.requestAccessToken();
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'authentification:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    if (this.accessToken && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(this.accessToken);
    }
    this.accessToken = null;
    window.gapi.client.setToken(null);
    console.log('✅ Déconnexion réussie');
  }

  isUserAuthenticated(): boolean {
    return !!this.accessToken;
  }

  async createEvent(event: CalendarEvent): Promise<string | null> {
    try {
      if (!this.accessToken) {
        throw new Error('Utilisateur non authentifié');
      }

      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: {
          summary: event.summary,
          description: event.description,
          start: event.start,
          end: event.end,
          attendees: event.attendees
        }
      });

      console.log('✅ Événement créé:', event.summary);
      return response.result.id;
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'événement:', error);
      return null;
    }
  }

  async getEvents(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    try {
      if (!this.accessToken) {
        throw new Error('Utilisateur non authentifié');
      }

      // S'assurer que le token est bien configuré avant la requête
      window.gapi.client.setToken({
        access_token: this.accessToken
      });

      // Vérifier si le token est encore valide
      const tokenInfo = window.gapi.client.getToken();
      if (!tokenInfo || !tokenInfo.access_token) {
        console.warn('⚠️ Token invalide, réauthentification nécessaire');
        throw new Error('Token invalide');
      }

      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate,
        timeMax: endDate,
        singleEvents: true,
        orderBy: 'startTime'
      });

      const events = response.result.items?.map((item: any) => ({
        id: item.id,
        summary: item.summary,
        description: item.description,
        start: item.start,
        end: item.end,
        attendees: item.attendees
      })) || [];

      console.log(`✅ ${events.length} événements récupérés`);
      return events;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des événements:', error);
      
      // Si l'erreur est liée à l'authentification, effacer le token
      if (error && typeof error === 'object' && 'result' in error && error.result?.error?.code === 401) {
        console.log('🔄 Token expiré, effacement du token local');
        this.accessToken = null;
        window.gapi.client.setToken(null);
      }
      
      return [];
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      if (!this.accessToken) {
        throw new Error('Utilisateur non authentifié');
      }

      await window.gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId
      });

      console.log('✅ Événement supprimé');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'événement:', error);
      return false;
    }
  }

  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<boolean> {
    try {
      if (!this.accessToken) {
        throw new Error('Utilisateur non authentifié');
      }

      await window.gapi.client.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event
      });

      console.log('✅ Événement mis à jour');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'événement:', error);
      return false;
    }
  }

  generateAvailableSlots(availabilitySlots: AvailabilitySlot[], existingEvents: CalendarEvent[]): Array<{
    date: string;
    slots: Array<{
      id: string;
      startTime: string;
      endTime: string;
      isBooked: boolean;
    }>;
  }> {
    const availableDates = [];
    const today = new Date();
    
    for (let i = 0; i < 28; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayOfWeek = this.getDayOfWeek(dateString);
      const slotsForDay = availabilitySlots.filter(slot => 
        slot.day === dayOfWeek && slot.isAvailable
      );

      if (slotsForDay.length > 0) {
        availableDates.push({
          date: dateString,
          slots: slotsForDay.map(slot => ({
            id: slot.id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isBooked: this.isSlotBooked(dateString, slot.startTime, slot.endTime, existingEvents)
          }))
        });
      }
    }

    return availableDates;
  }

  private getDayOfWeek(dateString: string): string {
    const date = new Date(dateString);
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  private isSlotBooked(date: string, startTime: string, endTime: string, events: CalendarEvent[]): boolean {
    const slotStart = new Date(`${date}T${startTime}`);
    const slotEnd = new Date(`${date}T${endTime}`);

    return events.some(event => {
      if (!event.start?.dateTime || !event.end?.dateTime) return false;
      
      const eventStart = new Date(event.start.dateTime);
      const eventEnd = new Date(event.end.dateTime);

      return (slotStart < eventEnd && slotEnd > eventStart);
    });
  }

  async createCoachingSession(
    talentName: string,
    talentEmail: string,
    date: string,
    startTime: string,
    endTime: string,
    notes?: string
  ): Promise<string | null> {
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    const event: CalendarEvent = {
      summary: `Session de coaching avec ${talentName}`,
      description: notes || 'Session de coaching ProdTalent',
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
          email: talentEmail,
          displayName: talentName
        }
      ]
    };

    return this.createEvent(event);
  }

  async syncAppointmentToCalendar(appointment: Appointment): Promise<{ success: boolean; googleEventId?: string; error?: string }> {
    try {
      if (!this.accessToken) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      const [hours, minutes] = appointment.time.split(':').map(Number);
      const startDateTime = new Date(appointment.date);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + appointment.duration);

      const event: CalendarEvent = {
        summary: `Coaching ${appointment.type} avec ${appointment.talentName}`,
        description: `Session de coaching ProdTalent\n\nType: ${appointment.type}\n${appointment.notes ? `Notes: ${appointment.notes}` : ''}`,
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
            email: appointment.talentEmail,
            displayName: appointment.talentName
          }
        ]
      };

      const googleEventId = await this.createEvent(event);
      
      if (googleEventId) {
        console.log(`✅ Rendez-vous synchronisé avec Google Calendar: ${googleEventId}`);
        return { success: true, googleEventId };
      } else {
        return { success: false, error: 'Échec de la création de l\'événement Google Calendar' };
      }
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
      return { success: false, error: 'Erreur lors de la synchronisation avec Google Calendar' };
    }
  }

  async updateSyncedEvent(googleEventId: string, appointment: Partial<Appointment>): Promise<boolean> {
    try {
      if (!this.accessToken) {
        console.error('❌ Utilisateur non authentifié');
        return false;
      }

      const updateData: Partial<CalendarEvent> = {};
      
      if (appointment.talentName) {
        updateData.summary = `Coaching ${appointment.type || ''} avec ${appointment.talentName}`;
      }
      
      if (appointment.notes || appointment.type) {
        updateData.description = `Session de coaching ProdTalent\n\nType: ${appointment.type || ''}\n${appointment.notes ? `Notes: ${appointment.notes}` : ''}`;
      }
      
      if (appointment.date && appointment.time && appointment.duration) {
        const [hours, minutes] = appointment.time.split(':').map(Number);
        const startDateTime = new Date(appointment.date);
        startDateTime.setHours(hours, minutes, 0, 0);
        
        const endDateTime = new Date(startDateTime);
        endDateTime.setMinutes(endDateTime.getMinutes() + appointment.duration);
        
        updateData.start = {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Europe/Paris'
        };
        updateData.end = {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Europe/Paris'
        };
      }
      
      if (appointment.talentEmail && appointment.talentName) {
        updateData.attendees = [
          {
            email: appointment.talentEmail,
            displayName: appointment.talentName
          }
        ];
      }

      const success = await this.updateEvent(googleEventId, updateData);
      
      if (success) {
        console.log(`✅ Événement Google Calendar mis à jour: ${googleEventId}`);
      }
      
      return success;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'événement synchronisé:', error);
      return false;
    }
  }

  async deleteSyncedEvent(googleEventId: string): Promise<boolean> {
    try {
      const success = await this.deleteEvent(googleEventId);
      
      if (success) {
        console.log(`✅ Événement Google Calendar supprimé: ${googleEventId}`);
      }
      
      return success;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'événement synchronisé:', error);
      return false;
    }
  }

  async syncAllAppointments(coachId: string): Promise<{ success: boolean; syncedCount: number; errors: string[] }> {
    try {
      if (!this.accessToken) {
        return { success: false, syncedCount: 0, errors: ['Utilisateur non authentifié'] };
      }

      console.log('🔄 Synchronisation de tous les rendez-vous...');
      
      const appointmentsResult = await AppointmentService.getCoachAppointments(coachId);
      
      if (!appointmentsResult.success || !appointmentsResult.data) {
        return { success: false, syncedCount: 0, errors: ['Impossible de récupérer les rendez-vous'] };
      }

      const appointments = appointmentsResult.data.filter(apt => apt.status === 'confirmé');
      let syncedCount = 0;
      const errors: string[] = [];

      for (const appointment of appointments) {
        const syncResult = await this.syncAppointmentToCalendar(appointment);
        
        if (syncResult.success) {
          syncedCount++;
        } else {
          errors.push(`Erreur pour ${appointment.talentName}: ${syncResult.error}`);
        }
      }

      console.log(`✅ Synchronisation terminée: ${syncedCount}/${appointments.length} rendez-vous synchronisés`);
      
      return {
        success: true,
        syncedCount,
        errors
      };
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation complète:', error);
      return { success: false, syncedCount: 0, errors: ['Erreur lors de la synchronisation complète'] };
    }
  }
}

const googleCalendarGISService = new GoogleCalendarGISService();
export { googleCalendarGISService };
export default googleCalendarGISService;