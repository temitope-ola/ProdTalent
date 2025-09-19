import React, { useState } from 'react';

export default function SimpleGoogleTest() {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testGoogleAPI = async () => {
    setIsLoading(true);
    setStatus('Chargement Google API...');
    
    try {
      // Méthode simple avec script direct
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = async () => {
        setStatus('Google API chargé');
        
        await new Promise<void>((resolve) => {
          (window as any).gapi.load('auth2', () => {
            setStatus('Auth2 chargé');
            resolve();
          });
        });
        
        try {
          await (window as any).gapi.auth2.init({
            client_id: '939426446725-cgmd8eudsqmkccv94u2hsrj3idlb7fps.apps.googleusercontent.com'
          });
          
          setStatus('Auth2 initialisé avec succès!');
          
          const authInstance = (window as any).gapi.auth2.getAuthInstance();
          const user = await authInstance.signIn({
            scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.send'
          });
          
          setStatus('Connexion Google réussie! Token: ' + user.getAuthResponse().access_token.substring(0, 20) + '...');
          
        } catch (error) {
          setStatus('Erreur Auth2: ' + (error as Error).message);
        }
      };
      
      script.onerror = () => {
        setStatus('❌ Impossible de charger Google API');
      };
      
      document.head.appendChild(script);
      
    } catch (error) {
      setStatus('❌ Erreur: ' + (error as Error).message);
    }
    
    setIsLoading(false);
  };

  const testExistingCalendar = async () => {
    setIsLoading(true);
    setStatus('Test du service Calendar existant...');
    
    try {
      // Utiliser le service existant
      const { GoogleCalendarGISService } = await import('../services/googleCalendarGISService');
      const service = new (GoogleCalendarGISService as any)();
      
      const initialized = await service.initializeGIS();
      
      if (initialized) {
        setStatus('Service Calendar existant fonctionne!');
        
        // Tenter de créer un événement test
        const event = await service.createEvent({
          summary: 'Test ProdTalent',
          description: 'Test de création d\'événement',
          start: {
            dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            timeZone: 'Europe/Paris'
          },
          end: {
            dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
            timeZone: 'Europe/Paris'
          },
          attendees: [{ email: 'test@example.com' }]
        });
        
        setStatus('Événement créé: ' + event?.id || 'Succès');
      } else {
        setStatus('❌ Impossible d\'initialiser le service Calendar');
      }
    } catch (error) {
      setStatus('❌ Erreur service Calendar: ' + (error as Error).message);
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
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ color: '#ffcc00', textAlign: 'center' }}>
          Test Google Simple
        </h1>
        
        <div style={{
          backgroundColor: '#111',
          padding: '24px',
          borderRadius: '4px',
          marginBottom: '24px'
        }}>
          <h2 style={{ color: '#ffcc00', marginBottom: '16px' }}>
            Tests disponibles
          </h2>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button
              onClick={testGoogleAPI}
              disabled={isLoading}
              style={{
                backgroundColor: '#ffcc00',
                color: '#000',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              Test API Google
            </button>
            
            <button
              onClick={testExistingCalendar}
              disabled={isLoading}
              style={{
                backgroundColor: '#333',
                color: '#f5f5f7',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              Test Calendar Existant
            </button>
          </div>
          
          <div style={{
            backgroundColor: '#000',
            padding: '16px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '12px',
            minHeight: '100px'
          }}>
            {status || 'Cliquez sur un bouton pour tester...'}
          </div>
        </div>
        
        <div style={{
          backgroundColor: '#111',
          padding: '16px',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          <h3 style={{ color: '#61bfac', margin: '0 0 12px 0' }}>Informations</h3>
          <p style={{ margin: '4px 0' }}>CLIENT_ID configuré: Oui</p>
          <p style={{ margin: '4px 0' }}>Domaine autorisé: 127.0.0.1:5173</p>
          <p style={{ margin: '4px 0' }}>Scopes: Calendar + Gmail</p>
        </div>
      </div>
    </div>
  );
}