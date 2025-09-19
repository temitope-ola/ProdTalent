import React, { useState, useEffect } from 'react';
import googleCalendarMeetService from '../services/googleCalendarMeetService';

export default function CalendarMeetTest() {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({ 
    isSignedIn: false, 
    isInitialized: false,
    message: 'Non initialisé'
  });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [lastCreatedEvent, setLastCreatedEvent] = useState<any>(null);

  // État pour le formulaire de test
  const [formData, setFormData] = useState({
    coachName: 'Coach Martin',
    coachEmail: 'coach@prodtalent.com',
    talentName: 'Jean Dupont', 
    talentEmail: 'talent@prodtalent.com',
    date: '',
    startTime: '14:00',
    endTime: '15:00',
    description: 'Session de coaching ProdTalent avec Google Meet automatique'
  });

  useEffect(() => {
    // Définir la date par défaut (demain)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData(prev => ({
      ...prev,
      date: tomorrow.toISOString().split('T')[0]
    }));

    // Vérifier le statut de connexion
    const checkStatus = () => {
      const status = googleCalendarMeetService.getConnectionStatus();
      setConnectionStatus(status);
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    setStatus('🔄 Connexion à Google Calendar...');
    
    try {
      const success = await googleCalendarMeetService.signIn();
      if (success) {
        setStatus('✅ Connexion Google Calendar réussie!');
        loadUpcomingAppointments();
      } else {
        setStatus('❌ Échec de la connexion Google Calendar');
      }
    } catch (error) {
      setStatus(`❌ Erreur: ${error}`);
    }
    
    setIsLoading(false);
  };

  const loadUpcomingAppointments = async () => {
    try {
      const upcoming = await googleCalendarMeetService.getUpcomingAppointments();
      setAppointments(upcoming);
      console.log('📅 Rendez-vous à venir:', upcoming);
    } catch (error) {
      console.error('❌ Erreur chargement rendez-vous:', error);
    }
  };

  const testQuickCalendar = async () => {
    setIsLoading(true);
    setStatus('📅 Test création événement rapide...');
    
    try {
      const success = await googleCalendarMeetService.testCalendar();
      setStatus(success 
        ? '✅ Événement de test créé avec Google Meet!'
        : '❌ Échec création événement de test'
      );
      
      if (success) {
        loadUpcomingAppointments();
      }
    } catch (error) {
      setStatus(`❌ Erreur test: ${error}`);
    }
    
    setIsLoading(false);
  };

  const createCustomAppointment = async () => {
    setIsLoading(true);
    setStatus('📅 Création rendez-vous personnalisé...');
    
    try {
      const result = await googleCalendarMeetService.createAppointmentWithMeet(formData);
      
      if (result.success) {
        setLastCreatedEvent(result);
        setStatus(`✅ Rendez-vous créé avec succès!
Event ID: ${result.eventId}
Meet Link: ${result.meetLink ? 'Généré ✅' : 'Non généré ❌'}
Calendar Link: ${result.calendarLink ? 'Disponible ✅' : 'Non disponible ❌'}`);
        loadUpcomingAppointments();
      } else {
        setStatus(`❌ Échec création rendez-vous: ${result.error}`);
      }
    } catch (error) {
      setStatus(`❌ Erreur: ${error}`);
    }
    
    setIsLoading(false);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#f5f5f7',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ color: '#ffcc00', textAlign: 'center', marginBottom: '32px' }}>
          📅 Google Calendar + Meet Test
        </h1>

        {/* Statut de connexion */}
        <div style={{
          backgroundColor: '#111',
          padding: '24px',
          borderRadius: '4px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            {connectionStatus.isSignedIn ? '🟢' : '🔴'}
          </div>
          <h2 style={{ 
            color: connectionStatus.isSignedIn ? '#4CAF50' : '#f44336',
            marginBottom: '8px'
          }}>
            {connectionStatus.message}
          </h2>
          <p style={{ color: '#888', fontSize: '14px', margin: '8px 0' }}>
            Initialisé: {connectionStatus.isInitialized ? '✅' : '❌'} | 
            Connecté: {connectionStatus.isSignedIn ? '✅' : '❌'}
          </p>
          {!connectionStatus.isSignedIn && (
            <button
              onClick={handleConnect}
              disabled={isLoading}
              style={{
                backgroundColor: '#ffcc00',
                color: '#000',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                marginTop: '16px'
              }}
            >
              {isLoading ? '⏳ Connexion...' : '🔑 Se connecter à Google Calendar'}
            </button>
          )}
        </div>

        {/* Tests rapides */}
        {connectionStatus.isSignedIn && (
          <div style={{
            backgroundColor: '#111',
            padding: '24px',
            borderRadius: '4px',
            marginBottom: '24px'
          }}>
            <h2 style={{ color: '#ffcc00', marginBottom: '16px' }}>
              🧪 Tests rapides
            </h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={testQuickCalendar}
                disabled={isLoading}
                style={{
                  backgroundColor: '#4CAF50',
                  color: '#fff',
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                ⚡ Test Rapide
              </button>
              
              <button
                onClick={loadUpcomingAppointments}
                disabled={isLoading}
                style={{
                  backgroundColor: '#2196F3',
                  color: '#fff',
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                🔄 Recharger Rendez-vous
              </button>
            </div>
          </div>
        )}

        {/* Formulaire de création personnalisé */}
        {connectionStatus.isSignedIn && (
          <div style={{
            backgroundColor: '#111',
            padding: '24px',
            borderRadius: '4px',
            marginBottom: '24px'
          }}>
            <h2 style={{ color: '#ffcc00', marginBottom: '20px' }}>
              📝 Créer un rendez-vous personnalisé
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                  👨‍🏫 Nom du coach:
                </label>
                <input
                  type="text"
                  value={formData.coachName}
                  onChange={(e) => handleFormChange('coachName', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#222',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                  📧 Email du coach:
                </label>
                <input
                  type="email"
                  value={formData.coachEmail}
                  onChange={(e) => handleFormChange('coachEmail', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#222',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                  👤 Nom du talent:
                </label>
                <input
                  type="text"
                  value={formData.talentName}
                  onChange={(e) => handleFormChange('talentName', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#222',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                  📧 Email du talent:
                </label>
                <input
                  type="email"
                  value={formData.talentEmail}
                  onChange={(e) => handleFormChange('talentEmail', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#222',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                  📅 Date:
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleFormChange('date', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#222',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                  🕐 Heure de début:
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleFormChange('startTime', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#222',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                  🕐 Heure de fin:
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleFormChange('endTime', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#222',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                📝 Description:
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#222',
                  color: '#f5f5f7',
                  border: 'none',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <button
              onClick={createCustomAppointment}
              disabled={isLoading || !formData.coachEmail || !formData.talentEmail}
              style={{
                backgroundColor: '#FF9800',
                color: '#fff',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading || !formData.coachEmail || !formData.talentEmail ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {isLoading ? '⏳ Création...' : '🎥 Créer Rendez-vous + Meet'}
            </button>
          </div>
        )}

        {/* Dernier événement créé */}
        {lastCreatedEvent && (
          <div style={{
            backgroundColor: '#1a4d3a',
            border: 'none',
            padding: '20px',
            borderRadius: '4px',
            marginBottom: '24px'
          }}>
            <h3 style={{ color: '#4CAF50', margin: '0 0 16px 0' }}>
              🎉 Dernier rendez-vous créé
            </h3>
            <div style={{ fontSize: '14px' }}>
              <p><strong>Event ID:</strong> {lastCreatedEvent.eventId}</p>
              {lastCreatedEvent.meetLink && (
                <p><strong>🎥 Google Meet:</strong> 
                  <a href={lastCreatedEvent.meetLink} target="_blank" style={{color: '#4CAF50', marginLeft: '8px'}}>
                    Rejoindre la réunion
                  </a>
                </p>
              )}
              {lastCreatedEvent.calendarLink && (
                <p><strong>📅 Calendrier:</strong> 
                  <a href={lastCreatedEvent.calendarLink} target="_blank" style={{color: '#4CAF50', marginLeft: '8px'}}>
                    Voir dans Google Calendar
                  </a>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Liste des rendez-vous */}
        {appointments.length > 0 && (
          <div style={{
            backgroundColor: '#111',
            padding: '24px',
            borderRadius: '4px',
            marginBottom: '24px'
          }}>
            <h3 style={{ color: '#ffcc00', marginBottom: '16px' }}>
              📋 Rendez-vous à venir ({appointments.length})
            </h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {appointments.map((apt, index) => (
                <div key={apt.id || index} style={{
                  backgroundColor: '#222',
                  padding: '12px',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  fontSize: '14px'
                }}>
                  <strong>{apt.summary}</strong>
                  <br />
                  <span style={{ color: '#888' }}>
                    {apt.start?.dateTime ? new Date(apt.start.dateTime).toLocaleString('fr-FR') : 'Date non définie'}
                  </span>
                  {apt.hangoutLink && (
                    <span style={{ marginLeft: '8px' }}>
                      <a href={apt.hangoutLink} target="_blank" style={{color: '#4CAF50'}}>
                        🎥 Meet
                      </a>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Console de résultats */}
        <div style={{
          backgroundColor: '#111',
          padding: '24px',
          borderRadius: '4px'
        }}>
          <h2 style={{ color: '#ffcc00', marginBottom: '16px' }}>
            📝 Console de test
          </h2>
          <div style={{
            backgroundColor: '#000',
            padding: '16px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '12px',
            minHeight: '120px',
            whiteSpace: 'pre-wrap'
          }}>
            {status || 'En attente de test...'}
          </div>
        </div>
      </div>
    </div>
  );
}