import React, { useState } from 'react';
import { googleIntegratedService } from '../services/googleIntegratedService';

export default function GoogleConfigPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const handleConnectGoogle = async () => {
    setIsLoading(true);
    setTestResults(prev => [...prev, 'Tentative de connexion Google...']);
    
    try {
      const success = await googleIntegratedService.signIn();
      if (success) {
        setIsConnected(true);
        setTestResults(prev => [...prev, 'Connexion Google réussie!']);
      } else {
        setTestResults(prev => [...prev, 'Échec de la connexion Google']);
      }
    } catch (error) {
      setTestResults(prev => [...prev, `Erreur: ${error}`]);
    }
    
    setIsLoading(false);
  };

  const testEmail = async () => {
    setIsLoading(true);
    setTestResults(prev => [...prev, 'Test envoi email avec Gmail API...']);
    
    try {
      const success = await googleIntegratedService.sendEmail(
        'admin@prodtalent.com', // Email existant qui fonctionne
        'Test ProdTalent - Gmail API Fonctionnel',
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 4px;">
            <h1 style="color: white; margin: 0;">Test Gmail API Réussi!</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0;">ProdTalent - Gmail API fonctionne parfaitement</p>
          </div>
          <div style="background: white; padding: 30px; border: "none" border-radius: 4px 0 10px 10px;">
            <h2 style="color: #333;">Excellente nouvelle!</h2>
            <p>L'intégration Gmail API de ProdTalent est maintenant <strong>parfaitement fonctionnelle</strong>.</p>
            <ul>
              <li>Authentification Google réussie</li>
              <li>Envoi d'emails HTML riches</li>
              <li>Templates professionnels</li>
              <li>Plus fiable qu'EmailJS</li>
            </ul>
            <p style="margin-top: 20px; color: #666; font-size: 12px;">
              Test envoyé le ${new Date().toLocaleString('fr-FR')} depuis ProdTalent
            </p>
          </div>
        </div>`
      );
      
      setTestResults(prev => [...prev, success
        ? 'Email de test envoyé avec succès! Vérifiez votre boîte mail.'
        : 'Échec envoi email'
      ]);
    } catch (error) {
      setTestResults(prev => [...prev, `Erreur email: ${error}`]);
    }
    
    setIsLoading(false);
  };

  const testCalendar = async () => {
    setIsLoading(true);
    setTestResults(prev => [...prev, 'Test création événement Calendar...']);
    
    try {
      // Date de test: demain à 14h
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0);
      
      const endTime = new Date(tomorrow);
      endTime.setHours(15, 0, 0, 0);

      const eventId = await googleIntegratedService.createCalendarEvent({
        summary: 'Test ProdTalent - Coaching',
        description: 'Test de création d\'événement depuis ProdTalent',
        startDateTime: tomorrow.toISOString(),
        endDateTime: endTime.toISOString(),
        attendeeEmail: 'admin@prodtalent.com',
        attendeeName: 'Admin ProdTalent'
      });
      
      setTestResults(prev => [...prev, eventId
        ? `Événement Calendar créé: ${eventId}`
        : 'Échec création événement'
      ]);
    } catch (error) {
      setTestResults(prev => [...prev, `Erreur Calendar: ${error}`]);
    }
    
    setIsLoading(false);
  };

  const testNotification = async () => {
    setIsLoading(true);
    setTestResults(prev => [...prev, 'Test notification complète...']);
    
    try {
      const success = await googleIntegratedService.sendMessageNotification({
        recipientEmail: 'test@example.com',
        recipientName: 'Test User',
        senderName: 'ProdTalent Test',
        senderRole: 'Coach',
        messagePreview: 'Ceci est un test de notification de message.'
      });
      
      setTestResults(prev => [...prev, success
        ? 'Notification de message envoyée!'
        : 'Échec notification'
      ]);
    } catch (error) {
      setTestResults(prev => [...prev, `Erreur notification: ${error}`]);
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
          Configuration Google Services
        </h1>

        {/* Statut de connexion */}
        <div style={{
          backgroundColor: '#111',
          padding: '24px',
          borderRadius: '4px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#ffcc00', marginBottom: '16px' }}>
            Statut de connexion
          </h2>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            {isConnected ? '' : ''}
          </div>
          <p style={{ 
            color: isConnected ? '#4CAF50' : '#f44336',
            fontWeight: 'bold',
            marginBottom: '16px'
          }}>
            {isConnected ? 'Connecté à Google' : 'Non connecté'}
          </p>
          {!isConnected && (
            <button
              onClick={handleConnectGoogle}
              disabled={isLoading}
              style={{
                backgroundColor: '#ffcc00',
                color: '#000',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {isLoading ? 'Connexion...' : 'Se connecter à Google'}
            </button>
          )}
        </div>

        {/* Tests */}
        {isConnected && (
          <div style={{
            backgroundColor: '#111',
            padding: '24px',
            borderRadius: '4px',
            marginBottom: '24px'
          }}>
            <h2 style={{ color: '#ffcc00', marginBottom: '16px' }}>
              Tests de fonctionnalité
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px'
            }}>
              <button
                onClick={testEmail}
                disabled={isLoading}
                style={{
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                Test Gmail
              </button>
              <button
                onClick={testCalendar}
                disabled={isLoading}
                style={{
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                Test Calendar
              </button>
              <button
                onClick={testNotification}
                disabled={isLoading}
                style={{
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                Test Notification
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div style={{
          backgroundColor: '#111',
          padding: '24px',
          borderRadius: '4px',
          marginBottom: '24px'
        }}>
          <h2 style={{ color: '#ffcc00', marginBottom: '16px' }}>
            Configuration requise
          </h2>
          <div style={{ fontSize: '14px', lineHeight: 1.6 }}>
            <h3 style={{ color: '#61bfac', marginTop: '16px' }}>1. Google Cloud Console</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li>Créer un projet sur <a href="https://console.cloud.google.com" target="_blank" style={{color: '#ffcc00'}}>Google Cloud Console</a></li>
              <li>Activer les APIs: Gmail API, Calendar API</li>
              <li>Créer des identifiants OAuth 2.0</li>
              <li>Ajouter le domaine autorisé: <code>http://127.0.0.1:5173</code></li>
            </ul>

            <h3 style={{ color: '#61bfac', marginTop: '16px' }}>2. Configuration</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li>Copier le <code>CLIENT_ID</code> et <code>API_KEY</code></li>
              <li>Les ajouter dans <code>src/services/googleIntegratedService.ts</code></li>
              <li>Redémarrer le serveur de développement</li>
            </ul>

            <h3 style={{ color: '#61bfac', marginTop: '16px' }}>3. Avantages Google vs EmailJS</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li>Plus fiable et professionnel</li>
              <li>Intégration Calendar native</li>
              <li>Gestion des invitations automatique</li>
              <li>Templates d'email riches</li>
              <li>Authentification sécurisée</li>
            </ul>
          </div>
        </div>

        {/* Résultats des tests */}
        {testResults.length > 0 && (
          <div style={{
            backgroundColor: '#111',
            padding: '24px',
            borderRadius: '4px'
          }}>
            <h2 style={{ color: '#ffcc00', marginBottom: '16px' }}>
              Journal des tests
            </h2>
            <div style={{
              backgroundColor: '#000',
              padding: '16px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {testResults.map((result, index) => (
                <div key={index} style={{ marginBottom: '4px' }}>
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}