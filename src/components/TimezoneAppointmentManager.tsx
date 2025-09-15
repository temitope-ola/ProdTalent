import React, { useState, useEffect } from 'react';
import useAuth from '../contexts/AuthContext';
import { useNotifications } from './NotificationManager';

interface Appointment {
  id: string;
  talentId: string;
  talentName: string;
  talentEmail: string;
  coachId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  createdAt: Date;
  meetLink?: string;
  calendarLink?: string;
  talentTimeZone?: string;
  coachTimeZone?: string;
  notes?: string;
}

interface TimezoneAppointmentManagerProps {
  onClose: () => void;
}

const TimezoneAppointmentManager: React.FC<TimezoneAppointmentManagerProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [userTimeZone, setUserTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected' | 'completed'>('all');

  console.log('🌍 TimezoneAppointmentManager - Fuseau horaire détecté:', userTimeZone);

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('📅 Chargement des rendez-vous pour le coach:', user.id);
      
      // Import dynamique pour éviter les erreurs de cache
      const { AppointmentService } = await import('../services/appointmentService');
      const result = await AppointmentService.getCoachAppointments(user.id);
      
      if (result.success && result.data) {
        setAppointments(result.data);
        console.log('✅ Rendez-vous chargés:', result.data.length);
      } else {
        console.log('⚠️ Aucun rendez-vous trouvé');
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

  const handleAppointmentAction = async (appointmentId: string, action: 'confirm' | 'reject' | 'complete') => {
    setLoading(true);
    try {
      console.log(`📅 ${action === 'confirm' ? 'Confirmation' : action === 'reject' ? 'Rejet' : 'Finalisation'} du rendez-vous:`, appointmentId);
      
      const { AppointmentService } = await import('../services/appointmentService');
      let newStatus: string;
      if (action === 'confirm') newStatus = 'confirmed';
      else if (action === 'reject') newStatus = 'rejected';
      else if (action === 'complete') newStatus = 'completed';
      else newStatus = 'pending';
      
      const success = await AppointmentService.updateAppointmentStatus(appointmentId, newStatus as any);
      
      if (success) {
        // Si confirmation, créer l'événement Google Calendar
        if (action === 'confirm') {
          await createGoogleCalendarEvent(appointmentId);
        }
        
        await loadAppointments(); // Recharger la liste
        showNotification({
          type: 'success',
          title: action === 'confirm' ? 'Confirmé' : action === 'reject' ? 'Refusé' : 'Terminé',
          message: action === 'confirm' 
            ? 'Rendez-vous confirmé ! Événement Google Calendar créé.' 
            : action === 'reject'
            ? 'Rendez-vous refusé.'
            : 'Rendez-vous marqué comme terminé.'
        });
      } else {
        showNotification({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors de la mise à jour du rendez-vous'
        });
      }
    } catch (error) {
      console.error(`❌ Erreur lors du ${action}:`, error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: `Erreur lors du ${action === 'confirm' ? 'confirmation' : action === 'reject' ? 'rejet' : 'finalisation'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const createGoogleCalendarEvent = async (appointmentId: string) => {
    try {
      console.log('📅 Création événement Google Calendar pour:', appointmentId);
      
      const appointment = appointments.find(a => a.id === appointmentId);
      if (!appointment) return;

      // Import dynamique du service Google Calendar
      const { googleCalendarGISService } = await import('../services/googleCalendarGISService');
      
      // Vérifier l'authentification
      const isAuthenticated = await googleCalendarGISService.isUserAuthenticated();
      if (!isAuthenticated) {
        const authSuccess = await googleCalendarGISService.authenticate();
        if (!authSuccess) {
          showNotification({
            type: 'error',
            title: 'Authentification requise',
            message: 'Authentification Google Calendar requise'
          });
          return;
        }
      }

      // Créer l'événement avec les bonnes informations de fuseau horaire
      const startDateTime = new Date(`${appointment.date}T${appointment.time}:00`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // +1h

      const eventData = {
        summary: `Coaching - ${appointment.talentName}`,
        description: `Rendez-vous de coaching avec ${appointment.talentName}\n\nEmail: ${appointment.talentEmail}\n\nNotes: ${appointment.notes || 'Aucune note'}`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: userTimeZone
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: userTimeZone
        },
        attendees: [
          { email: appointment.talentEmail },
          { email: user?.email }
        ],
        conferenceData: {
          createRequest: {
            requestId: `meeting_${appointmentId}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        }
      };

      const event = await googleCalendarGISService.createEvent(eventData);
      
      if (event) {
        console.log('✅ Événement Google Calendar créé:', event);
        
        // Parser l'événement (en mode dev c'est un JSON string)
        let eventObject = event;
        if (typeof event === 'string') {
          try {
            eventObject = JSON.parse(event);
          } catch (e) {
            eventObject = event;
          }
        }
        
        // Extraire le lien Meet
        const meetLink = eventObject.hangoutLink || eventObject.conferenceData?.entryPoints?.[0]?.uri;
        const calendarLink = `https://calendar.google.com/calendar/event?eid=${eventObject.id}`;
        
        if (meetLink) {
          // Mettre à jour l'appointment avec les liens Meet et Calendar
          const { AppointmentService } = await import('../services/appointmentService');
          await AppointmentService.updateAppointmentLinks(appointmentId, meetLink, calendarLink);
          console.log('✅ Liens Meet et Calendar sauvegardés:', { meetLink, calendarLink });
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'événement Google Calendar:', error);
      showNotification({
        type: 'warning',
        title: 'Partiellement réussi',
        message: 'Rendez-vous confirmé mais erreur lors de la création Google Calendar'
      });
    }
  };

  const formatDateTimeInUserZone = (date: string, time: string) => {
    try {
      const dateTime = new Date(`${date}T${time}:00`);
      return {
        date: dateTime.toLocaleDateString('fr-FR', {
          timeZone: userTimeZone,
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }),
        time: dateTime.toLocaleTimeString('fr-FR', {
          timeZone: userTimeZone,
          hour: '2-digit',
          minute: '2-digit'
        })
      };
    } catch (error) {
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
      case 'en_attente': return 'En attente';
      case 'confirmed':
      case 'confirmé': return 'Confirmé';
      case 'rejected':
      case 'refusé': return 'Refusé';
      case 'completed':
      case 'terminé': return 'Terminé';
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
        borderRadius: '12px',
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
              Gérez vos rendez-vous avec support des fuseaux horaires
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
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '14px', color: '#ffcc00' }}>
            🕐 Votre fuseau horaire : {userTimeZone}
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
              🛠️ Mode développement : L'authentification Google et la création d'événements sont simulées
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
                borderRadius: '6px',
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
            <p>Chargement des rendez-vous...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#888'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
            <p>Aucun rendez-vous {selectedFilter !== 'all' ? getStatusText(selectedFilter) : ''}</p>
          </div>
        ) : (
          <div style={{ maxHeight: '500px', overflow: 'auto' }}>
            {filteredAppointments.map((appointment) => {
              const formattedDateTime = formatDateTimeInUserZone(appointment.date, appointment.time);
              
              return (
                <div
                  key={appointment.id}
                  style={{
                    backgroundColor: '#2a2a2a',
                    padding: '20px',
                    borderRadius: '8px',
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
                        👤 {appointment.talentName}
                      </h4>
                      <div style={{ color: '#f5f5f7', marginBottom: '4px' }}>
                        📧 {appointment.talentEmail}
                      </div>
                      <div style={{ color: '#f5f5f7', marginBottom: '4px' }}>
                        📅 {formattedDateTime.date}
                      </div>
                      <div style={{ color: '#f5f5f7', marginBottom: '8px' }}>
                        🕐 {formattedDateTime.time}
                      </div>
                      
                      {appointment.talentTimeZone && appointment.talentTimeZone !== userTimeZone && (
                        <div style={{ 
                          color: '#888', 
                          fontSize: '12px',
                          fontStyle: 'italic',
                          marginBottom: '8px'
                        }}>
                          🌍 Fuseau du talent: {appointment.talentTimeZone}
                        </div>
                      )}
                      
                      {appointment.notes && (
                        <div style={{ 
                          color: '#ccc', 
                          fontSize: '14px',
                          marginBottom: '8px',
                          fontStyle: 'italic'
                        }}>
                          💬 "{appointment.notes}"
                        </div>
                      )}
                      
                      {(appointment.meetLink || appointment.calendarLink) && (
                        <div style={{ marginBottom: '8px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          {appointment.meetLink && (
                            <a
                              href={appointment.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                textDecoration: 'none',
                                fontSize: '14px',
                                padding: '6px 12px',
                                backgroundColor: '#1a73e8',
                                color: 'white',
                                borderRadius: '6px',
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
                                textDecoration: 'none',
                                fontSize: '14px',
                                padding: '6px 12px',
                                backgroundColor: '#34a853',
                                color: 'white',
                                borderRadius: '6px',
                                fontWeight: 'bold'
                              }}
                            >
                              📅 Voir dans Google Calendar
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
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {getStatusText(appointment.status)}
                      </span>
                      
                      {(appointment.status === 'pending' || appointment.status === 'en_attente') && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleAppointmentAction(appointment.id, 'confirm')}
                            disabled={loading}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#61BFAC',
                              color: '#000',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: loading ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              opacity: loading ? 0.6 : 1
                            }}
                          >
                            Confirmer
                          </button>
                          <button
                            onClick={() => handleAppointmentAction(appointment.id, 'reject')}
                            disabled={loading}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#f44336',
                              color: '#000',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: loading ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              opacity: loading ? 0.6 : 1
                            }}
                          >
                            Refuser
                          </button>
                        </div>
                      )}
                      
                      {(appointment.status === 'confirmed' || appointment.status === 'confirmé') && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleAppointmentAction(appointment.id, 'complete')}
                            disabled={loading}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#2196f3',
                              color: '#000',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: loading ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              opacity: loading ? 0.6 : 1
                            }}
                          >
                            Terminé
                          </button>
                        </div>
                      )}
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
              borderRadius: '8px',
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
              // Ouvrir la gestion des disponibilités
              console.log('Ouvrir gestion disponibilités');
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ffcc00',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            📅 Gérer mes disponibilités
          </button>
        </div>

        {/* Informations */}
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <h4 style={{ color: '#ffcc00', margin: '0 0 8px 0' }}>ℹ️ Informations :</h4>
          <ul style={{ color: '#f5f5f7', margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
            <li>Les horaires sont affichés dans votre fuseau horaire ({userTimeZone})</li>
            <li>Confirmer un rendez-vous crée automatiquement un événement Google Calendar avec Meet</li>
            <li>Le talent et vous recevrez des notifications par email</li>
            <li>Les rendez-vous confirmés apparaissent dans votre agenda Google</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimezoneAppointmentManager;