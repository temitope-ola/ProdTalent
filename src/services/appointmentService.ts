import { collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Appointment, ApiResponse } from '../types';
import { COLLECTION_NAMES, APPOINTMENT_STATUS, TIME_SLOTS } from '../constants';
import { handleServiceError, createApiResponse } from '../utils/errorHandler';
import sendGridTemplateService from './sendGridTemplateService';
import { googleIntegratedService } from './googleIntegratedService';
import { BackendEmailService } from './backendEmailService';

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

      // Notification EMAIL au talent (Gmail API avec fallback SendGrid)
      try {
        const gmailSent = await this.sendEmailWithGmail('new', {
          recipientEmail: appointmentData.talentEmail,
          recipientName: appointmentData.talentName,
          coachName: appointmentData.coachName,
          appointmentDate: appointmentData.date,
          appointmentTime: appointmentData.time,
          meetingType: 'Session de coaching'
        });

        if (!gmailSent) {
          await sendGridTemplateService.sendNewAppointment({
            recipientEmail: appointmentData.talentEmail,
            recipientName: appointmentData.talentName,
            coachName: appointmentData.coachName,
            appointmentDate: appointmentData.date,
            appointmentTime: appointmentData.time,
            meetingType: 'Session de coaching'
          });
        }
        console.log('✅ Email de réservation envoyé au talent (Gmail API ou SendGrid)');
      } catch (emailError) {
        console.error('❌ Erreur envoi email réservation:', emailError);
        // Ne pas faire échouer la création si l'email échoue
      }
      
      // Notification SendGrid template au coach pour nouveau rendez-vous
      try {
        // Récupérer l'email du coach depuis son profil
        const { FirestoreService } = await import('./firestoreService');
        const coachProfile = await FirestoreService.getCurrentProfile(appointmentData.coachId, 'coach');
        
        if (coachProfile && coachProfile.email) {
          // Utiliser Gmail API pour le coach
          const gmailSentToCoach = await this.sendEmailWithGmail('new', {
            recipientEmail: coachProfile.email,
            recipientName: appointmentData.coachName,
            coachName: appointmentData.coachName,
            appointmentDate: appointmentData.date,
            appointmentTime: appointmentData.time,
            meetingType: `Nouveau rendez-vous avec ${appointmentData.talentName}`
          });

          if (!gmailSentToCoach) {
            // Fallback SendGrid si Gmail échoue
            await sendGridTemplateService.sendNewAppointment({
              recipientEmail: coachProfile.email,
              recipientName: appointmentData.talentName,
              coachName: appointmentData.coachName,
              appointmentDate: appointmentData.date,
              appointmentTime: appointmentData.time,
              meetingType: `Nouveau rendez-vous avec ${appointmentData.talentName}`
            });
          }
          console.log('✅ Email de nouveau rendez-vous envoyé au coach (Gmail API ou SendGrid fallback)');
        } else {
          console.warn('⚠️ Impossible de récupérer l\'email du coach');
        }
      } catch (emailError) {
        console.error('❌ Erreur envoi email nouveau rendez-vous coach SendGrid:', emailError);
        // Ne pas faire échouer la création si l'email échoue
      }

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

      // Si le statut passe à 'confirmé', générer automatiquement un lien Meet et synchroniser
      if (status === 'confirmé') {
        try {
          console.log('🔄 Génération automatique du lien Meet et synchronisation...');
          await this.createMeetAndSync(appointmentId, appointmentData);
        } catch (syncError) {
          console.warn('⚠️ Création Meet et sync échouée:', syncError);
        }
      }

      // Récupérer les données mises à jour (avec les liens Meet/Calendar)
      const updatedAppointmentDoc = await getDoc(appointmentRef);
      const updatedAppointmentData = updatedAppointmentDoc.data() as Appointment;

      // Notification EMAIL au talent (Gmail API avec fallback SendGrid)  
      try {
        if (status === 'confirmé') {
          const gmailSent = await this.sendEmailWithGmail('confirmation', {
            recipientEmail: updatedAppointmentData.talentEmail,
            recipientName: updatedAppointmentData.talentName,
            coachName: updatedAppointmentData.coachName,
            appointmentDate: updatedAppointmentData.date,
            appointmentTime: updatedAppointmentData.time,
            appointmentType: 'Session de coaching',
            meetLink: updatedAppointmentData.meetLink || '',
            calendarLink: updatedAppointmentData.calendarLink || ''
          });

          if (!gmailSent) {
            await sendGridTemplateService.sendAppointmentConfirmation({
              recipientEmail: updatedAppointmentData.talentEmail,
              recipientName: updatedAppointmentData.talentName,
              coachName: updatedAppointmentData.coachName,
              appointmentDate: updatedAppointmentData.date,
              appointmentTime: updatedAppointmentData.time,
              meetingType: 'Session de coaching',
              meetLink: updatedAppointmentData.meetLink || '',
              calendarLink: updatedAppointmentData.calendarLink || ''
            });
          }
        } else {
          const gmailSent = await this.sendEmailWithGmail('new', {
            recipientEmail: appointmentData.talentEmail,
            recipientName: appointmentData.talentName,
            coachName: appointmentData.coachName,
            appointmentDate: appointmentData.date,
            appointmentTime: appointmentData.time,
            meetingType: `Session ${status}`,
            meetLink: appointmentData.meetLink || '',
            calendarLink: appointmentData.calendarLink || ''
          });

          if (!gmailSent) {
            await sendGridTemplateService.sendNewAppointment({
              recipientEmail: appointmentData.talentEmail,
              recipientName: appointmentData.talentName,
              coachName: appointmentData.coachName,
              appointmentDate: appointmentData.date,
              appointmentTime: appointmentData.time,
              meetingType: `Session ${status}`
            });
          }
        }
        
        console.log('✅ Email de mise à jour envoyé au talent (Gmail API ou SendGrid)');
      } catch (emailError) {
        console.error('❌ Erreur envoi email mise à jour SendGrid:', emailError);
        // Ne pas faire échouer la mise à jour si l'email échoue
      }

      // Notification SendGrid template au coach pour mise à jour
      try {
        // Récupérer l'email du coach depuis son profil
        const { FirestoreService } = await import('./firestoreService');
        const coachProfile = await FirestoreService.getCurrentProfile(appointmentData.coachId, 'coach');
        
        if (coachProfile && coachProfile.email) {
          if (status === 'confirmé') {
            // Utiliser Gmail API pour le coach aussi
            const gmailSentToCoach = await this.sendEmailWithGmail('confirmation', {
              recipientEmail: coachProfile.email,
              recipientName: updatedAppointmentData.coachName,
              coachName: updatedAppointmentData.coachName,
              appointmentDate: updatedAppointmentData.date,
              appointmentTime: updatedAppointmentData.time,
              appointmentType: `Rendez-vous confirmé avec ${updatedAppointmentData.talentName}`,
              meetLink: updatedAppointmentData.meetLink || '',
              calendarLink: updatedAppointmentData.calendarLink || ''
            });

            if (!gmailSentToCoach) {
              // Fallback SendGrid si Gmail échoue
              await sendGridTemplateService.sendAppointmentConfirmation({
                recipientEmail: coachProfile.email,
                recipientName: updatedAppointmentData.talentName,
                coachName: updatedAppointmentData.coachName,
                appointmentDate: updatedAppointmentData.date,
                appointmentTime: updatedAppointmentData.time,
                meetingType: `Rendez-vous confirmé avec ${updatedAppointmentData.talentName}`,
                meetLink: updatedAppointmentData.meetLink || '',
                calendarLink: updatedAppointmentData.calendarLink || ''
              });
            }
          } else {
            // Pour annulé ou reprogrammé - utiliser Gmail API
            const gmailSentToCoach = await this.sendEmailWithGmail('new', {
              recipientEmail: coachProfile.email,
              recipientName: appointmentData.coachName,
              coachName: appointmentData.coachName,
              appointmentDate: appointmentData.date,
              appointmentTime: appointmentData.time,
              meetingType: `Rendez-vous ${status} avec ${appointmentData.talentName}`
            });

            if (!gmailSentToCoach) {
              // Fallback SendGrid
              await sendGridTemplateService.sendNewAppointment({
                recipientEmail: coachProfile.email,
                recipientName: appointmentData.coachName,
                coachName: appointmentData.coachName,
                appointmentDate: appointmentData.date,
                appointmentTime: appointmentData.time,
                meetingType: `Rendez-vous ${status} avec ${appointmentData.talentName}`
              });
            }
          }
          console.log('✅ Email de mise à jour envoyé au coach (Gmail API ou SendGrid fallback)');
        } else {
          console.warn('⚠️ Impossible de récupérer l\'email du coach pour mise à jour');
        }
      } catch (emailError) {
        console.error('❌ Erreur envoi email mise à jour coach SendGrid:', emailError);
        // Ne pas faire échouer la mise à jour si l'email échoue
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw new Error('Impossible de mettre à jour le statut');
    }
  }

  // Créer un lien Meet et synchroniser avec Google Calendar - SOLUTION SIMPLE QUI FONCTIONNE
  private static async createMeetAndSync(appointmentId: string, appointmentData: Appointment): Promise<void> {
    try {
      // Vérifier si déjà synchronisé pour éviter les doublons
      if (appointmentData.googleEventId) {
        console.log('✅ Rendez-vous déjà synchronisé avec Google Calendar:', appointmentData.googleEventId);
        return;
      }

      // 1. Générer un lien Meet fonctionnel
      const meetCode = `${Date.now().toString(36).substr(-3)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 3)}`;
      const meetLink = `https://meet.google.com/${meetCode}`;
      
      console.log('🔗 Lien Meet généré:', meetLink);
      
      // 2. Sauvegarder le lien Meet (Google Calendar désactivé pour éviter l'authentification client-side)
      console.log('📅 Google Calendar désactivé - utilisation du lien Meet uniquement');
      await this.updateAppointmentLinks(appointmentId, meetLink, '');
      
      console.log('✅ Lien Meet créé et sauvegardé avec succès:', { meetLink, appointmentId });
      
    } catch (error) {
      console.error('❌ Erreur lors de la création Meet et sync:', error);
      throw error;
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

  // Mettre à jour l'ID Google Calendar d'un rendez-vous
  static async updateAppointmentGoogleEventId(appointmentId: string, googleEventId: string): Promise<void> {
    try {
      const appointmentRef = doc(db, 'Appointments', appointmentId);
      await updateDoc(appointmentRef, { googleEventId });
      console.log('✅ Google Event ID mis à jour pour le rendez-vous:', appointmentId);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du Google Event ID:', error);
      throw new Error('Impossible de mettre à jour le Google Event ID');
    }
  }

  // Mettre à jour les liens Meet et Calendar d'un rendez-vous
  static async updateAppointmentLinks(appointmentId: string, meetLink?: string, calendarLink?: string): Promise<void> {
    try {
      const appointmentRef = doc(db, 'Appointments', appointmentId);
      const updateData: any = {};
      
      if (meetLink) updateData.meetLink = meetLink;
      if (calendarLink) updateData.calendarLink = calendarLink;
      
      await updateDoc(appointmentRef, updateData);
      console.log('✅ Liens Meet/Calendar mis à jour pour le rendez-vous:', appointmentId);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des liens Meet/Calendar:', error);
      throw new Error('Impossible de mettre à jour les liens Meet/Calendar');
    }
  }

  // Fonction helper pour envoyer emails via Firebase Functions backend avec fallback SendGrid
  private static async sendEmailWithGmail(type: 'confirmation' | 'new', data: {
    recipientEmail: string;
    recipientName: string;
    coachName: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentType?: string;
    meetingType?: string;
    meetLink?: string;
    calendarLink?: string;
  }): Promise<boolean> {
    try {
      console.log('📧 Envoi via Firebase Functions backend...');
      
      if (type === 'confirmation') {
        return await BackendEmailService.sendAppointmentConfirmation({
          recipientEmail: data.recipientEmail,
          recipientName: data.recipientName,
          coachName: data.coachName,
          appointmentDate: data.appointmentDate,
          appointmentTime: data.appointmentTime,
          appointmentType: data.appointmentType || 'Session de coaching',
          meetLink: data.meetLink,
          calendarLink: data.calendarLink
        });
      } else {
        return await BackendEmailService.sendNewAppointment({
          recipientEmail: data.recipientEmail,
          recipientName: data.recipientName,
          coachName: data.coachName,
          appointmentDate: data.appointmentDate,
          appointmentTime: data.appointmentTime,
          meetingType: data.meetingType || 'Session de coaching',
          meetLink: data.meetLink,
          calendarLink: data.calendarLink
        });
      }
    } catch (error) {
      console.warn('⚠️ Firebase Functions backend échoué, utilisation SendGrid fallback:', error);
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
