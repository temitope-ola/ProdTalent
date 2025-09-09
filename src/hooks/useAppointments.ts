import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Appointment, ApiResponse } from '../types';
import { AppointmentService } from '../services/appointmentService';

export const useAppointments = (userId?: string, userRole?: 'coach' | 'talent') => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = async () => {
    if (!userId || !userRole) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let result: ApiResponse<Appointment[]>;
      
      if (userRole === 'coach') {
        result = await AppointmentService.getCoachAppointments(userId);
      } else {
        result = await AppointmentService.getTalentAppointments(userId);
      }
      
      if (result.success && result.data) {
        setAppointments(result.data);
      } else {
        setError(result.error || 'Erreur lors du chargement des rendez-vous');
      }
    } catch (err) {
      setError('Erreur lors du chargement des rendez-vous');
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'timestamp'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await AppointmentService.createAppointment(appointmentData);
      
      if (result.success) {
        // Envoyer notification SendGrid de nouveau rendez-vous
        try {
          const { FirestoreService } = await import('../services/firestoreService');
          const { default: sendGridTemplateService } = await import('../services/sendGridTemplateService');
          
          // Récupérer les profils du talent et du coach
          const talentProfile = await FirestoreService.getCurrentProfile(appointmentData.talentId, 'talent');
          const coachProfile = await FirestoreService.getCurrentProfile(appointmentData.coachId, 'coach');
          
          if (talentProfile && talentProfile.email && coachProfile) {
            // Notification au talent
            await sendGridTemplateService.sendNewAppointment({
              recipientEmail: talentProfile.email,
              recipientName: talentProfile.displayName || talentProfile.firstName || 'Talent',
              coachName: coachProfile.displayName || coachProfile.firstName || 'Coach',
              appointmentDate: new Date(appointmentData.date).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }),
              appointmentTime: appointmentData.time,
              meetingType: appointmentData.type || 'Session de coaching',
              meetLink: appointmentData.meetLink,
              calendarLink: appointmentData.calendarLink
            });
            console.log('📧 Notification de nouveau rendez-vous SendGrid envoyée au talent');
            
            // Notification au coach
            if (coachProfile.email) {
              await sendGridTemplateService.sendNewAppointment({
                recipientEmail: coachProfile.email,
                recipientName: talentProfile.displayName || talentProfile.firstName || 'Talent', // Le talent qui a réservé
                coachName: coachProfile.displayName || coachProfile.firstName || 'Coach',
                appointmentDate: new Date(appointmentData.date).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }),
                appointmentTime: appointmentData.time,
                meetingType: `Nouveau rendez-vous avec ${talentProfile.displayName || talentProfile.firstName || 'Talent'}`,
                meetLink: appointmentData.meetLink,
                calendarLink: appointmentData.calendarLink
              });
              console.log('📧 Notification de nouveau rendez-vous SendGrid envoyée au coach');
            }
          }
        } catch (emailError) {
          console.error('❌ Erreur envoi notification nouveau rendez-vous:', emailError);
          // Ne pas faire échouer la création si l'email échoue
        }
        
        await loadAppointments(); // Reload appointments after creation
        return result.data;
      } else {
        setError(result.error || 'Erreur lors de la création du rendez-vous');
        return null;
      }
    } catch (err) {
      setError('Erreur lors de la création du rendez-vous');
      console.error('Error creating appointment:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Update the appointment status in Firestore
      const appointmentRef = doc(db, 'Appointments', appointmentId);
      await updateDoc(appointmentRef, { status });
      
      // Envoyer notification de confirmation si le statut passe à confirmé
      if (status === 'confirmé') {
        try {
          const { FirestoreService } = await import('../services/firestoreService');
          const { default: sendGridTemplateService } = await import('../services/sendGridTemplateService');
          
          // Récupérer les détails du rendez-vous
          const appointment = appointments.find(apt => apt.id === appointmentId);
          if (appointment) {
            // Récupérer les profils du talent et du coach
            const talentProfile = await FirestoreService.getCurrentProfile(appointment.talentId, 'talent');
            const coachProfile = await FirestoreService.getCurrentProfile(appointment.coachId, 'coach');
            
            if (talentProfile && talentProfile.email && coachProfile) {
              // Notification de confirmation au talent
              await sendGridTemplateService.sendAppointmentConfirmation({
                recipientEmail: talentProfile.email,
                recipientName: talentProfile.displayName || talentProfile.firstName || 'Talent',
                coachName: coachProfile.displayName || coachProfile.firstName || 'Coach',
                appointmentDate: new Date(appointment.date).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }),
                appointmentTime: appointment.time,
                meetingType: appointment.type || 'Session de coaching',
                meetLink: appointment.meetLink,
                calendarLink: appointment.calendarLink
              });
              console.log('📧 Notification de confirmation de rendez-vous SendGrid envoyée au talent');
              
              // Notification de confirmation au coach
              if (coachProfile.email) {
                await sendGridTemplateService.sendAppointmentConfirmation({
                  recipientEmail: coachProfile.email,
                  recipientName: talentProfile.displayName || talentProfile.firstName || 'Talent',
                  coachName: coachProfile.displayName || coachProfile.firstName || 'Coach',
                  appointmentDate: new Date(appointment.date).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }),
                  appointmentTime: appointment.time,
                  meetingType: `Rendez-vous confirmé avec ${talentProfile.displayName || talentProfile.firstName || 'Talent'}`,
                  meetLink: appointment.meetLink,
                  calendarLink: appointment.calendarLink
                });
                console.log('📧 Notification de confirmation de rendez-vous SendGrid envoyée au coach');
              }
            }
          }
        } catch (emailError) {
          console.error('❌ Erreur envoi notification confirmation rendez-vous:', emailError);
          // Ne pas faire échouer la mise à jour si l'email échoue
        }
      }
      
      // Update local state
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId ? { ...apt, status: status as any } : apt
      ));
      
      return true;
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut');
      console.error('Error updating appointment status:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    return updateAppointmentStatus(appointmentId, 'annulé');
  };

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.date) >= new Date() && apt.status === 'confirmé'
  );

  const pastAppointments = appointments.filter(apt => 
    new Date(apt.date) < new Date()
  );

  useEffect(() => {
    loadAppointments();
  }, [userId, userRole]);

  return {
    appointments,
    upcomingAppointments,
    pastAppointments,
    loading,
    error,
    loadAppointments,
    createAppointment,
    updateAppointmentStatus,
    cancelAppointment,
    setAppointments
  };
};
