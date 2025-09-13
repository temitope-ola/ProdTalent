import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { CalendarEvent } from '../services/googleCalendarGISService';
import { AppointmentService } from '../services/appointmentService';
import { AvailabilityService } from '../services/availabilityService';
import { Appointment } from '../types';
import CalendarGrid from './CalendarGrid';
import useAuth from '../contexts/AuthContext';

interface GoogleCalendarManagerProps {
  isOpen: boolean;
  onClose: () => void;
  coachId: string;
}

interface AvailabilitySlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface Booking {
  id: string;
  talentId: string;
  talentName: string;
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
}

const GoogleCalendarManager: React.FC<GoogleCalendarManagerProps> = ({
  isOpen,
  onClose,
  coachId
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'availability' | 'bookings' | 'calendar' | 'talents'>('talents');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  
  // Disponibilités du coach
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([
    { id: '1', day: 'monday', startTime: '09:00', endTime: '12:00', isAvailable: true },
    { id: '2', day: 'monday', startTime: '14:00', endTime: '18:00', isAvailable: true },
    { id: '3', day: 'tuesday', startTime: '09:00', endTime: '12:00', isAvailable: true },
    { id: '4', day: 'wednesday', startTime: '14:00', endTime: '18:00', isAvailable: true },
    { id: '5', day: 'thursday', startTime: '09:00', endTime: '12:00', isAvailable: true },
    { id: '6', day: 'friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  ]);

  // Réservations - Données mises à jour avec dates actuelles
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      talentId: 'talent1',
      talentName: 'Marie Dupont',
      slotId: '1',
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '10:00',
      status: 'confirmed',
      notes: 'Séance de coaching - Développement personnel'
    },
    {
      id: '2',
      talentId: 'talent2',
      talentName: 'Jean Martin',
      slotId: '3',
      date: '2025-01-16',
      startTime: '09:00',
      endTime: '11:00',
      status: 'pending',
      notes: 'Consultation carrière - Transition professionnelle'
    }
  ]);

  const [newSlot, setNewSlot] = useState({
    day: 'monday',
    startTime: '09:00',
    endTime: '10:00'
  });

  const daysOfWeek = [
    { value: 'monday', label: 'Lundi' },
    { value: 'tuesday', label: 'Mardi' },
    { value: 'wednesday', label: 'Mercredi' },
    { value: 'thursday', label: 'Jeudi' },
    { value: 'friday', label: 'Vendredi' },
    { value: 'saturday', label: 'Samedi' },
    { value: 'sunday', label: 'Dimanche' }
  ];

  // Générer les prochaines dates disponibles (4 semaines) - Optimisé avec useMemo
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 28; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  }, []);

  // Obtenir le jour de la semaine pour une date - Optimisé avec useCallback
  const getCalendarDayOfWeek = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Date invalide:', dateString);
        return 'monday'; // fallback
      }
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      return days[date.getDay()];
    } catch (error) {
      console.error('Erreur lors de la conversion de date:', error);
      return 'monday'; // fallback
    }
  }, []);

  // Obtenir les créneaux disponibles pour une date spécifique - Optimisé avec useCallback
  const getAvailableSlotsForDate = useCallback((date: string): AvailabilitySlot[] => {
    try {
      const dayOfWeek = getCalendarDayOfWeek(date);
      return availabilitySlots.filter(slot => 
        slot.day === dayOfWeek && slot.isAvailable
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des créneaux:', error);
      return [];
    }
  }, [availabilitySlots, getCalendarDayOfWeek]);

  // Vérifier si un créneau est déjà réservé - Optimisé avec useCallback
  const isSlotBooked = useCallback((date: string, slotId: string): boolean => {
    try {
      return bookings.some(booking => 
        booking.date === date && booking.slotId === slotId
      );
    } catch (error) {
      console.error('Erreur lors de la vérification des réservations:', error);
      return false;
    }
  }, [bookings]);

  // Authentification Google Calendar
  const handleGoogleAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { googleCalendarGISService } = await import('../services/googleCalendarGISService');
      const success = await googleCalendarGISService.authenticate();
      if (success) {
        setIsAuthenticated(true);
        await loadCalendarEvents();
      }
    } catch (error) {
      console.error('Erreur d\'authentification Google:', error);
      setError('Erreur lors de l\'authentification avec Google Calendar');
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les événements du calendrier
  const loadCalendarEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { googleCalendarGISService } = await import('../services/googleCalendarGISService');
      
      // Vérifier si l'utilisateur est encore authentifié
      if (!googleCalendarGISService.isUserAuthenticated()) {
        setIsAuthenticated(false);
        setError('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      // Charger les événements du mois affiché dans le calendrier
      const startOfMonth = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1);
      const endOfMonth = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 0);
      
      // Étendre un peu pour couvrir les jours des mois précédent/suivant affichés dans la grille
      const startDate = new Date(startOfMonth);
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date(endOfMonth);
      endDate.setDate(endDate.getDate() + 7);
      
      // Convertir en format ISO string pour l'API Google Calendar
      const events = await googleCalendarGISService.getEvents(
        startDate.toISOString(), 
        endDate.toISOString()
      );
      setCalendarEvents(events);
      
      // Si aucun événement mais pas d'erreur, c'est normal
      if (events.length === 0) {
        console.log('✅ Calendrier chargé - aucun événement dans les 4 prochaines semaines');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
      
      // Si erreur d'authentification, demander une reconnexion
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('authentif') || errorMessage.includes('Token')) {
        setIsAuthenticated(false);
        setError('Session expirée. Veuillez vous reconnecter à Google Calendar.');
      } else {
        setError('Erreur lors du chargement du calendrier. Réessayez.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentCalendarDate]);

  // Créer une session de coaching
  const createCoachingSession = useCallback(async (
    talentName: string,
    talentEmail: string,
    date: string,
    startTime: string,
    endTime: string,
    notes?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const { googleCalendarGISService } = await import('../services/googleCalendarGISService');
      const eventId = await googleCalendarGISService.createCoachingSession(
        talentName,
        talentEmail,
        date,
        startTime,
        endTime,
        notes
      );
      
      if (eventId) {
        await loadCalendarEvents(); // Recharger les événements
        return eventId;
      } else {
        setError('Impossible de créer la session de coaching');
        return null;
      }
    } catch (error) {
      console.error('Erreur lors de la création de la session:', error);
      setError('Erreur lors de la création de la session de coaching');
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadCalendarEvents]);

  // Effet pour initialiser l'API Google au montage du composant
  useEffect(() => {
    if (isOpen) {
      (async () => {
        const { googleCalendarGISService } = await import('../services/googleCalendarGISService');
        const initialized = await googleCalendarGISService.initializeGIS();
        if (initialized) {
          setIsAuthenticated(googleCalendarGISService.isUserAuthenticated());
        }
      })();
    }
  }, [isOpen]);

  // Effet pour charger les événements au montage du composant
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadCalendarEvents();
    }
  }, [isOpen, isAuthenticated, loadCalendarEvents]);

  // Charger les rendez-vous depuis Firestore
  const loadAppointments = useCallback(async () => {
    if (!user) return;
    
    try {
      const result = await AppointmentService.getCoachAppointments(user.id);
      if (result.success && result.data) {
        setAppointments(result.data);
        console.log(`✅ ${result.data.length} rendez-vous chargés depuis Firestore`);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
    }
  }, [user]);

  // Effet pour recharger les événements quand on change de mois
  useEffect(() => {
    if (isAuthenticated && activeTab === 'calendar') {
      loadCalendarEvents();
    }
  }, [currentCalendarDate, isAuthenticated, activeTab, loadCalendarEvents]);

  // Effet pour charger les rendez-vous au montage
  useEffect(() => {
    if (isOpen && user) {
      loadAppointments();
    }
  }, [isOpen, user, loadAppointments]);

  // Synchroniser un rendez-vous avec Google Calendar
  const syncAppointmentToGoogle = useCallback(async (appointment: Appointment) => {
    if (!isAuthenticated) {
      setError('Connectez-vous d\'abord à Google Calendar');
      return;
    }

    setLoading(true);
    try {
      const { googleCalendarGISService } = await import('../services/googleCalendarGISService');
      const result = await googleCalendarGISService.syncAppointmentToCalendar(appointment);
      
      if (result.success && result.googleEventId && appointment.id) {
        // Mettre à jour l'appointment avec l'ID Google Calendar dans Firestore
        await AppointmentService.updateAppointmentGoogleEventId(appointment.id, result.googleEventId);
        console.log(`✅ Rendez-vous synchronisé: ${result.googleEventId}`);
        
        // Recharger les appointments et le calendrier
        await Promise.all([
          loadAppointments(),
          loadCalendarEvents()
        ]);
      } else {
        setError(result.error || 'Erreur lors de la synchronisation');
      }
    } catch (error) {
      console.error('Erreur sync:', error);
      setError('Erreur lors de la synchronisation avec Google Calendar');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, loadCalendarEvents]);

  // Synchroniser tous les rendez-vous confirmés
  const syncAllAppointments = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setError('Connectez-vous d\'abord à Google Calendar');
      return;
    }

    setLoading(true);
    try {
      const { googleCalendarGISService } = await import('../services/googleCalendarGISService');
      const result = await googleCalendarGISService.syncAllAppointments(user.id);
      
      if (result.success) {
        console.log(`✅ ${result.syncedCount} rendez-vous synchronisés`);
        if (result.errors.length > 0) {
          console.warn('Erreurs de synchronisation:', result.errors);
        }
        await loadCalendarEvents(); // Recharger le calendrier
      } else {
        setError('Erreur lors de la synchronisation complète');
      }
    } catch (error) {
      console.error('Erreur sync complète:', error);
      setError('Erreur lors de la synchronisation avec Google Calendar');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, loadCalendarEvents]);

  // Navigation du calendrier
  const goToPreviousMonth = useCallback(() => {
    setCurrentCalendarDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentCalendarDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  }, []);

  const handleDateClick = useCallback((date: Date) => {
    console.log('Date cliquée:', date.toDateString());
    // Ici, vous pourriez ouvrir un modal pour créer un événement à cette date
  }, []);

  // Fonction locale temporaire pour synchroniser les disponibilités
  const syncAvailabilityToSystemLocal = useCallback(async (coachId: string, availabilitySlots: any[]) => {
    try {
      console.log('🔄 Synchronisation locale des disponibilités...');
      
      // Générer les dates pour les 4 prochaines semaines
      const dates = [];
      const today = new Date();
      for (let i = 1; i <= 28; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }

      let totalSlots = 0;

      // Pour chaque date, créer les créneaux disponibles
      for (const dateStr of dates) {
        const date = new Date(dateStr);
        const dayOfWeek = getSyncDayOfWeek(date);
        
        // Trouver les slots pour ce jour
        const slotsForDay = availabilitySlots.filter(slot => 
          slot.day === dayOfWeek && slot.isAvailable
        );

        if (slotsForDay.length > 0) {
          // Générer les créneaux de 30 minutes
          const timeSlots: string[] = [];
          
          for (const slot of slotsForDay) {
            const startTime = timeToMinutes(slot.startTime);
            const endTime = timeToMinutes(slot.endTime);
            
            for (let minutes = startTime; minutes < endTime; minutes += 30) {
              const timeSlot = minutesToTime(minutes);
              timeSlots.push(timeSlot);
            }
          }

          // Sauvegarder les disponibilités pour cette date
          if (timeSlots.length > 0) {
            await AvailabilityService.saveAvailability(coachId, dateStr, timeSlots);
            totalSlots += timeSlots.length;
          }
        }
      }

      console.log(`✅ Synchronisation terminée: ${totalSlots} créneaux synchronisés`);
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation locale:', error);
    }
  }, []);

  // Fonctions utilitaires pour la synchronisation
  const getSyncDayOfWeek = (date: Date): string => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Synchroniser les disponibilités avec le système
  const syncAvailabilityToSystem = useCallback(async () => {
    if (!user) return;

    try {
      await syncAvailabilityToSystemLocal(user.id, availabilitySlots);
      console.log('✅ Disponibilités synchronisées avec le système');
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation des disponibilités:', error);
    }
  }, [user, availabilitySlots, syncAvailabilityToSystemLocal]);

  const addAvailabilitySlot = useCallback(async () => {
    try {
      // Validation des données
      if (!newSlot.day || !newSlot.startTime || !newSlot.endTime) {
        const errorMsg = 'Tous les champs sont requis pour ajouter un créneau';
        console.error(errorMsg);
        setError(errorMsg);
        return;
      }

      // Vérification que l'heure de fin est après l'heure de début
      if (newSlot.startTime >= newSlot.endTime) {
        const errorMsg = 'L\'heure de fin doit être après l\'heure de début';
        console.error(errorMsg);
        setError(errorMsg);
        return;
      }

      const slot: AvailabilitySlot = {
        id: Date.now().toString(),
        day: newSlot.day,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        isAvailable: true
      };
      
      setAvailabilitySlots(prev => {
        const updatedSlots = [...prev, slot];
        // Synchronisation automatique temporairement désactivée pour éviter le crash
        // TODO: Réactiver après correction du problème d'import
        console.log('📝 Créneau ajouté:', slot);
        return updatedSlots;
      });
      setNewSlot({ day: 'monday', startTime: '09:00', endTime: '10:00' });
      setError(null); // Clear any previous errors
    } catch (error) {
      const errorMsg = 'Erreur lors de l\'ajout du créneau';
      console.error(errorMsg, error);
      setError(errorMsg);
    }
  }, [newSlot, user]);

  const toggleSlotAvailability = useCallback((slotId: string) => {
    try {
      setAvailabilitySlots(slots => {
        const updatedSlots = slots.map(slot =>
          slot.id === slotId ? { ...slot, isAvailable: !slot.isAvailable } : slot
        );
        
        // Synchronisation automatique temporairement désactivée
        console.log('🔄 Disponibilité modifiée pour slot:', slotId);
        
        return updatedSlots;
      });
    } catch (error) {
      console.error('Erreur lors de la modification de la disponibilité:', error);
    }
  }, [user]);

  const deleteSlot = useCallback((slotId: string) => {
    try {
      setAvailabilitySlots(slots => {
        const updatedSlots = slots.filter(slot => slot.id !== slotId);
        
        // Synchronisation automatique temporairement désactivée
        console.log('🗑️ Créneau supprimé:', slotId);
        
        return updatedSlots;
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du créneau:', error);
    }
  }, [user]);

  const updateBookingStatus = useCallback((bookingId: string, status: 'confirmed' | 'cancelled') => {
    try {
      setBookings(bookings =>
        bookings.map(booking =>
          booking.id === bookingId ? { ...booking, status } : booking
        )
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  }, []);

  const getStatusColor = useCallback((status: string): string => {
    switch (status) {
      case 'confirmed': return '#61bfac';
      case 'pending': return '#ffcc00';
      case 'cancelled': return '#ff6b6b';
      default: return '#888';
    }
  }, []);

  const getStatusLabel = useCallback((status: string): string => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  }, []);

  const formatDate = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Date invalide pour le formatage:', dateString);
        return 'Date invalide';
      }
      return date.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return 'Date invalide';
    }
  }, []);

  // Gestion de la touche Escape pour fermer le modal
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  // Effet pour ajouter l'écoute des événements clavier
  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
      onClick={(e) => {
        // Fermer le modal si on clique sur l'arrière-plan
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-manager-title"
    >
      <div style={{
        backgroundColor: '#111',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '1000px',
        width: '95%',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid #333'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 id="calendar-manager-title" style={{ color: '#ffcc00', margin: 0 }}>Gestion des Réservations</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px'
            }}
            aria-label="Fermer la gestion des réservations"
            title="Fermer (Échap)"
          >
            ✕
          </button>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div style={{
            backgroundColor: '#2d1b1b',
            border: '1px solid #ff6b6b',
            borderRadius: '4px',
            padding: '12px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#ff6b6b', fontSize: '14px' }}>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ff6b6b',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '0'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* État d'authentification Google Calendar */}
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '16px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #333'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ color: '#ffcc00', margin: '0 0 8px 0' }}>
                📅 Intégration Google Calendar
              </h4>
              <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>
                {isAuthenticated 
                  ? '✅ Connecté - Vos événements sont synchronisés' 
                  : '⚠️ Connectez-vous à Google Calendar pour une synchronisation complète'
                }
              </p>
            </div>
            {!isAuthenticated && (
              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4285f4',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Connexion...' : 'Se connecter avec Google'}
              </button>
            )}
            {isAuthenticated && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={loadCalendarEvents}
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#61bfac',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Synchronisation...' : 'Actualiser le calendrier'}
                </button>
                <button
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ffcc00',
                    color: '#0a0a0a',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  🔄 Reconnecter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Onglets */}
        <div style={{
          display: 'flex',
          marginBottom: '24px',
          borderBottom: '1px solid #333'
        }}>
          <button
            onClick={() => setActiveTab('availability')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'availability' ? '#ffcc00' : 'transparent',
              color: activeTab === 'availability' ? '#0a0a0a' : '#f5f5f7',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              borderBottom: activeTab === 'availability' ? '2px solid #ffcc00' : 'none'
            }}
          >
            Mes Disponibilités
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'bookings' ? '#ffcc00' : 'transparent',
              color: activeTab === 'bookings' ? '#0a0a0a' : '#f5f5f7',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              borderBottom: activeTab === 'bookings' ? '2px solid #ffcc00' : 'none'
            }}
          >
            Réservations ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'calendar' ? '#ffcc00' : 'transparent',
              color: activeTab === 'calendar' ? '#0a0a0a' : '#f5f5f7',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              borderBottom: activeTab === 'calendar' ? '2px solid #ffcc00' : 'none'
            }}
          >
            Calendrier Google ({calendarEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('talents')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'talents' ? '#ffcc00' : 'transparent',
              color: activeTab === 'talents' ? '#0a0a0a' : '#f5f5f7',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              borderBottom: activeTab === 'talents' ? '2px solid #ffcc00' : 'none'
            }}
          >
            Rendez-vous Talents ({appointments.length})
          </button>
        </div>

        {/* Onglet Disponibilités */}
        {activeTab === 'availability' && (
          <div>
            {/* Calendrier des disponibilités - EN PREMIER */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ color: '#ffcc00', marginBottom: '16px' }}>
                🗓️ CALENDRIER AVEC DATES (4 prochaines semaines)
              </h4>
              <div style={{ 
                display: 'grid', 
                gap: '12px',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
              }}>
                {availableDates.slice(0, 14).map((date) => {
                  const slotsForDate = getAvailableSlotsForDate(date);
                  // Optimisation: Ne pas rendre les jours sans créneaux disponibles
                  if (slotsForDate.length === 0) {
                    return null;
                  }
                  return (
                    <div
                      key={date}
                      style={{
                        backgroundColor: '#1a1a1a',
                        padding: '16px',
                        borderRadius: '4px',
                        border: '2px solid #ffcc00'
                      }}
                    >
                      <h5 style={{ color: '#ffcc00', margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold' }}>
                        📅 {formatDate(date)}
                      </h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {slotsForDate.map((slot) => (
                            <div
                              key={slot.id}
                              style={{
                                padding: '8px 12px',
                                backgroundColor: isSlotBooked(date, slot.id) ? '#2d1b1b' : '#333',
                                borderRadius: '4px',
                                border: isSlotBooked(date, slot.id) ? '1px solid #ff6b6b' : '1px solid #555',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <span style={{ 
                                color: isSlotBooked(date, slot.id) ? '#ff6b6b' : '#f5f5f7',
                                fontSize: '14px'
                              }}>
                                {slot.startTime} - {slot.endTime}
                              </span>
                              {isSlotBooked(date, slot.id) && (
                                <span style={{ 
                                  color: '#ff6b6b', 
                                  fontSize: '12px',
                                  fontStyle: 'italic'
                                }}>
                                  Réservé
                                </span>
                              )}
                            </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{
              backgroundColor: '#1a1a1a',
              padding: '20px',
              borderRadius: '4px',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <h4 style={{ color: '#ffcc00', marginTop: 0, marginBottom: 0 }}>
                  Ajouter une disponibilité récurrente
                </h4>
                <button
                  onClick={syncAvailabilityToSystem}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#61bfac',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  🔄 Sync Talents
                </button>
              </div>
              <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr 1fr auto' }}>
                <select
                  value={newSlot.day}
                  onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#333',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    color: '#f5f5f7'
                  }}
                >
                  {daysOfWeek.map(day => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
                <input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#333',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    color: '#f5f5f7'
                  }}
                />
                <input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#333',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    color: '#f5f5f7'
                  }}
                />
                <button
                  onClick={addAvailabilitySlot}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ffcc00',
                    color: '#0a0a0a',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Ajouter
                </button>
              </div>
            </div>

            <div>
              <h4 style={{ color: '#ffcc00', marginBottom: '16px' }}>
                Mes créneaux récurrents
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {availabilitySlots.map((slot) => (
                  <div
                    key={slot.id}
                    style={{
                      backgroundColor: '#1a1a1a',
                      padding: '16px',
                      borderRadius: '4px',
                      border: '1px solid #333',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h5 style={{ color: '#f5f5f7', margin: '0 0 8px 0' }}>
                        {daysOfWeek.find(d => d.value === slot.day)?.label}
                      </h5>
                      <p style={{ color: '#888', margin: '4px 0', fontSize: '14px' }}>
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => toggleSlotAvailability(slot.id)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: slot.isAvailable ? '#61bfac' : '#ff6b6b',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {slot.isAvailable ? 'Actif' : 'Inactif'}
                      </button>
                      <button
                        onClick={() => deleteSlot(slot.id)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: 'transparent',
                          color: '#ff6b6b',
                          border: '1px solid #ff6b6b',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Onglet Réservations */}
        {activeTab === 'bookings' && (
          <div>
            <h4 style={{ color: '#ffcc00', marginBottom: '16px' }}>
              Réservations des talents
            </h4>
            {bookings.length === 0 ? (
              <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
                Aucune réservation pour le moment
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    style={{
                      backgroundColor: '#1a1a1a',
                      padding: '16px',
                      borderRadius: '4px',
                      border: '1px solid #333'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h5 style={{ color: '#f5f5f7', margin: '0 0 8px 0' }}>
                          {booking.talentName}
                        </h5>
                        <p style={{ color: '#888', margin: '4px 0', fontSize: '14px' }}>
                          <strong>Date:</strong> {formatDate(booking.date)}
                        </p>
                        <p style={{ color: '#888', margin: '4px 0', fontSize: '14px' }}>
                          <strong>Heure:</strong> {booking.startTime} - {booking.endTime}
                        </p>
                        {booking.notes && (
                          <p style={{ color: '#888', margin: '8px 0 0 0', fontSize: '14px' }}>
                            <strong>Notes:</strong> {booking.notes}
                          </p>
                        )}
                        <div style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          backgroundColor: getStatusColor(booking.status),
                          color: '#fff',
                          borderRadius: '4px',
                          fontSize: '12px',
                          marginTop: '8px'
                        }}>
                          {getStatusLabel(booking.status)}
                        </div>
                      </div>
                      {booking.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#61bfac',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Confirmer
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#ff6b6b',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Refuser
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Onglet Google Calendar */}
        {activeTab === 'calendar' && (
          <div>
            <h4 style={{ color: '#ffcc00', marginBottom: '16px' }}>
              📅 Calendrier Google Calendar
            </h4>
            {!isAuthenticated ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                backgroundColor: '#1a1a1a',
                borderRadius: '4px',
                border: '1px solid #333'
              }}>
                <p style={{ color: '#888', marginBottom: '16px' }}>
                  Connectez-vous à Google Calendar pour voir votre calendrier
                </p>
                <button
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#4285f4',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Connexion...' : '🔗 Se connecter avec Google'}
                </button>
              </div>
            ) : (
              <div>
                <div style={{ 
                  backgroundColor: '#2d1b1b', 
                  border: '1px solid #ff6b6b', 
                  borderRadius: '4px', 
                  padding: '8px', 
                  marginBottom: '16px',
                  color: '#ff6b6b',
                  fontSize: '12px'
                }}>
                  🔍 Debug: Calendrier chargé - {calendarEvents.length} événements trouvés
                </div>
                <div style={{
                  backgroundColor: '#1a1a1a',
                  border: '2px solid #ffcc00',
                  borderRadius: '8px',
                  padding: '20px',
                  marginTop: '16px'
                }}>
                  <h3 style={{ color: '#ffcc00', margin: '0 0 16px 0' }}>
                    🎉 NOUVEAU CALENDRIER VISUEL !
                  </h3>
                  <p style={{ color: '#f5f5f7' }}>
                    Si vous voyez ce message, le nouveau design fonctionne !
                  </p>
                  <CalendarGrid
                    events={calendarEvents}
                    currentDate={currentCalendarDate}
                    onPreviousMonth={goToPreviousMonth}
                    onNextMonth={goToNextMonth}
                    onDateClick={handleDateClick}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Onglet Rendez-vous Talents */}
        {activeTab === 'talents' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h4 style={{ color: '#ffcc00', margin: 0 }}>
                👥 Rendez-vous avec les Talents
              </h4>
              {isAuthenticated && appointments.length > 0 && (
                <button
                  onClick={syncAllAppointments}
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#4285f4',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Synchronisation...' : '🔄 Synchroniser tous avec Google'}
                </button>
              )}
            </div>

            {!isAuthenticated && (
              <div style={{
                backgroundColor: '#2d1b1b',
                border: '1px solid #ff6b6b',
                borderRadius: '4px',
                padding: '12px',
                marginBottom: '20px'
              }}>
                <span style={{ color: '#ff6b6b', fontSize: '14px' }}>
                  ⚠️ Connectez-vous à Google Calendar pour synchroniser automatiquement vos rendez-vous
                </span>
              </div>
            )}

            {appointments.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                backgroundColor: '#1a1a1a',
                borderRadius: '4px',
                border: '1px solid #333'
              }}>
                <p style={{ color: '#888', marginBottom: '16px' }}>
                  Aucun rendez-vous talent pour le moment
                </p>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Les rendez-vous créés par les talents apparaîtront ici
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {appointments
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      style={{
                        backgroundColor: '#1a1a1a',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #333'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '12px'
                      }}>
                        <div style={{ flex: 1 }}>
                          <h5 style={{ color: '#f5f5f7', margin: '0 0 8px 0', fontSize: '18px' }}>
                            {appointment.talentName}
                          </h5>
                          <p style={{ color: '#888', margin: '4px 0', fontSize: '14px' }}>
                            📧 {appointment.talentEmail}
                          </p>
                          <p style={{ color: '#ffcc00', margin: '4px 0', fontSize: '16px', fontWeight: 'bold' }}>
                            📅 {formatDate(appointment.date)} à {appointment.time}
                          </p>
                          <p style={{ color: '#61bfac', margin: '4px 0', fontSize: '14px' }}>
                            🕐 Durée: {appointment.duration} minutes | 📋 Type: {appointment.type}
                          </p>
                          {appointment.notes && (
                            <div style={{
                              marginTop: '12px',
                              padding: '12px',
                              backgroundColor: '#333',
                              borderRadius: '4px',
                              borderLeft: '4px solid #ffcc00'
                            }}>
                              <strong style={{ color: '#ffcc00' }}>📝 Notes:</strong>
                              <p style={{ color: '#f5f5f7', margin: '4px 0 0 0', fontSize: '14px' }}>
                                {appointment.notes}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                          {/* Statut */}
                          <div style={{
                            padding: '6px 12px',
                            backgroundColor: appointment.status === 'confirmé' ? '#61bfac' : 
                                           appointment.status === 'en_attente' ? '#ffcc00' : '#ff6b6b',
                            color: appointment.status === 'en_attente' ? '#000' : '#fff',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {appointment.status === 'confirmé' ? '✅ Confirmé' :
                             appointment.status === 'en_attente' ? '⏳ En attente' : '❌ Annulé'}
                          </div>

                          {/* Actions */}
                          {isAuthenticated && appointment.status === 'confirmé' && (
                            <button
                              onClick={() => syncAppointmentToGoogle(appointment)}
                              disabled={loading}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#4285f4',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                opacity: loading ? 0.6 : 1
                              }}
                            >
                              {loading ? '⏳' : '📅 Sync Google'}
                            </button>
                          )}
                          
                          {appointment.googleEventId && (
                            <div style={{
                              padding: '4px 8px',
                              backgroundColor: '#4285f4',
                              color: '#fff',
                              borderRadius: '4px',
                              fontSize: '10px'
                            }}>
                              ✅ Synchronisé
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Instructions */}
            <div style={{
              backgroundColor: '#1a1a1a',
              padding: '16px',
              borderRadius: '4px',
              marginTop: '20px',
              border: '1px solid #333'
            }}>
              <h5 style={{ color: '#ffcc00', margin: '0 0 8px 0' }}>💡 Comment ça marche</h5>
              <ul style={{ color: '#888', fontSize: '14px', margin: '8px 0', paddingLeft: '20px' }}>
                <li>Les rendez-vous créés par les talents apparaissent automatiquement ici</li>
                <li>Connectez-vous à Google Calendar pour synchroniser automatiquement</li>
                <li>Les rendez-vous confirmés peuvent être synchronisés individuellement</li>
                <li>Utilisez "Synchroniser tous" pour synchroniser tous les rendez-vous confirmés d'un coup</li>
              </ul>
            </div>
          </div>
        )}

        {/* Note d'information */}
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '16px',
          borderRadius: '4px',
          marginTop: '20px',
          border: '1px solid #333'
        }}>
          <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>
            <strong>Comment ça marche :</strong> Définissez vos disponibilités récurrentes (ex: tous les lundis 9h-12h). 
            Le système génère automatiquement les créneaux pour les 4 prochaines semaines. Les talents peuvent réserver 
            des créneaux spécifiques et vous gérez les demandes dans l'onglet "Réservations".
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleCalendarManager;
