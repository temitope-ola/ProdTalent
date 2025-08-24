import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import { AvailabilityService } from '../services/availabilityService';

interface CoachAvailabilityManagerProps {
  onClose: () => void;
}

const CoachAvailabilityManager: React.FC<CoachAvailabilityManagerProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Créneaux horaires disponibles
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

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
      // Charger les vraies disponibilités depuis Firestore
      const existingSlots = await AvailabilityService.getAvailability(user.id, selectedDate);
      setAvailableSlots(existingSlots);
      console.log('Disponibilités chargées:', existingSlots);
    } catch (error) {
      console.error('Erreur lors du chargement des disponibilités:', error);
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
      // Sauvegarder les vraies disponibilités dans Firestore
      const success = await AvailabilityService.saveAvailability(user.id, selectedDate, availableSlots);
      
      if (success) {
        console.log('Disponibilités sauvegardées:', {
          coachId: user.id,
          date: selectedDate,
          slots: availableSlots
        });
        setMessage({ type: 'success', text: 'Disponibilités sauvegardées avec succès !' });
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
      }
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
    const months = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
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
          borderBottom: '1px solid #333'
        }}>
          <h2 style={{ color: '#ffcc00', margin: 0 }}>Gestion des Disponibilités</h2>
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
            ✕ Fermer
          </button>
        </div>

        {/* Instructions */}
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: 16,
          borderRadius: 4,
          marginBottom: 20
        }}>
          <h4 style={{ color: '#ffcc00', margin: '0 0 8px 0' }}>Instructions :</h4>
          <ul style={{ color: '#f5f5f7', margin: 0, paddingLeft: 20 }}>
            <li>Sélectionnez une date dans le calendrier</li>
            <li>Cliquez sur les créneaux horaires pour les activer/désactiver</li>
            <li>Cliquez sur "Sauvegarder" pour enregistrer vos disponibilités</li>
          </ul>
        </div>

        {/* Sélection de date */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: '#f5f5f7', display: 'block', marginBottom: 8 }}>
            Sélectionner une date *
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 8
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
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: selectedDate === date ? 'bold' : 'normal',
                  transition: 'all 0.2s ease'
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
                {formatDate(date)}
              </button>
            ))}
          </div>
        </div>

        {/* Créneaux disponibles */}
        {selectedDate && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16
            }}>
              <h3 style={{ color: '#ffcc00', margin: 0 }}>
                Créneaux disponibles - {formatDate(selectedDate)}
              </h3>
              <button
                onClick={saveAvailabilities}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ffcc00',
                  color: '#000',
                  border: 'none',
                  borderRadius: 4,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
            
            {loading ? (
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
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: isSelected ? 'bold' : 'normal',
                        transition: 'all 0.2s ease'
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
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Résumé des créneaux sélectionnés */}
            {availableSlots.length > 0 && (
              <div style={{
                marginTop: 16,
                padding: 12,
                backgroundColor: '#1a1a1a',
                borderRadius: 4
              }}>
                <p style={{ color: '#f5f5f7', margin: 0 }}>
                  Créneaux sélectionnés : {availableSlots.length} créneaux ({availableSlots.join(', ')})
                </p>
              </div>
            )}
          </div>
        )}

        {/* Message de succès/erreur */}
        {message && (
          <div style={{
            padding: 12,
            backgroundColor: message.type === 'success' ? 'rgba(97, 191, 172, 0.1)' : 'rgba(255, 107, 107, 0.1)',
            color: message.type === 'success' ? '#61bfac' : '#ff6b6b',
            borderRadius: 4,
            marginTop: 16,
            textAlign: 'center'
          }}>
            {message.text}
          </div>
        )}

        {/* Informations */}
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: 16,
          borderRadius: 4
        }}>
          <h4 style={{ color: '#ffcc00', margin: '0 0 8px 0' }}>Informations :</h4>
          <ul style={{ color: '#f5f5f7', margin: 0, paddingLeft: 20 }}>
            <li>Les créneaux en jaune sont vos disponibilités</li>
            <li>Cliquez sur un créneau pour l'activer/désactiver</li>
            <li>Vos disponibilités seront visibles par les talents</li>
            <li>N'oubliez pas de sauvegarder après chaque modification</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CoachAvailabilityManager;
