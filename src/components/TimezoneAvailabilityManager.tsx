import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AvailabilityService } from '../services/availabilityService';
import { useNotifications } from './NotificationManager';

interface TimezoneAvailabilityManagerProps {
  onClose: () => void;
}

const TimezoneAvailabilityManager: React.FC<TimezoneAvailabilityManagerProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [userTimeZone, setUserTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);


  // Créneaux horaires disponibles (9h-18h par tranches de 30min)
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  // Générer les dates disponibles (prochaines 4 semaines, lundi-vendredi)
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

  // Charger les disponibilités existantes quand une date est sélectionnée
  useEffect(() => {
    if (selectedDate && user) {
      loadExistingAvailabilities();
    }
  }, [selectedDate, user]);

  const loadExistingAvailabilities = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const existingSlots = await AvailabilityService.getAvailability(user.id, selectedDate);
      setAvailableSlots(existingSlots);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des disponibilités:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSlot = (slot: string) => {
    setAvailableSlots(prev => {
      if (prev.includes(slot)) {
        return prev.filter(s => s !== slot);
      } else {
        return [...prev, slot];
      }
    });
  };

  const saveAvailabilities = async () => {
    if (!user || !selectedDate) return;

    setLoading(true);
    try {
      const success = await AvailabilityService.saveAvailability(user.id, selectedDate, availableSlots, userTimeZone);
      
      if (success) {
        showNotification({
          type: 'success',
          title: 'Succès',
          message: 'Disponibilités sauvegardées avec succès !'
        });
      } else {
        showNotification({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors de la sauvegarde'
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      showNotification('Erreur lors de la sauvegarde', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDateInUserZone = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('fr-FR', {
      timeZone: userTimeZone,
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('fr-FR', {
      timeZone: userTimeZone,
      day: '2-digit',
      month: '2-digit'
    });
  };

  const formatTimeInUserZone = (time: string) => {
    // Créer une date avec l'heure dans le fuseau du coach
    const today = new Date().toISOString().split('T')[0];
    const dateTime = new Date(`${today}T${time}:00`);
    
    return dateTime.toLocaleTimeString('fr-FR', {
      timeZone: userTimeZone,
      hour: '2-digit',
      minute: '2-digit'
    });
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
        backgroundColor: '#1a1a1a',
        borderRadius: '4px',
        padding: '24px',
        width: '90%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflow: 'auto',
        color: '#f5f5f7'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid #333'
        }}>
          <div>
            <h2 style={{ color: '#ffcc00', margin: 0 }}>Prise de Rendez-vous</h2>
            <p style={{ color: '#888', margin: '4px 0 0 0', fontSize: '14px' }}>
              Gérez vos créneaux de disponibilité avec support des fuseaux horaires
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              color: '#888',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Fuseau horaire info */}
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '14px', color: '#ffcc00' }}>
            Votre fuseau horaire : {userTimeZone}
          </span>
        </div>

        {/* Mode développement info */}
        {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
          <div style={{
            backgroundColor: '#1a4d1a',
            border: 'none',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '14px', color: '#4caf50' }}>
              Mode développement : Les fonctionnalités Google Calendar sont simulées pour les tests
            </span>
          </div>
        )}

        {/* Instructions */}
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '16px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <h4 style={{ color: '#ffcc00', margin: '0 0 8px 0' }}>Comment ça marche :</h4>
          <ul style={{ color: '#f5f5f7', margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
            <li>Sélectionnez une date pour publier vos créneaux</li>
            <li>Activez les créneaux où vous êtes disponible</li>
            <li>Les talents verront vos créneaux convertis dans leur fuseau horaire</li>
            <li>Vous recevrez les demandes de rendez-vous dans votre fuseau</li>
          </ul>
        </div>

        {/* Sélection de date */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            color: '#f5f5f7', 
            display: 'block', 
            marginBottom: '12px',
            fontSize: '16px',
            fontWeight: '500'
          }}>
            Sélectionner une date *
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '8px'
          }}>
            {getAvailableDates().map(date => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                style={{
                  padding: '12px 8px',
                  backgroundColor: selectedDate === date ? '#ffcc00' : '#333',
                  color: selectedDate === date ? '#000' : '#f5f5f7',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: selectedDate === date ? 'bold' : 'normal',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  if (selectedDate !== date) {
                    e.currentTarget.style.backgroundColor = '#444';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedDate !== date) {
                    e.currentTarget.style.backgroundColor = '#333';
                  }
                }}
              >
                <div>{formatShortDate(date)}</div>
                <div style={{ fontSize: '10px', opacity: 0.8 }}>
                  {new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short' })}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Créneaux disponibles */}
        {selectedDate && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{ color: '#ffcc00', margin: 0 }}>
                Créneaux disponibles - {formatDateInUserZone(selectedDate)}
              </h3>
              <button
                onClick={saveAvailabilities}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ffcc00',
                  color: '#000',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  opacity: loading ? 0.6 : 1,
                  transition: 'opacity 0.2s'
                }}
              >
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
            
            {loading ? (
              <div style={{
                color: '#f5f5f7',
                textAlign: 'center',
                padding: '40px',
                fontSize: '16px'
              }}>
                Chargement des créneaux...
              </div>
            ) : (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  {timeSlots.map(slot => {
                    const isSelected = availableSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        onClick={() => toggleSlot(slot)}
                        style={{
                          padding: '12px 8px',
                          backgroundColor: isSelected ? '#ffcc00' : '#333',
                          color: isSelected ? '#000' : '#f5f5f7',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: isSelected ? 'bold' : 'normal',
                          transition: 'all 0.2s ease',
                          textAlign: 'center'
                        }}
                        onMouseEnter={(e) => {
                          if (isSelected) {
                            e.currentTarget.style.backgroundColor = '#e6b800';
                          } else {
                            e.currentTarget.style.backgroundColor = '#444';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (isSelected) {
                            e.currentTarget.style.backgroundColor = '#ffcc00';
                          } else {
                            e.currentTarget.style.backgroundColor = '#333';
                          }
                        }}
                      >
                        {formatTimeInUserZone(slot)}
                      </button>
                    );
                  })}
                </div>

                {/* Résumé des créneaux sélectionnés */}
                {availableSlots.length > 0 && (
                  <div style={{
                    backgroundColor: '#2a2a2a',
                    padding: '16px',
                    borderRadius: '4px',
                    border: 'none'
                  }}>
                    <h4 style={{ color: '#ffcc00', margin: '0 0 8px 0' }}>
                      Créneaux sélectionnés ({availableSlots.length})
                    </h4>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      {availableSlots.sort().map(slot => (
                        <span
                          key={slot}
                          style={{
                            backgroundColor: '#ffcc00',
                            color: '#000',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          {formatTimeInUserZone(slot)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Informations importantes */}
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '16px',
          borderRadius: '4px',
          marginTop: '20px'
        }}>
          <h4 style={{ color: '#ffcc00', margin: '0 0 8px 0' }}>Informations importantes :</h4>
          <ul style={{ color: '#f5f5f7', margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
            <li>Vos créneaux sont affichés dans votre fuseau horaire ({userTimeZone})</li>
            <li>Les talents verront ces créneaux automatiquement convertis dans leur fuseau</li>
            <li>Une fois qu'un créneau est réservé, il disparaît pour les autres talents</li>
            <li>Vous recevrez une notification pour chaque demande de rendez-vous</li>
            <li>N'oubliez pas de sauvegarder après chaque modification</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimezoneAvailabilityManager;