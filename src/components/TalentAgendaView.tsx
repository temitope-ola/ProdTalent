import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import { AvailabilityService } from '../services/availabilityService';
import { AppointmentService } from '../services/appointmentService';
import { TimezoneService } from '../services/timezoneService';
import { useNotifications } from './NotificationManager';

interface TalentAgendaViewProps {
  onClose: () => void;
}

const TalentAgendaView: React.FC<TalentAgendaViewProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  
  const [coaches, setCoaches] = useState<Array<{id: string, name: string, availabilityCount: number}>>([]);
  const [selectedCoach, setSelectedCoach] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [userTimeZone, setUserTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [coachTimeZone, setCoachTimeZone] = useState<string>('America/Toronto'); // Default timezone

  console.log('🌍 TalentAgendaView - Fuseau horaire talent détecté:', userTimeZone);

  // Créneaux horaires disponibles (heures de travail réalistes)
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  // Charger les coachs disponibles au montage
  useEffect(() => {
    loadCoaches();
  }, []);

  // Générer les dates disponibles (prochaines 4 semaines)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 28; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Exclure les weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  const loadCoaches = async () => {
    try {
      console.log('🔄 Chargement des coachs...');
      const coachesData = await AvailabilityService.getAllCoachesWithAvailability();
      console.log('📊 Données coachs reçues:', coachesData);
      
      setCoaches(coachesData);
      
      // Sélectionner automatiquement le premier coach avec des disponibilités
      if (coachesData.length > 0 && coachesData[0].availabilityCount > 0) {
        setSelectedCoach(coachesData[0].id);
        console.log('✅ Coach auto-sélectionné:', coachesData[0].name);
      }
      
      console.log(`✅ ${coachesData.length} coachs chargés`);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des coachs:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: `Impossible de charger les coachs: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  };

  // Charger les disponibilités quand une date est sélectionnée
  useEffect(() => {
    if (selectedDate && selectedCoach) {
      loadCoachAvailabilities();
    }
  }, [selectedDate, selectedCoach]);

  const loadCoachAvailabilities = async () => {
    setIsLoading(true);
    try {
      // Charger d'abord les informations de timezone du coach
      const availabilityData = await AvailabilityService.getAvailabilityWithTimezone(selectedCoach, selectedDate);

      if (availabilityData) {
        setCoachTimeZone(availabilityData.timezone || 'America/Toronto');
        console.log('🌍 Timezone du coach chargée:', availabilityData.timezone);
      }

      // TOUJOURS utiliser getAvailableSlots qui filtre les créneaux occupés
      const availableSlots = await AvailabilityService.getAvailableSlots(selectedCoach, selectedDate);
      setAvailableSlots(availableSlots);

      console.log('✅ TalentAgendaView - Créneaux finalement affichés:', availableSlots);
    } catch (error) {
      console.error('Erreur lors du chargement des disponibilités:', error);
      setAvailableSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('fr-FR', {
      timeZone: userTimeZone,
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTimeInUserZone = (time: string, originalTimezone?: string) => {
    const targetTimezone = originalTimezone || coachTimeZone;
    const convertedTime = TimezoneService.convertTime(
      time,
      selectedDate || new Date().toISOString().split('T')[0],
      targetTimezone,
      userTimeZone
    );

    // Ajouter l'indication de timezone pour la clarté
    const timezoneLabel = TimezoneService.formatTimeWithTimezone(convertedTime, userTimeZone);
    return timezoneLabel;
  };

  const handleSlotClick = async (slot: string) => {
    if (!user) {
      showNotification({
        type: 'error',
        title: 'Connexion requise',
        message: 'Vous devez être connecté pour réserver un créneau'
      });
      return;
    }

    // Vérifier si le créneau est encore disponible
    const isAvailable = await AvailabilityService.isSlotAvailable(selectedCoach, selectedDate, slot);
    if (!isAvailable) {
      showNotification({
        type: 'error',
        title: 'Créneau non disponible',
        message: 'Ce créneau a déjà été réservé par quelqu\'un d\'autre'
      });
      // Recharger les disponibilités pour mettre à jour l'affichage
      await loadCoachAvailabilities();
      return;
    }

        // Ouvrir le modal pour saisir la raison
    setSelectedSlot(slot);
    setShowReasonModal(true);
  };

  const handleCreateAppointment = async () => {
    if (!user || !reason.trim()) {
      showNotification({
        type: 'error',
        title: 'Raison requise',
        message: 'Veuillez indiquer la raison de votre demande de rendez-vous'
      });
      return;
    }

    try {
      // Trouver les informations du coach sélectionné
      const selectedCoachData = coaches.find(c => c.id === selectedCoach);
      if (!selectedCoachData) {
        showNotification({
          type: 'error',
          title: 'Erreur',
          message: 'Coach non trouvé'
        });
        return;
      }

      // Créer le rendez-vous
      const appointmentData = {
        coachId: selectedCoach,
        coachName: selectedCoachData.name,
        talentId: user.id,
        talentName: user.displayName || user.email?.split('@')[0] || 'Talent',
        talentEmail: user.email || '',
        date: selectedDate,
        time: selectedSlot,
        duration: 30, // 30 minutes par défaut
        type: 'Autre' as const, // Type par défaut pour coaching
        status: 'en_attente' as const,
        notes: reason.trim()
      };

      const result = await AppointmentService.createAppointment(appointmentData);
      
      if (result.success) {
        showNotification({
          type: 'success',
          title: 'Réservation confirmée',
          message: `Réservation du créneau ${selectedSlot} avec ${selectedCoachData.name} le ${formatDate(selectedDate)}`
        });
        
        // Réinitialiser les états
        setReason('');
        setSelectedSlot('');
        setShowReasonModal(false);
        
        // Recharger les disponibilités pour masquer le créneau réservé
        await loadCoachAvailabilities();
        
        // Fermer l'agenda après réservation réussie
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        showNotification({
          type: 'error',
          title: 'Erreur de réservation',
          message: result.error || 'Erreur lors de la réservation'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Erreur lors de la réservation du créneau'
      });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: '#111',
        borderRadius: 4,
        padding: 24,
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: 'none'
        }}>
          <h2 style={{ color: '#ffcc00', margin: 0 }}>Agenda de Coaching</h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              color: '#f5f5f7',
              border: 'none',
              borderRadius: 4,
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Fermer
          </button>
        </div>

        {/* Fuseau horaire info */}
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '14px', color: '#ffcc00' }}>
            🕐 Horaires affichés dans votre fuseau : {userTimeZone}
          </span>
        </div>

        {/* Mode développement info */}
        {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
          <div style={{
            backgroundColor: '#1a4d1a',
            border: '1px solid #4caf50',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '14px', color: '#4caf50' }}>
              🛠️ Mode développement : Les fonctionnalités Google Calendar sont simulées
            </span>
          </div>
        )}

        {/* Sélection du coach */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: '#f5f5f7', display: 'block', marginBottom: 8 }}>
            Coach *
          </label>
          {coaches.length === 0 ? (
            <div style={{
              padding: 12,
              backgroundColor: '#333',
              color: '#888',
              border: 'none',
              borderRadius: 4,
              fontSize: '14px'
            }}>
              Chargement des coachs...
            </div>
          ) : (
            <select
              value={selectedCoach}
              onChange={(e) => {
                setSelectedCoach(e.target.value);
                setSelectedDate(''); // Reset date when changing coach
                setAvailableSlots([]);
              }}
              style={{
                width: '100%',
                padding: 12,
                backgroundColor: '#333',
                color: '#f5f5f7',
                border: 'none',
                borderRadius: 4,
                fontSize: '14px'
              }}
            >
              <option value="">Sélectionnez un coach</option>
              {coaches.map(coach => (
                <option key={coach.id} value={coach.id}>
                  {coach.name} ({coach.availabilityCount} créneaux disponibles)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Sélection de la date */}
        {selectedCoach && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ color: '#f5f5f7', display: 'block', marginBottom: 8 }}>
              Date *
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                width: '100%',
                padding: 12,
                backgroundColor: '#333',
                color: '#f5f5f7',
                border: 'none',
                borderRadius: 4,
                fontSize: '14px'
              }}
            >
              <option value="">Sélectionnez une date</option>
              {getAvailableDates().map(date => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Créneaux disponibles */}
        {selectedDate && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ color: '#ffcc00', marginBottom: 8 }}>
              Créneaux disponibles *
            </h3>
            <div style={{
              color: '#888',
              fontSize: '12px',
              marginBottom: 16,
              padding: '8px 12px',
              backgroundColor: '#1a1a1a',
              borderRadius: 4,
              border: '1px solid #333'
            }}>
              🌍 Heures affichées dans votre fuseau: {TimezoneService.getUserTimezone()}
              <br />
              📍 Coach situé en: {coachTimeZone}
            </div>
            
            {isLoading ? (
              <div style={{ color: '#f5f5f7', textAlign: 'center', padding: 20 }}>
                Chargement des créneaux...
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: 8
              }}>
                {timeSlots.map(slot => {
                  const isAvailable = availableSlots.includes(slot);
                  return (
                    <button
                      key={slot}
                      onClick={() => isAvailable && handleSlotClick(slot)}
                      disabled={!isAvailable}
                      style={{
                        padding: '12px 8px',
                        backgroundColor: isAvailable ? '#ffcc00' : '#333',
                        color: isAvailable ? '#000' : '#666',
                        border: 'none',
                        borderRadius: 4,
                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                        fontSize: '12px',
                        fontWeight: isAvailable ? 'bold' : 'normal',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (isAvailable) {
                          e.currentTarget.style.backgroundColor = '#e6b800';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isAvailable) {
                          e.currentTarget.style.backgroundColor = '#ffcc00';
                        }
                      }}
                    >
                      {formatTimeInUserZone(slot)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: 16,
          borderRadius: 4,
          border: 'none'
        }}>
          <h4 style={{ color: '#ffcc00', margin: '0 0 8px 0' }}>Instructions :</h4>
          <ul style={{ color: '#f5f5f7', margin: 0, paddingLeft: 20, fontSize: '14px' }}>
            <li>Sélectionnez d'abord un coach disponible</li>
            <li>Choisissez ensuite une date disponible</li>
            <li>Cliquez sur un créneau jaune pour réserver</li>
            <li>Les créneaux gris ne sont pas disponibles</li>
            <li>Les horaires sont convertis dans votre fuseau horaire ({userTimeZone})</li>
            <li>Vous devrez indiquer la raison de votre demande</li>
          </ul>
        </div>
      </div>

      {/* Modal pour saisir la raison */}
      {showReasonModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10001
        }}>
          <div style={{
            backgroundColor: '#111',
            borderRadius: 4,
            padding: 24,
            width: '90%',
            maxWidth: '500px',
            border: 'none'
          }}>
            <h3 style={{ color: '#ffcc00', margin: '0 0 16px 0' }}>
              Raison de votre demande
            </h3>
            
            <p style={{ color: '#f5f5f7', marginBottom: 16, fontSize: '14px' }}>
              Créneau sélectionné : {formatTimeInUserZone(selectedSlot, coachTimeZone)} le {formatDate(selectedDate)}
            </p>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: '#f5f5f7', display: 'block', marginBottom: 8 }}>
                Pourquoi souhaitez-vous ce rendez-vous ? *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Préparation d'entretien, conseils de carrière, développement de compétences..."
                style={{
                  width: '100%',
                  minHeight: 100,
                  padding: 12,
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowReasonModal(false);
                  setReason('');
                  setSelectedSlot('');
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  color: '#f5f5f7',
                  border: '1px solid #333',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleCreateAppointment}
                disabled={!reason.trim()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: reason.trim() ? '#ffcc00' : '#666',
                  color: reason.trim() ? '#000' : '#999',
                  border: 'none',
                  borderRadius: 4,
                  cursor: reason.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Confirmer la réservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TalentAgendaView;
