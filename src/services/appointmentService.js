import { collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { handleServiceError, createApiResponse } from '../utils/errorHandler';
import emailNotificationService from './emailNotificationService';
export class AppointmentService {
    static async createAppointment(appointmentData) {
        try {
            console.log('Tentative de création du rendez-vous avec les données:', appointmentData);
            // Vérification de conflit avant la création
            const existingResult = await this.getCoachAppointments(appointmentData.coachId);
            if (!existingResult.success || !existingResult.data) {
                return createApiResponse(false, null, 'Erreur lors de la vérification des conflits');
            }
            const conflictingAppointment = existingResult.data.find(appointment => appointment.date === appointmentData.date &&
                appointment.time === appointmentData.time &&
                appointment.status !== 'annulé');
            if (conflictingAppointment) {
                return createApiResponse(false, null, `Ce créneau est déjà réservé par ${conflictingAppointment.talentName}`);
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
            }
            catch (emailError) {
                console.error('❌ Erreur envoi email réservation:', emailError);
            }
            // Notification pour le coach (sera gérée par le système de notifications de l'interface)
            console.log('🔔 Nouveau rendez-vous créé pour le coach:', appointmentData.coachId);
            return createApiResponse(true, docRef.id);
        }
        catch (error) {
            return handleServiceError(error, 'création du rendez-vous');
        }
    }
    static async getCoachAppointments(coachId) {
        try {
            const q = query(collection(db, 'Appointments'), where('coachId', '==', coachId));
            const querySnapshot = await getDocs(q);
            const appointments = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                appointments.push({
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : data.timestamp,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
                });
            });
            const sortedAppointments = appointments.sort((a, b) => a.date.localeCompare(b.date));
            return createApiResponse(true, sortedAppointments);
        }
        catch (error) {
            return handleServiceError(error, 'récupération des rendez-vous coach');
        }
    }
    static async getTalentAppointments(talentId) {
        try {
            const q = query(collection(db, 'Appointments'), where('talentId', '==', talentId));
            const querySnapshot = await getDocs(q);
            const appointments = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                appointments.push({
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : data.timestamp,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
                });
            });
            const sortedAppointments = appointments.sort((a, b) => a.date.localeCompare(b.date));
            return createApiResponse(true, sortedAppointments);
        }
        catch (error) {
            return handleServiceError(error, 'récupération des rendez-vous talent');
        }
    }
    // Mettre à jour le statut d'un rendez-vous
    static async updateAppointmentStatus(appointmentId, status) {
        try {
            const appointmentRef = doc(db, 'Appointments', appointmentId);
            // Récupérer les données du rendez-vous avant mise à jour
            const appointmentDoc = await getDoc(appointmentRef);
            const appointmentData = appointmentDoc.data();
            await updateDoc(appointmentRef, { status });
            console.log('Statut du rendez-vous mis à jour');
            // Si le statut passe à 'confirmé', essayer de synchroniser avec Google Calendar automatiquement
            if (status === 'confirmé' && !appointmentData.googleEventId) {
                try {
                    console.log('🔄 Tentative de synchronisation automatique avec Google Calendar...');
                    await this.tryAutoSyncWithGoogleCalendar(appointmentId, appointmentData);
                }
                catch (syncError) {
                    console.warn('⚠️ Synchronisation automatique échouée:', syncError);
                }
            }
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
            }
            catch (emailError) {
                console.error('❌ Erreur envoi email mise à jour:', emailError);
            }
        }
        catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            throw new Error('Impossible de mettre à jour le statut');
        }
    }
    // Essayer de synchroniser automatiquement avec Google Calendar
    static async tryAutoSyncWithGoogleCalendar(appointmentId, appointmentData) {
        try {
            // Importer le service Google Calendar de manière dynamique pour éviter les dépendances circulaires
            const { googleCalendarGISService } = await import('./googleCalendarGISService');
            // Vérifier si le service est authentifié pour ce coach
            if (googleCalendarGISService.isUserAuthenticated()) {
                // Synchroniser le rendez-vous
                const result = await googleCalendarGISService.syncAppointmentToCalendar(appointmentData);
                if (result.success && result.googleEventId) {
                    // Mettre à jour l'appointment avec l'ID Google Calendar
                    await this.updateAppointmentGoogleEventId(appointmentId, result.googleEventId);
                    console.log('✅ Synchronisation automatique réussie avec Google Calendar:', result.googleEventId);
                }
                else {
                    console.warn('⚠️ Synchronisation automatique échouée:', result.error);
                }
            }
            else {
                console.log('ℹ️ Coach non connecté à Google Calendar - synchronisation manuelle nécessaire');
            }
        }
        catch (error) {
            console.error('❌ Erreur lors de la synchronisation automatique:', error);
            throw error;
        }
    }
    // Annuler un rendez-vous
    static async cancelAppointment(appointmentId) {
        try {
            const appointmentRef = doc(db, 'Appointments', appointmentId);
            await updateDoc(appointmentRef, { status: 'annulé' });
            console.log('Rendez-vous annulé');
        }
        catch (error) {
            console.error('Erreur lors de l\'annulation:', error);
            throw new Error('Impossible d\'annuler le rendez-vous');
        }
    }
    // Supprimer un rendez-vous
    static async deleteAppointment(appointmentId) {
        try {
            const appointmentRef = doc(db, 'Appointments', appointmentId);
            await deleteDoc(appointmentRef);
            console.log('Rendez-vous supprimé');
        }
        catch (error) {
            console.error('Erreur lors de la suppression:', error);
            throw new Error('Impossible de supprimer le rendez-vous');
        }
    }
    // Vérifier si un créneau est disponible
    static async isSlotAvailable(coachId, date, time) {
        try {
            const q = query(collection(db, 'Appointments'), where('coachId', '==', coachId), where('date', '==', date), where('time', '==', time), where('status', 'in', ['confirmé', 'en_attente']));
            const querySnapshot = await getDocs(q);
            return querySnapshot.empty;
        }
        catch (error) {
            console.error('Erreur lors de la vérification de disponibilité:', error);
            return false;
        }
    }
    // Mettre à jour l'ID Google Calendar d'un rendez-vous
    static async updateAppointmentGoogleEventId(appointmentId, googleEventId) {
        try {
            const appointmentRef = doc(db, 'Appointments', appointmentId);
            await updateDoc(appointmentRef, { googleEventId });
            console.log('✅ Google Event ID mis à jour pour le rendez-vous:', appointmentId);
        }
        catch (error) {
            console.error('❌ Erreur lors de la mise à jour du Google Event ID:', error);
            throw new Error('Impossible de mettre à jour le Google Event ID');
        }
    }
    // Obtenir les créneaux disponibles pour un coach
    static async getAvailableSlots(coachId, date) {
        try {
            // Créneaux de base (9h-18h, toutes les 30 minutes)
            const baseSlots = [
                '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
                '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
            ];
            // Récupérer les créneaux réservés
            const q = query(collection(db, 'Appointments'), where('coachId', '==', coachId), where('date', '==', date), where('status', 'in', ['confirmé', 'en_attente']));
            const querySnapshot = await getDocs(q);
            const bookedSlots = querySnapshot.docs.map(doc => doc.data().time);
            // Retourner les créneaux disponibles
            return baseSlots.filter(slot => !bookedSlots.includes(slot));
        }
        catch (error) {
            console.error('Erreur lors de la récupération des créneaux disponibles:', error);
            return [];
        }
    }
}
