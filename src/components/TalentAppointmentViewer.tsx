import React, { useState, useEffect } from 'react';
import useAuth from '../contexts/AuthContext';
import { useNotifications } from './NotificationManager';
import { TimezoneService } from '../services/timezoneService';

interface Appointment {
  id: string;
  talentId: string;
  talentName: string;
  talentEmail: string;
  coachId: string;
  coachName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'en_attente' | 'confirmé' | 'refusé' | 'terminé';
  createdAt: Date;
  meetLink?: string;
  calendarLink?: string;
  talentTimeZone?: string;
  coachTimeZone?: string;
  notes?: string;
}

interface TalentAppointmentViewerProps {
  onClose: () => void;
}

const TalentAppointmentViewer: React.FC<TalentAppointmentViewerProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [userTimeZone, setUserTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected' | 'completed'>('all');

  console.log('🌍 TalentAppointmentViewer - Fuseau horaire détecté:', userTimeZone);

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('📅 Chargement des rendez-vous pour le talent:', user.id);
      
      const { AppointmentService } = await import('../services/appointmentService');
      const result = await AppointmentService.getTalentAppointments(user.id);
      
      if (result.success && result.data) {
        setAppointments(result.data);
        console.log('✅ Rendez-vous talents chargés:', result.data.length);
      } else {
        console.log('⚠️ Aucun rendez-vous trouvé pour ce talent');
        setAppointments([]);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des rendez-vous:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Erreur lors du chargement des rendez-vous'
      });
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTimeInUserZone = (date: string, time: string, appointment: Appointment) => {
    try {
      // Convertir l'heure du coach vers le timezone du talent si nécessaire
      let convertedTime = time;

      if (appointment.coachTimeZone && appointment.coachTimeZone !== userTimeZone) {
        convertedTime = TimezoneService.convertTime(time, date, appointment.coachTimeZone, userTimeZone);
        console.log(`🔄 Conversion ${appointment.coachName}: ${time} (${appointment.coachTimeZone}) → ${convertedTime} (${userTimeZone})`);
      }

      // Formatter la date avec le timezone du talent
      const dateTime = new Date(`${date}T12:00:00`);
      const formattedDate = dateTime.toLocaleDateString('fr-FR', {
        timeZone: userTimeZone,
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

      return {
        date: formattedDate,
        time: convertedTime
      };
    } catch (error) {
      console.error('Erreur formatage date/heure:', error);
      return { date: date, time: time };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'en_attente': return '#ffcc00';
      case 'confirmed':
      case 'confirmé': return '#4caf50';
      case 'rejected':
      case 'refusé': return '#f44336';
      case 'completed':
      case 'terminé': return '#2196f3';
      default: return '#888';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
      case 'en_attente': return 'En attente de validation';
      case 'confirmed':
      case 'confirmé': return 'Confirmé par le coach';
      case 'rejected':
      case 'refusé': return 'Refusé';
      case 'completed':
      case 'terminé': return 'Session terminée';
      default: return status;
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'pending') return appointment.status === 'pending' || appointment.status === 'en_attente';
    if (selectedFilter === 'confirmed') return appointment.status === 'confirmed' || appointment.status === 'confirmé';
    if (selectedFilter === 'rejected') return appointment.status === 'rejected' || appointment.status === 'refusé';
    if (selectedFilter === 'completed') return appointment.status === 'completed' || appointment.status === 'terminé';
    return appointment.status === selectedFilter;
  });

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '4px',
        padding: '24px',
        width: '90%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        overflow: 'auto',
        color: '#f5f5f7'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#ffcc00' }}>
              📋 Mes Rendez-vous
            </h2>
            <p style={{ color: '#888', margin: '4px 0 0 0', fontSize: '14px' }}>
              Consultez vos rendez-vous de coaching
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              fontSize: '24px',
              cursor: 'pointer'
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
            🕐 Horaires affichés dans votre fuseau : {userTimeZone}
          </span>
        </div>

        {/* Mode développement info */}
        {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
          <div style={{
            backgroundColor: '#1a4d1a',
            border: '1px solid #4caf50',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '14px', color: '#4caf50' }}>
              🛠️ Mode développement : Les fonctionnalités Google Calendar sont simulées
            </span>
          </div>
        )}

        {/* Filtres */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          {[
            { key: 'all', label: 'Tous', count: appointments.length },
            { key: 'pending', label: 'En attente', count: appointments.filter(a => a.status === 'pending' || a.status === 'en_attente').length },
            { key: 'confirmed', label: 'Confirmés', count: appointments.filter(a => a.status === 'confirmed' || a.status === 'confirmé').length },
            { key: 'rejected', label: 'Refusés', count: appointments.filter(a => a.status === 'rejected' || a.status === 'refusé').length },
            { key: 'completed', label: 'Terminés', count: appointments.filter(a => a.status === 'completed' || a.status === 'terminé').length }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key as any)}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedFilter === filter.key ? '#ffcc00' : '#333',
                color: selectedFilter === filter.key ? '#000' : '#f5f5f7',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: selectedFilter === filter.key ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* Liste des rendez-vous */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p>Chargement de vos rendez-vous...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#888'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
            <h3>Aucun rendez-vous {selectedFilter !== 'all' ? getStatusText(selectedFilter).toLowerCase() : ''}</h3>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              {selectedFilter === 'all' 
                ? "Vous n'avez pas encore de rendez-vous de coaching."
                : `Aucun rendez-vous avec ce statut.`}
            </p>
          </div>
        ) : (
          <div style={{ maxHeight: '500px', overflow: 'auto' }}>
            {filteredAppointments.map((appointment) => {
              const formattedDateTime = formatDateTimeInUserZone(appointment.date, appointment.time, appointment);
              
              return (
                <div
                  key={appointment.id}
                  style={{
                    backgroundColor: '#2a2a2a',
                    padding: '20px',
                    borderRadius: '4px',
                    marginBottom: '16px',
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
                      <h4 style={{ 
                        margin: '0 0 8px 0', 
                        color: '#ffcc00',
                        fontSize: '16px'
                      }}>
                        🎯 Session avec {appointment.coachName}
                      </h4>
                      <div style={{ color: '#f5f5f7', marginBottom: '4px' }}>
                        📅 {formattedDateTime.date}
                      </div>
                      <div style={{ color: '#f5f5f7', marginBottom: '8px' }}>
                        🕐 {formattedDateTime.time}
                      </div>
                      
                      {appointment.coachTimeZone && appointment.coachTimeZone !== userTimeZone && (
                        <div style={{ 
                          color: '#888', 
                          fontSize: '12px',
                          fontStyle: 'italic',
                          marginBottom: '8px'
                        }}>
                          🌍 Fuseau du coach: {appointment.coachTimeZone}
                        </div>
                      )}
                      
                      {appointment.notes && (
                        <div style={{ 
                          color: '#ccc', 
                          fontSize: '14px',
                          marginBottom: '8px',
                          fontStyle: 'italic'
                        }}>
                          💬 Votre message : "{appointment.notes}"
                        </div>
                      )}
                      
                      {(appointment.meetLink || appointment.calendarLink) && (appointment.status === 'confirmed' || appointment.status === 'confirmé') && (
                        <div style={{ marginBottom: '8px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          {appointment.meetLink && (
                            <a
                              href={appointment.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: 'white',
                                textDecoration: 'none',
                                fontSize: '14px',
                                padding: '8px 16px',
                                backgroundColor: '#1a73e8',
                                borderRadius: '4px',
                                fontWeight: 'bold'
                              }}
                            >
                              🎥 Rejoindre Meet
                            </a>
                          )}
                          {appointment.calendarLink && (
                            <a
                              href={appointment.calendarLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: 'white',
                                textDecoration: 'none',
                                fontSize: '14px',
                                padding: '8px 16px',
                                backgroundColor: '#34a853',
                                borderRadius: '4px',
                                fontWeight: 'bold'
                              }}
                            >
                              📅 Ajouter au calendrier
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '8px'
                    }}>
                      <span style={{
                        backgroundColor: getStatusColor(appointment.status),
                        color: (appointment.status === 'pending' || appointment.status === 'en_attente') ? '#000' : 'white',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div style={{ 
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #333',
          textAlign: 'center'
        }}>
          <button
            onClick={loadAppointments}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#333',
              color: '#f5f5f7',
              border: '1px solid #555',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              marginRight: '12px',
              opacity: loading ? 0.6 : 1
            }}
          >
            🔄 Actualiser
          </button>
          
          <button
            onClick={() => {
              // Ouvrir la page de réservation
              const coachBookingUrl = `/coaches`; // ou une page de liste des coachs
              window.open(coachBookingUrl, '_blank');
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ffcc00',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            📅 Réserver un nouveau rendez-vous
          </button>
        </div>

        {/* Informations */}
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '16px',
          borderRadius: '4px',
          marginTop: '20px'
        }}>
          <h4 style={{ color: '#ffcc00', margin: '0 0 8px 0' }}>ℹ️ Informations :</h4>
          <ul style={{ color: '#f5f5f7', margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
            <li>Les horaires sont affichés dans votre fuseau horaire ({userTimeZone})</li>
            <li>Vous recevez des notifications par email à chaque changement de statut</li>
            <li>Les liens Meet apparaissent une fois le rendez-vous confirmé par le coach</li>
            <li>Vous pouvez contacter directement le coach via la messagerie</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TalentAppointmentViewer;