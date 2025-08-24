import { collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Appointment, ApiResponse } from '../types';
import { COLLECTION_NAMES, APPOINTMENT_STATUS, TIME_SLOTS } from '../constants';
import { handleServiceError, createApiResponse } from '../utils/errorHandler';
import emailNotificationService from './emailNotificationService';

// Export for backward compatibility
export type { Appointment } from '../types';

export class AppointmentService {
  static async createAppointment(
    appointmentData: Omit<Appointment, 'id' | 'timestamp' | 'createdAt'>
  ): Promise<ApiResponse<string>> {
    try {
      console.log('Tentative de création du rendez-vous avec les données:', appointmentData);
      
      // Vérification de conflit avant la création
      const existingResult = await this.getCoachAppointments(appointmentData.coachId);
      if (!existingResult.success || !existingResult.data) {
        return createApiResponse(false, null as any, 'Erreur lors de la vérification des conflits');
      }

      const conflictingAppointment = existingResult.data.find(appointment => 
        appointment.date === appointmentData.date && 
        appointment.time === appointmentData.time && 
        appointment.status !== 'annulé'
      );

      if (conflictingAppointment) {
        return createApiResponse(false, null as any, `Ce créneau est déjà réservé par ${conflictingAppointment.talentName}`);
      }

      const cleanAppointmentData = {
        ...appointmentData,
        createdAt: Timestamp.now(),
        timestamp: Timestamp.now(),
        notes: appointmentData.notes?.trim() || null
      };
      
      console.log('Données nettoyées à sauvegarder:', cleanAppointmentData);
      
      const docRef = await addDoc(collection(db, 'Appointments'), cleanAppointmentData);
      
      console.log('Rendez-vous créé avec succès, ID:', docRef.id);

      // Notification email au talent
      try {
        await emailNotificationService.sendCoachingReservation({
          talentEmail: appointmentData.talentEmail,
          talentName: appointmentData.talentName,
          coachName: appointmentData.coachName,
          date: appointmentData.date,
          time: appointmentData.time
        });
        console.log('✅ Email de réservation envoyé au talent');
      } catch (emailError) {
        console.error('❌ Erreur envoi email réservation:', emailError);
      }
      
      // Notification pour le coach (sera gérée par le système de notifications de l'interface)
      console.log('🔔 Nouveau rendez-vous créé pour le coach:', appointmentData.coachId);

      return createApiResponse(true, docRef.id);
    } catch (error) {
      return handleServiceError(error, 'création du rendez-vous');
    }
  }

  static async getCoachAppointments(coachId: string): Promise<ApiResponse<Appointment[]>> {
    try {
      const q = query(
        collection(db, 'Appointments'),
        where('coachId', '==', coachId)
      );
      const querySnapshot = await getDocs(q);
      const appointments: Appointment[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        appointments.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : data.timestamp,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
        } as Appointment);
      });
      
      const sortedAppointments = appointments.sort((a, b) => 
        a.date.localeCompare(b.date)
      );
      
      return createApiResponse(true, sortedAppointments);
    } catch (error) {
      return handleServiceError(error, 'récupération des rendez-vous coach');
    }
  }

  static async getTalentAppointments(talentId: string): Promise<ApiResponse<Appointment[]>> {
    try {
      const q = query(
        collection(db, 'Appointments'),
        where('talentId', '==', talentId)
      );
      const querySnapshot = await getDocs(q);
      const appointments: Appointment[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        appointments.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : data.timestamp,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
        } as Appointment);
      });
      
      const sortedAppointments = appointments.sort((a, b) => 
        a.date.localeCompare(b.date)
      );
      
      return createApiResponse(true, sortedAppointments);
    } catch (error) {
      return handleServiceError(error, 'récupération des rendez-vous talent');
    }
  }

  // Mettre à jour le statut d'un rendez-vous
  static async updateAppointmentStatus(appointmentId: string, status: Appointment['status']): Promise<void> {
    try {
      const appointmentRef = doc(db, 'Appointments', appointmentId);
      
      // Récupérer les données du rendez-vous avant mise à jour
      const appointmentDoc = await getDoc(appointmentRef);
      const appointmentData = appointmentDoc.data() as Appointment;
      
      await updateDoc(appointmentRef, { status });
      console.log('Statut du rendez-vous mis à jour');

      // Notification email au talent
      try {
        const emailStatus = status === 'confirmé' ? 'confirmed' : 
                           status === 'annulé' ? 'cancelled' : 'rescheduled';
        
        await emailNotificationService.sendAppointmentUpdate({
          talentEmail: appointmentData.talentEmail,
          talentName: appointmentData.talentName,
          coachName: appointmentData.coachName,
          date: appointmentData.date,
          time: appointmentData.time,
          status: emailStatus
        });
        console.log('✅ Email de mise à jour envoyé au talent');
      } catch (emailError) {
        console.error('❌ Erreur envoi email mise à jour:', emailError);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw new Error('Impossible de mettre à jour le statut');
    }
  }

  // Annuler un rendez-vous
  static async cancelAppointment(appointmentId: string): Promise<void> {
    try {
      const appointmentRef = doc(db, 'Appointments', appointmentId);
      await updateDoc(appointmentRef, { status: 'annulé' });
      console.log('Rendez-vous annulé');
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      throw new Error('Impossible d\'annuler le rendez-vous');
    }
  }

  // Supprimer un rendez-vous
  static async deleteAppointment(appointmentId: string): Promise<void> {
    try {
      const appointmentRef = doc(db, 'Appointments', appointmentId);
      await deleteDoc(appointmentRef);
      console.log('Rendez-vous supprimé');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw new Error('Impossible de supprimer le rendez-vous');
    }
  }

  // Vérifier si un créneau est disponible
  static async isSlotAvailable(coachId: string, date: string, time: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'Appointments'),
        where('coachId', '==', coachId),
        where('date', '==', date),
        where('time', '==', time),
        where('status', 'in', ['confirmé', 'en_attente'])
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.empty;
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
      return false;
    }
  }

  // Obtenir les créneaux disponibles pour un coach
  static async getAvailableSlots(coachId: string, date: string): Promise<string[]> {
    try {
      // Créneaux de base (9h-18h, toutes les 30 minutes)
      const baseSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
      ];

      // Récupérer les créneaux réservés
      const q = query(
        collection(db, 'Appointments'),
        where('coachId', '==', coachId),
        where('date', '==', date),
        where('status', 'in', ['confirmé', 'en_attente'])
      );
      const querySnapshot = await getDocs(q);
      const bookedSlots = querySnapshot.docs.map(doc => doc.data().time);

      // Retourner les créneaux disponibles
      return baseSlots.filter(slot => !bookedSlots.includes(slot));
    } catch (error) {
      console.error('Erreur lors de la récupération des créneaux disponibles:', error);
      return [];
    }
  }
}
