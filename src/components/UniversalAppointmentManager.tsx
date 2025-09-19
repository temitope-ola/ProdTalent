import React, { useState, useEffect } from 'react';
import useAuth from '../contexts/AuthContext';
import { useNotifications } from './NotificationManager';

interface UniversalAppointmentManagerProps {
  onClose: () => void;
}

const UniversalAppointmentManager: React.FC<UniversalAppointmentManagerProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [userTimeZone, setUserTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  console.log('🌍 UniversalAppointmentManager - Fuseau horaire détecté:', userTimeZone);

  useEffect(() => {
    if (user) {
      initializeGoogleCalendar();
    }
  }, [user]);

  const initializeGoogleCalendar = async () => {
    try {
      console.log('🚀 Initialisation Google Calendar...');
      const { googleCalendarGISService } = await import('../services/googleCalendarGISService');
      
      const initialized = await googleCalendarGISService.initializeGIS();
      if (initialized) {
        const authenticated = googleCalendarGISService.isUserAuthenticated();
        setIsGoogleAuthenticated(authenticated);
        console.log('📊 État authentification:', authenticated);
        
        if (authenticated) {
          await loadAppointments();
        }
      }
    } catch (error) {
      console.error('❌ Erreur initialisation Google Calendar:', error);
      showNotification('Erreur lors de l\'initialisation de Google Calendar', 'error');
    }
  };

  const handleGoogleAuth = async () => {
    try {
      console.log('🔑 Authentification Google Calendar...');
      const { googleCalendarGISService } = await import('../services/googleCalendarGISService');
      
      console.log('📦 Service chargé, version:', googleCalendarGISService.version);
      console.log('📝 Méthodes disponibles:', Object.getOwnPropertyNames(Object.getPrototypeOf(googleCalendarGISService)));
      
      const success = await googleCalendarGISService.authenticate();
      if (success) {
        setIsGoogleAuthenticated(true);
        await loadAppointments();
        showNotification('Connexion Google Calendar réussie !', 'success');
      } else {
        showNotification('Échec de l\'authentification Google Calendar', 'error');
      }
    } catch (error) {
      console.error('❌ Erreur authentification Google:', error);
      showNotification('Erreur lors de la connexion à Google Calendar', 'error');
    }
  };

  const loadAppointments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('📅 Chargement rendez-vous pour', selectedDate);
      const { googleCalendarGISService } = await import('../services/googleCalendarGISService');
      
      const startTime = selectedDate + 'T00:00:00';
      const endTime = selectedDate + 'T23:59:59';
      
      const events = await googleCalendarGISService.getEvents(startTime, endTime);
      setAppointments(events || []);
      
      console.log('📅 Rendez-vous chargés pour', selectedDate, ':', events?.length || 0);
    } catch (error) {
      console.error('❌ Erreur chargement rendez-vous:', error);
      showNotification('Erreur lors du chargement des rendez-vous', 'error');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeInUserZone = (dateTime: string, timeZone: string) => {
    try {
      const date = new Date(dateTime);
      return date.toLocaleTimeString('fr-FR', {
        timeZone: userTimeZone,
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateTime;
    }
  };

  const formatDateInUserZone = (dateTime: string) => {
    try {
      const date = new Date(dateTime);
      return date.toLocaleDateString('fr-FR', {
        timeZone: userTimeZone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateTime;
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
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '4px',
        padding: '24px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
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
          <h2 style={{ margin: 0, color: '#ffcc00' }}>
            🌍 Agenda Universel
          </h2>
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
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '14px', color: '#ffcc00' }}>
            🕐 Votre fuseau horaire : {userTimeZone}
          </span>
        </div>

        {!isGoogleAuthenticated ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3 style={{ color: '#f5f5f7', marginBottom: '16px' }}>
              Connexion à Google Calendar requise
            </h3>
            <p style={{ color: '#888', marginBottom: '24px' }}>
              Pour gérer votre agenda avec support des fuseaux horaires internationaux
            </p>
            <button
              onClick={handleGoogleAuth}
              style={{
                padding: '12px 24px',
                backgroundColor: '#4285f4',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              🔗 Connecter Google Calendar
            </button>
          </div>
        ) : (
          <>
            {/* Sélecteur de date */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px',
                color: '#f5f5f7'
              }}>
                Date :
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  loadAppointments();
                }}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  border: 'none',
                  borderRadius: '4px'
                }}
              />
            </div>

            {/* Liste des rendez-vous */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                Chargement...
              </div>
            ) : (
              <div>
                <h4 style={{ color: '#f5f5f7', marginBottom: '16px' }}>
                  Rendez-vous du {formatDateInUserZone(selectedDate + 'T12:00:00')}
                </h4>
                
                {appointments.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#888'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                    <p>Aucun rendez-vous ce jour</p>
                  </div>
                ) : (
                  <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                    {appointments.map((appointment, index) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: '#2a2a2a',
                          padding: '16px',
                          borderRadius: '4px',
                          marginBottom: '12px',
                          border: 'none'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '8px'
                        }}>
                          <h5 style={{ 
                            margin: 0, 
                            color: '#ffcc00',
                            fontSize: '16px'
                          }}>
                            {appointment.summary || 'Rendez-vous coaching'}
                          </h5>
                          <span style={{
                            backgroundColor: '#4caf50',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            Confirmé
                          </span>
                        </div>
                        
                        <div style={{ color: '#f5f5f7', marginBottom: '4px' }}>
                          🕐 {formatTimeInUserZone(appointment.start.dateTime, appointment.start.timeZone)} - 
                          {formatTimeInUserZone(appointment.end.dateTime, appointment.end.timeZone)}
                        </div>
                        
                        {appointment.description && (
                          <div style={{ color: '#888', fontSize: '14px' }}>
                            {appointment.description}
                          </div>
                        )}
                        
                        {appointment.attendees && appointment.attendees.length > 0 && (
                          <div style={{ marginTop: '8px' }}>
                            <span style={{ color: '#888', fontSize: '12px' }}>
                              Participants: {appointment.attendees.map((a: any) => a.email).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div style={{ 
              marginTop: '24px',
              textAlign: 'center'
            }}>
              <button
                onClick={() => {
                  const coachId = user?.id;
                  if (coachId) {
                    window.open(`/book/${coachId}`, '_blank');
                  }
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#ffcc00',
                  color: '#000',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginRight: '12px'
                }}
              >
                📅 Créer un nouveau rendez-vous
              </button>
              
              <button
                onClick={loadAppointments}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                🔄 Actualiser
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UniversalAppointmentManager;