class GoogleCalendarClientService {
    constructor() {
        this.isInitialized = false;
        this.isAuthenticated = false;
    }
    // Initialiser l'API Google JavaScript
    async initializeGapi() {
        try {
            // Charger l'API Google si elle n'est pas déjà chargée
            if (!window.gapi) {
                await this.loadGoogleApi();
            }
            await new Promise((resolve, reject) => {
                window.gapi.load('client:auth2', {
                    callback: resolve,
                    onerror: reject
                });
            });
            // Initialiser le client API
            await window.gapi.client.init({
                apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
                clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
                scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events'
            });
            this.isInitialized = true;
            this.isAuthenticated = window.gapi.auth2.getAuthInstance().isSignedIn.get();
            return true;
        }
        catch (error) {
            console.error('Erreur lors de l\'initialisation de l\'API Google:', error);
            return false;
        }
    }
    async loadGoogleApi() {
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
    async authenticate() {
        try {
            if (!this.isInitialized) {
                const initialized = await this.initializeGapi();
                if (!initialized)
                    return false;
            }
            const authInstance = window.gapi.auth2.getAuthInstance();
            if (!authInstance.isSignedIn.get()) {
                await authInstance.signIn();
            }
            this.isAuthenticated = authInstance.isSignedIn.get();
            return this.isAuthenticated;
        }
        catch (error) {
            console.error('Erreur lors de l\'authentification:', error);
            return false;
        }
    }
    async signOut() {
        try {
            if (this.isInitialized) {
                const authInstance = window.gapi.auth2.getAuthInstance();
                await authInstance.signOut();
                this.isAuthenticated = false;
            }
        }
        catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    }
    isUserAuthenticated() {
        return this.isAuthenticated;
    }
    async createEvent(event) {
        try {
            if (!this.isAuthenticated) {
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
            return response.result.id;
        }
        catch (error) {
            console.error('Erreur lors de la création de l\'événement:', error);
            return null;
        }
    }
    async getEvents(startDate, endDate) {
        try {
            if (!this.isAuthenticated) {
                throw new Error('Utilisateur non authentifié');
            }
            const response = await window.gapi.client.calendar.events.list({
                calendarId: 'primary',
                timeMin: startDate,
                timeMax: endDate,
                singleEvents: true,
                orderBy: 'startTime'
            });
            return response.result.items?.map((item) => ({
                id: item.id,
                summary: item.summary,
                description: item.description,
                start: item.start,
                end: item.end,
                attendees: item.attendees
            })) || [];
        }
        catch (error) {
            console.error('Erreur lors de la récupération des événements:', error);
            return [];
        }
    }
    async deleteEvent(eventId) {
        try {
            if (!this.isAuthenticated) {
                throw new Error('Utilisateur non authentifié');
            }
            await window.gapi.client.calendar.events.delete({
                calendarId: 'primary',
                eventId: eventId
            });
            return true;
        }
        catch (error) {
            console.error('Erreur lors de la suppression de l\'événement:', error);
            return false;
        }
    }
    async updateEvent(eventId, event) {
        try {
            if (!this.isAuthenticated) {
                throw new Error('Utilisateur non authentifié');
            }
            await window.gapi.client.calendar.events.update({
                calendarId: 'primary',
                eventId: eventId,
                resource: event
            });
            return true;
        }
        catch (error) {
            console.error('Erreur lors de la mise à jour de l\'événement:', error);
            return false;
        }
    }
    // Générer des créneaux disponibles pour les 4 prochaines semaines
    generateAvailableSlots(availabilitySlots, existingEvents) {
        const availableDates = [];
        const today = new Date();
        for (let i = 0; i < 28; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            const dayOfWeek = this.getDayOfWeek(dateString);
            const slotsForDay = availabilitySlots.filter(slot => slot.day === dayOfWeek && slot.isAvailable);
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
    getDayOfWeek(dateString) {
        const date = new Date(dateString);
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[date.getDay()];
    }
    isSlotBooked(date, startTime, endTime, events) {
        const slotStart = new Date(`${date}T${startTime}`);
        const slotEnd = new Date(`${date}T${endTime}`);
        return events.some(event => {
            if (!event.start?.dateTime || !event.end?.dateTime)
                return false;
            const eventStart = new Date(event.start.dateTime);
            const eventEnd = new Date(event.end.dateTime);
            // Vérifier s'il y a une collision de temps
            return (slotStart < eventEnd && slotEnd > eventStart);
        });
    }
    // Créer un événement de coaching
    async createCoachingSession(talentName, talentEmail, date, startTime, endTime, notes) {
        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(`${date}T${endTime}`);
        const event = {
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
}
// Instance singleton
export const googleCalendarClientService = new GoogleCalendarClientService();
export default googleCalendarClientService;
