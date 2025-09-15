import React, { useState, useEffect } from 'react';
import simpleGoogleService from '../services/simpleGoogleService';

export default function WorkingGoogleTest() {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({ isSignedIn: false, message: 'Non connecté' });

  useEffect(() => {
    // Vérifier le statut de connexion
    const checkStatus = () => {
      const status = simpleGoogleService.getConnectionStatus();
      setConnectionStatus(status);
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    setStatus('🔄 Connexion à Google...');
    
    try {
      const success = await simpleGoogleService.signIn();
      if (success) {
        setStatus('✅ Connexion Google réussie!');
        setConnectionStatus({ isSignedIn: true, message: 'Connecté à Google' });
      } else {
        setStatus('❌ Échec de la connexion Google');
      }
    } catch (error) {
      setStatus(`❌ Erreur: ${error}`);
    }
    
    setIsLoading(false);
  };

  const testEmail = async () => {
    setIsLoading(true);
    setStatus('📧 Test envoi email Gmail...');
    
    try {
      const success = await simpleGoogleService.sendEmail({
        to: 'test@example.com',
        subject: 'Test ProdTalent - Gmail Service',
        body: '<h1>Test réussi!</h1><p>Email envoyé via le nouveau service Google de ProdTalent.</p>'
      });
      
      setStatus(success 
        ? '✅ Email de test envoyé via Gmail!'
        : '❌ Échec envoi email Gmail'
      );
    } catch (error) {
      setStatus(`❌ Erreur email: ${error}`);
    }
    
    setIsLoading(false);
  };

  const testCalendar = async () => {
    setIsLoading(true);
    setStatus('📅 Test création événement Calendar...');
    
    try {
      // Événement demain à 14h
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0);
      
      const endTime = new Date(tomorrow);
      endTime.setHours(15, 0, 0, 0);

      const eventId = await simpleGoogleService.createCalendarEvent({
        summary: 'Test ProdTalent - Coaching',
        description: 'Test de création d\'événement depuis ProdTalent',
        startDateTime: tomorrow.toISOString(),
        endDateTime: endTime.toISOString(),
        attendeeEmail: 'test@example.com'
      });
      
      setStatus(eventId 
        ? `✅ Événement Calendar créé! ID: ${eventId}`
        : '❌ Échec création événement Calendar'
      );
    } catch (error) {
      setStatus(`❌ Erreur Calendar: ${error}`);
    }
    
    setIsLoading(false);
  };

  const testMessageNotification = async () => {
    setIsLoading(true);
    setStatus('🔔 Test notification message...');
    
    try {
      const success = await simpleGoogleService.sendMessageNotification({
        recipientEmail: 'test@example.com',
        recipientName: 'John Doe',
        senderName: 'Coach Martin',
        messagePreview: 'Ceci est un test de notification de message depuis ProdTalent.'
      });
      
      setStatus(success 
        ? '✅ Notification de message envoyée!'
        : '❌ Échec notification message'
      );
    } catch (error) {
      setStatus(`❌ Erreur notification: ${error}`);
    }
    
    setIsLoading(false);
  };

  const testRecommendation = async () => {
    setIsLoading(true);
    setStatus('🎯 Test notification recommandation...');
    
    try {
      const success = await simpleGoogleService.sendRecommendationNotification({
        recipientEmail: 'test@example.com',
        recipientName: 'Marie Dupont',
        coachName: 'Coach Pierre',
        message: 'Je recommande ce talent pour sa motivation et ses compétences techniques.',
        jobTitle: 'Développeur Frontend'
      });
      
      setStatus(success 
        ? '✅ Notification de recommandation envoyée!'
        : '❌ Échec notification recommandation'
      );
    } catch (error) {
      setStatus(`❌ Erreur recommandation: ${error}`);
    }
    
    setIsLoading(false);
  };

  const testCoachingAppointment = async () => {
    setIsLoading(true);
    setStatus('📅 Test rendez-vous coaching complet...');
    
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      
      const result = await simpleGoogleService.createCoachingAppointment({
        coachName: 'Coach Martin',
        talentName: 'Jean Dupont',
        talentEmail: 'test@example.com',
        date: dateStr,
        startTime: '15:00',
        duration: 60
      });
      
      setStatus(
        `${result.eventId ? '✅ Événement créé' : '❌ Échec événement'} | ` +
        `${result.emailSent ? '✅ Email envoyé' : '❌ Échec email'}`
      );
    } catch (error) {
      setStatus(`❌ Erreur coaching: ${error}`);
    }
    
    setIsLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#f5f5f7',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ color: '#ffcc00', textAlign: 'center', marginBottom: '32px' }}>
          🚀 Google Service qui fonctionne !
        </h1>

        {/* Statut de connexion */}
        <div style={{
          backgroundColor: '#111',
          padding: '24px',
          borderRadius: '8px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            {connectionStatus.isSignedIn ? '🟢' : '🔴'}
          </div>
          <h2 style={{ 
            color: connectionStatus.isSignedIn ? '#4CAF50' : '#f44336',
            marginBottom: '16px'
          }}>
            {connectionStatus.message}
          </h2>
          {!connectionStatus.isSignedIn && (
            <button
              onClick={handleConnect}
              disabled={isLoading}
              style={{
                backgroundColor: '#ffcc00',
                color: '#000',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {isLoading ? '⏳ Connexion...' : '🔑 Se connecter à Google'}
            </button>
          )}
        </div>

        {/* Tests */}
        {connectionStatus.isSignedIn && (
          <div style={{
            backgroundColor: '#111',
            padding: '24px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <h2 style={{ color: '#ffcc00', marginBottom: '24px' }}>
              🧪 Tests disponibles
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <button
                onClick={testEmail}
                disabled={isLoading}
                style={{
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  padding: '12px 16px',
                  border: '1px solid #555',
                  borderRadius: '6px',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                📧 Test Gmail Basic
              </button>
              
              <button
                onClick={testCalendar}
                disabled={isLoading}
                style={{
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  padding: '12px 16px',
                  border: '1px solid #555',
                  borderRadius: '6px',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                📅 Test Calendar Basic
              </button>
              
              <button
                onClick={testMessageNotification}
                disabled={isLoading}
                style={{
                  backgroundColor: '#4CAF50',
                  color: '#fff',
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                🔔 Test Notification Message
              </button>
              
              <button
                onClick={testRecommendation}
                disabled={isLoading}
                style={{
                  backgroundColor: '#4CAF50',
                  color: '#fff',
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                🎯 Test Notification Recommandation
              </button>
              
              <button
                onClick={testCoachingAppointment}
                disabled={isLoading}
                style={{
                  backgroundColor: '#FF9800',
                  color: '#fff',
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                📅 Test Rendez-vous Complet
              </button>
            </div>
          </div>
        )}

        {/* Console de résultats */}
        <div style={{
          backgroundColor: '#111',
          padding: '24px',
          borderRadius: '8px'
        }}>
          <h2 style={{ color: '#ffcc00', marginBottom: '16px' }}>
            📝 Console de test
          </h2>
          <div style={{
            backgroundColor: '#000',
            padding: '16px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '14px',
            minHeight: '100px',
            whiteSpace: 'pre-wrap'
          }}>
            {status || 'En attente de test...'}
          </div>
        </div>

        {/* Informations */}
        <div style={{
          backgroundColor: '#111',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '16px',
          fontSize: '12px'
        }}>
          <h3 style={{ color: '#61bfac', margin: '0 0 12px 0' }}>ℹ️ Informations</h3>
          <p style={{ margin: '4px 0' }}>✅ CLIENT_ID: configuré</p>
          <p style={{ margin: '4px 0' }}>✅ APIs: Gmail + Calendar</p>
          <p style={{ margin: '4px 0' }}>✅ Scopes: Send + Calendar</p>
          <p style={{ margin: '4px 0' }}>✅ Service: simpleGoogleService.ts</p>
        </div>
      </div>
    </div>
  );
}