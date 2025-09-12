import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleCalendarGISService } from '../services/googleCalendarGISService';

const GoogleCalendarCallbackPage: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Traitement de l\'authentification Google...');
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const fragment = new URLSearchParams(window.location.hash.substring(1));
        
        console.log('🔍 Callback - URL params:', Object.fromEntries(urlParams));
        console.log('🔍 Callback - Fragment params:', Object.fromEntries(fragment));
        
        // Vérifier les paramètres dans l'URL et le fragment
        let accessToken = urlParams.get('access_token') || fragment.get('access_token');
        let expiresIn = urlParams.get('expires_in') || fragment.get('expires_in');
        let error = urlParams.get('error') || fragment.get('error');
        let state = urlParams.get('state') || fragment.get('state');
        
        // Vérifier l'état OAuth pour la sécurité
        const savedState = sessionStorage.getItem('oauth_state');
        if (state && savedState && state !== savedState) {
          setStatus('error');
          setMessage('Erreur de sécurité: état OAuth invalide');
          setTimeout(() => navigate('/dashboard'), 3000);
          return;
        }
        
        if (error) {
          console.error('❌ Erreur OAuth:', error);
          setStatus('error');
          setMessage(`Erreur d'authentification: ${error}`);
          setTimeout(() => navigate('/dashboard'), 3000);
          return;
        }
        
        if (accessToken) {
          console.log('✅ Token reçu avec succès');
          
          // Stocker le token
          const expiryTime = Date.now() + (expiresIn ? parseInt(expiresIn) * 1000 : 3600000);
          localStorage.setItem('google_calendar_token', accessToken);
          localStorage.setItem('google_calendar_token_expiry', expiryTime.toString());
          
          // Nettoyer l'état OAuth
          sessionStorage.removeItem('oauth_state');
          
          // Initialiser le service GAPI si nécessaire
          await googleCalendarGISService.initializeGIS();
          
          // Configurer le token
          if (window.gapi && window.gapi.client) {
            window.gapi.client.setToken({ access_token: accessToken });
          }
          
          setStatus('success');
          setMessage('Authentification Google Calendar réussie ! Redirection en cours...');
          
          // Rediriger vers la page d'origine
          setTimeout(() => {
            const returnUrl = sessionStorage.getItem('google_auth_return_url') || '/dashboard';
            sessionStorage.removeItem('google_auth_return_url');
            window.location.replace(returnUrl);
          }, 2000);
        } else {
          console.warn('⚠️ Aucun token trouvé');
          setStatus('error');
          setMessage('Aucun token d\'accès trouvé dans la réponse');
          setTimeout(() => navigate('/dashboard'), 3000);
        }
      } catch (error) {
        console.error('❌ Erreur lors du traitement du callback:', error);
        setStatus('error');
        setMessage('Erreur lors du traitement de l\'authentification');
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'processing' && (
            <div className="space-y-4">
              <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <h2 className="text-xl font-semibold text-gray-800">Authentification en cours</h2>
              <p className="text-gray-600">{message}</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="space-y-4">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-green-800">Authentification réussie !</h2>
              <p className="text-gray-600">{message}</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-red-800">Erreur d'authentification</h2>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500">Redirection automatique dans quelques secondes...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleCalendarCallbackPage;