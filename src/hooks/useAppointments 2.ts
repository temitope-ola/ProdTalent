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
