// Service pour générer des liens Google Calendar manuellement
import { TimezoneService } from './timezoneService';

export class CalendarLinkService {
  /**
   * Génère un lien Google Calendar pour un rendez-vous
   * @param appointment - Données du rendez-vous
   * @returns URL Google Calendar
   */
  static generateCalendarLink(appointment: {
    date: string;
    time: string;
    duration?: number;
    talentName: string;
    coachName: string;
    notes?: string;
    meetLink?: string;
    coachTimezone?: string;
    talentTimezone?: string;
  }): string {
    try {
      // 🔧 CORRECTION TIMEZONE: Créer la date dans le timezone du coach, puis convertir vers le timezone utilisateur
      let startTime = appointment.time;

      // Si on a les timezones et qu'ils sont différents, convertir l'heure
      if (appointment.coachTimezone && appointment.talentTimezone &&
          appointment.coachTimezone !== appointment.talentTimezone) {
        startTime = TimezoneService.convertTime(
          appointment.time,
          appointment.date,
          appointment.coachTimezone,
          appointment.talentTimezone
        );
        console.log(`📅 Calendar Link - Conversion: ${appointment.time} (${appointment.coachTimezone}) → ${startTime} (${appointment.talentTimezone})`);
      }

      // Créer la date de début avec l'heure convertie
      const startDate = new Date(`${appointment.date}T${startTime}:00`);

      // Créer la date de fin (durée par défaut: 30 minutes)
      const duration = appointment.duration || 30;
      const endDate = new Date(startDate.getTime() + duration * 60000);

      // Formatter les dates au format Google Calendar (YYYYMMDDTHHMMSSZ) - UTC
      const startDateStr = startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      const endDateStr = endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

      // Créer le titre de l'événement
      const title = encodeURIComponent(`Session de coaching - ${appointment.talentName} & ${appointment.coachName}`);

      // Créer la description
      let description = `Session de coaching entre ${appointment.talentName} et ${appointment.coachName}`;
      if (appointment.notes) {
        description += `\n\nNotes: ${appointment.notes}`;
      }
      if (appointment.meetLink) {
        description += `\n\nLien Google Meet: ${appointment.meetLink}`;
      }
      description += '\n\nGénéré via ProdTalent';

      const encodedDescription = encodeURIComponent(description);

      // Construire l'URL Google Calendar
      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateStr}/${endDateStr}&details=${encodedDescription}&sf=true&output=xml`;

      console.log('📅 Lien Google Calendar généré:', calendarUrl);
      return calendarUrl;
    } catch (error) {
      console.error('❌ Erreur génération lien calendar:', error);
      // URL de fallback vers Google Calendar
      return 'https://calendar.google.com/calendar/';
    }
  }

  /**
   * Met à jour un rendez-vous avec un lien Google Calendar généré
   */
  static async updateAppointmentWithCalendarLink(appointmentId: string, appointmentData: any): Promise<string> {
    try {
      const { AppointmentService } = await import('./appointmentService');

      // Générer le lien calendar
      const calendarLink = this.generateCalendarLink(appointmentData);

      // Mettre à jour le rendez-vous
      await AppointmentService.updateAppointmentLinks(appointmentId, appointmentData.meetLink, calendarLink);

      console.log('✅ Lien calendar ajouté au rendez-vous:', appointmentId);
      return calendarLink;
    } catch (error) {
      console.error('❌ Erreur mise à jour calendar link:', error);
      return '';
    }
  }

  /**
   * Corrige les rendez-vous existants sans lien calendar
   */
  static async fixMissingCalendarLinks(): Promise<void> {
    try {
      // Import direct de la base de données
      const { db } = await import('../firebase');
      const { collection, getDocs, query, where } = await import('firebase/firestore');

      // Récupérer tous les rendez-vous confirmés sans lien calendar
      const appointmentsQuery = query(
        collection(db, 'Appointments'),
        where('status', '==', 'confirmé')
      );
      const appointments = await getDocs(appointmentsQuery);

      let fixedCount = 0;

      const { updateDoc, doc: docRef } = await import('firebase/firestore');

      for (const docSnapshot of appointments.docs) {
        const appointment = docSnapshot.data();

        // Vérifier si le lien calendar est manquant
        if (!appointment.calendarLink || appointment.calendarLink === '') {
          console.log(`🔧 Correction du rendez-vous ${docSnapshot.id} - lien calendar manquant`);

          // Générer et mettre à jour le lien
          const calendarLink = this.generateCalendarLink({
            date: appointment.date,
            time: appointment.time,
            duration: 30, // Durée par défaut
            talentName: appointment.talentName || 'Talent',
            coachName: appointment.coachName || 'Coach',
            notes: appointment.notes,
            meetLink: appointment.meetLink,
            coachTimezone: appointment.coachTimeZone || 'America/New_York',
            talentTimezone: appointment.talentTimeZone || 'Europe/Zurich'
          });

          // Mettre à jour le document
          const appointmentRef = docRef(db, 'Appointments', docSnapshot.id);
          await updateDoc(appointmentRef, { calendarLink });
          fixedCount++;
        }
      }

      console.log(`✅ ${fixedCount} liens calendar corrigés`);
    } catch (error) {
      console.error('❌ Erreur correction des liens calendar:', error);
    }
  }
}