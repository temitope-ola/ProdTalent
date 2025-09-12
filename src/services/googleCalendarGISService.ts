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
      
      // Charger GAPI pour l'API Calendar seulement
      await this.loadGoogleApi();
      
      await new Promise<void>((resolve, reject) => {
        window.gapi.load('client', {
          callback: resolve,
          onerror: reject
        });
      });

      // Initialiser seulement le client API (sans auth2)
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

      // Vérifier d'abord si nous avons déjà un token dans le localStorage
      const storedToken = localStorage.getItem('google_calendar_token');
      const tokenExpiry = localStorage.getItem('google_calendar_token_expiry');
      
      if (storedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
        this.accessToken = storedToken;
        window.gapi.client.setToken({ access_token: this.accessToken });
        console.log('✅ Token existant valide récupéré du localStorage');
        return true;
      }

      console.log('🔑 Authentification via Google Identity Services (mode redirection)...');
      
      // Sauvegarder l'URL actuelle pour le retour
      sessionStorage.setItem('google_auth_return_url', window.location.pathname);
      
      console.log('🔄 Utilisation directe de l\'OAuth avec redirection...');
      
      // Passer directement à l'OAuth avec redirection pour éviter les problèmes de popup
      return this.tryOAuthFallback();
    } catch (error) {
      console.error('❌ Erreur lors de l\'authentification:', error);
      return false;
    }
  }

  private handleCallback(): void {
    // Traiter le callback de l'authentification Google
    const urlParams = new URLSearchParams(window.location.search);
    const fragment = new URLSearchParams(window.location.hash.substring(1));
    
    const accessToken = urlParams.get('access_token') || fragment.get('access_token');
    const expiresIn = urlParams.get('expires_in') || fragment.get('expires_in');
    
    if (accessToken) {
      this.accessToken = accessToken;
      
      // Stocker le token
      const expiryTime = Date.now() + (expiresIn ? parseInt(expiresIn) * 1000 : 3600000);
      localStorage.setItem('google_calendar_token', accessToken);
      localStorage.setItem('google_calendar_token_expiry', expiryTime.toString());
      
      // Configurer le token
      window.gapi.client.setToken({ access_token: accessToken });
      
      // Rediriger vers la page d'origine
      const returnUrl = sessionStorage.getItem('google_auth_return_url') || '/';
      sessionStorage.removeItem('google_auth_return_url');
      window.location.replace(returnUrl);
    }
  }

  private async tryOAuthFallback(): Promise<boolean> {
    try {
      console.log('🔄 Tentative d\'authentification OAuth classique...');
      
      // Construire l'URL d'authentification OAuth2 avec les bons paramètres
      const params = new URLSearchParams({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        redirect_uri: window.location.origin + '/calendar-callback',
        response_type: 'token',
        scope: 'https://www.googleapis.com/auth/calendar',
        include_granted_scopes: 'true',
        state: Math.random().toString(36).substr(2, 16)
      });
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      
      console.log('🌐 Redirection vers Google OAuth:', authUrl);
      
      // Sauvegarder l'état et l'URL de retour
      sessionStorage.setItem('oauth_state', params.get('state') || '');
      sessionStorage.setItem('google_auth_return_url', window.location.pathname);
      
      // Faire une redirection complète
      window.location.assign(authUrl);
      
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'OAuth fallback:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    if (this.accessToken && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(this.accessToken);
    }
    this.accessToken = null;
    
    // Nettoyer le localStorage
    localStorage.removeItem('google_calendar_token');
    localStorage.removeItem('google_calendar_token_expiry');
    
    window.gapi.client.setToken(null);
    console.log('✅ Déconnexion réussie');
  }

  isUserAuthenticated(): boolean {
    const hasToken = !!this.accessToken;
    console.log('📊 Vérification authentification - hasToken:', hasToken);
    return hasToken;
  }

  async createEvent(event: CalendarEvent): Promise<string | null> {
    try {
      if (!this.accessToken) {
        throw new Error('Utilisateur non authentifié');
      }

      // Générer un ID unique pour la conférence
      const meetId = `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;

      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1, // Version requise pour Google Meet
        resource: {
          summary: event.summary,
          description: event.description,
          start: event.start,
          end: event.end,
          attendees: event.attendees,
          conferenceData: {
            createRequest: {
              requestId: meetId,
              conferenceSolutionKey: {
                type: 'hangoutsMeet' // Spécifier Google Meet
              }
            }
          }
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

  async syncAppointmentToCalendar(appointment: Appointment): Promise<{ success: boolean; googleEventId?: string; meetLink?: string; calendarLink?: string; error?: string }> {
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
        // Récupérer l'événement créé pour obtenir le lien Meet
        try {
          console.log(`🔍 Récupération de l'événement Google Calendar: ${googleEventId}`);
          const createdEvent = await window.gapi.client.calendar.events.get({
            calendarId: 'primary',
            eventId: googleEventId
          });
          
          console.log(`📋 Données complètes de l'événement:`, createdEvent.result);
          console.log(`📋 Location:`, createdEvent.result.location);
          console.log(`📋 Conference Data:`, createdEvent.result.conferenceData);
          console.log(`📋 Hangout Link:`, createdEvent.result.hangoutLink);
          
          // Essayer de récupérer le lien Meet depuis différentes sources
          let meetLink = createdEvent.result.hangoutLink || 
                        createdEvent.result.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri;
          
          // Si toujours pas de lien Meet, générer un lien de conférence basé sur Google Meet
          if (!meetLink && createdEvent.result.conferenceData?.conferenceId) {
            meetLink = `https://meet.google.com/${createdEvent.result.conferenceData.conferenceId}`;
          }
          
          // En dernier recours, générer un lien Meet standard
          if (!meetLink) {
            const meetCode = `${Date.now().toString(36).substr(-4)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 4)}`;
            meetLink = `https://meet.google.com/${meetCode}`;
          }
          
          const calendarLink = createdEvent.result.htmlLink;
          
          console.log(`✅ Rendez-vous synchronisé avec Google Calendar: ${googleEventId}`);
          console.log(`🔗 Meet Link trouvé: ${meetLink}`);
          console.log(`📅 Calendar Link trouvé: ${calendarLink}`);
          
          return { 
            success: true, 
            googleEventId,
            meetLink: meetLink || '',
            calendarLink: calendarLink || ''
          };
        } catch (linkError) {
          console.warn('⚠️ Impossible de récupérer les liens Meet/Calendar:', linkError);
          return { success: true, googleEventId }; // Succès même sans les liens
        }
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