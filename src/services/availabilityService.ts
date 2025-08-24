import { collection, doc, setDoc, getDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface CoachAvailability {
  id?: string;
  coachId: string;
  date: string; // Format: "2024-08-20"
  timeSlots: string[]; // Format: ["09:00", "10:00", "14:30"]
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class AvailabilityService {
  // Sauvegarder les disponibilités d'un coach pour une date
  static async saveAvailability(coachId: string, date: string, timeSlots: string[]): Promise<boolean> {
    try {
      console.log('Sauvegarde des disponibilités:', { coachId, date, timeSlots });
      
      const availabilityData: Omit<CoachAvailability, 'id'> = {
        coachId,
        date,
        timeSlots,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = doc(db, 'CoachAvailabilities', `${coachId}_${date}`);
      await setDoc(docRef, availabilityData);
      
      console.log('Disponibilités sauvegardées avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des disponibilités:', error);
      return false;
    }
  }

  // Récupérer les disponibilités d'un coach pour une date
  static async getAvailability(coachId: string, date: string): Promise<string[]> {
    try {
      const docRef = doc(db, 'CoachAvailabilities', `${coachId}_${date}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as CoachAvailability;
        return data.timeSlots || [];
      }
      
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des disponibilités:', error);
      return [];
    }
  }

  // Récupérer toutes les disponibilités d'un coach
  static async getAllCoachAvailabilities(coachId: string): Promise<CoachAvailability[]> {
    try {
      const q = query(
        collection(db, 'CoachAvailabilities'),
        where('coachId', '==', coachId)
      );
      const querySnapshot = await getDocs(q);
      const availabilities: CoachAvailability[] = [];
      
      querySnapshot.forEach((doc) => {
        availabilities.push({ id: doc.id, ...doc.data() } as CoachAvailability);
      });
      
      return availabilities;
    } catch (error) {
      console.error('Erreur lors de la récupération des disponibilités:', error);
      return [];
    }
  }

  // Récupérer toutes les disponibilités de tous les coaches
  static async getAllAvailabilities(): Promise<CoachAvailability[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'CoachAvailabilities'));
      const availabilities: CoachAvailability[] = [];
      
      querySnapshot.forEach((doc) => {
        availabilities.push({ id: doc.id, ...doc.data() } as CoachAvailability);
      });
      
      return availabilities;
    } catch (error) {
      console.error('Erreur lors de la récupération de toutes les disponibilités:', error);
      return [];
    }
  }

  // Vérifier si un créneau est disponible pour un coach (amélioré)
  static async isSlotAvailable(coachId: string, date: string, time: string): Promise<boolean> {
    try {
      // 1. Vérifier si le coach a marqué ce créneau comme disponible
      const availableSlots = await this.getAvailability(coachId, date);
      if (!availableSlots.includes(time)) {
        console.log(`Créneau ${time} non disponible - coach ne l'a pas marqué`);
        return false;
      }

      // 2. Vérifier si quelqu'un a déjà réservé ce créneau
      const { AppointmentService } = await import('./appointmentService');
      const appointmentsResult = await AppointmentService.getCoachAppointments(coachId);
      
      if (!appointmentsResult.success || !appointmentsResult.data) {
        console.error('Erreur lors de la récupération des rendez-vous');
        return true; // En cas d'erreur, on considère que le slot est disponible
      }
      
      const conflictingAppointment = appointmentsResult.data.find(appointment => 
        appointment.date === date && 
        appointment.time === time && 
        appointment.status !== 'annulé'
      );

      if (conflictingAppointment) {
        console.log(`Créneau ${time} déjà réservé par ${conflictingAppointment.talentName}`);
        return false;
      }

      console.log(`Créneau ${time} disponible`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
      return false;
    }
  }

  // Méthode pour récupérer les créneaux réellement disponibles (avec vérification des réservations)
  static async getAvailableSlots(coachId: string, date: string): Promise<string[]> {
    try {
      // 1. Récupérer les créneaux marqués comme disponibles par le coach
      const coachAvailableSlots = await this.getAvailability(coachId, date);
      
      if (coachAvailableSlots.length === 0) {
        return [];
      }

      // 2. Récupérer les rendez-vous existants pour cette date
      const { AppointmentService } = await import('./appointmentService');
      const appointmentsResult = await AppointmentService.getCoachAppointments(coachId);
      
      let bookedSlots: string[] = [];
      if (appointmentsResult.success && appointmentsResult.data) {
        bookedSlots = appointmentsResult.data
          .filter(appointment => 
            appointment.date === date && 
            appointment.status !== 'annulé'
          )
          .map(appointment => appointment.time);
      }

      // 3. Filtrer les créneaux disponibles
      const availableSlots = coachAvailableSlots.filter(slot => !bookedSlots.includes(slot));
      
      console.log(`Créneaux disponibles pour ${date}:`, availableSlots);
      return availableSlots;
    } catch (error) {
      console.error('Erreur lors de la récupération des créneaux disponibles:', error);
      return [];
    }
  }
}
