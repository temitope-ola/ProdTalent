import React, { useState, useCallback } from 'react';
import useAuth from '../contexts/AuthContext';

interface SimpleCalendarManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SimpleCalendarManager: React.FC<SimpleCalendarManagerProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Générer l'URL de réservation pour ce coach
  const bookingUrl = `${window.location.origin}/book/${user?.id}`;

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      // Fallback pour les navigateurs plus anciens
      const textArea = document.createElement('textarea');
      textArea.value = bookingUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [bookingUrl]);

  const openGoogleCalendar = () => {
    window.open('https://calendar.google.com', '_blank');
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        padding: '40px',
        borderRadius: '4px',
        border: '1px solid #333',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#ffcc00', margin: 0, fontSize: '24px' }}>
            📅 Mon Agenda de Coaching
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              color: '#f5f5f7',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Instructions principales */}
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '20px',
          borderRadius: '4px',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#61bfac', margin: '0 0 16px 0', fontSize: '18px' }}>
            🎯 Comment ça marche
          </h3>
          <ol style={{ color: '#f5f5f7', margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
            <li>Créez vos créneaux <strong>"DISPONIBLE - Coaching"</strong> dans Google Calendar</li>
            <li>Partagez votre lien de réservation avec vos talents</li>
            <li>Ils réservent directement et ça met à jour votre agenda automatiquement</li>
            <li>Vous recevez une notification pour chaque réservation</li>
          </ol>
        </div>

        {/* Gestion Google Calendar */}
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '20px',
          borderRadius: '4px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#4285f4', margin: '0 0 16px 0' }}>
            📝 Gérer mes disponibilités
          </h3>
          <p style={{ color: '#ccc', marginBottom: '20px', fontSize: '14px' }}>
            Cliquez pour ouvrir Google Calendar et créer vos créneaux disponibles
          </p>
          <button
            onClick={openGoogleCalendar}
            style={{
              padding: '12px 24px',
              backgroundColor: '#4285f4',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'background-color 0.2s'
            }}
          >
            🚀 Ouvrir Google Calendar
          </button>
        </div>

        {/* Lien de partage */}
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '20px',
          borderRadius: '4px',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#ffcc00', margin: '0 0 16px 0' }}>
            🔗 Votre lien de réservation
          </h3>
          <p style={{ color: '#ccc', marginBottom: '16px', fontSize: '14px' }}>
            Partagez ce lien avec vos talents pour qu'ils puissent réserver directement :
          </p>
          
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <input
              type="text"
              value={bookingUrl}
              readOnly
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#333',
                color: '#f5f5f7',
                border: '1px solid #555',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <button
              onClick={copyToClipboard}
              style={{
                padding: '10px 16px',
                backgroundColor: copied ? '#61bfac' : '#ffcc00',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                minWidth: '80px'
              }}
            >
              {copied ? '✅ Copié!' : '📋 Copier'}
            </button>
          </div>

          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '12px',
            borderRadius: '4px',
            borderLeft: '4px solid #ffcc00'
          }}>
            <p style={{ color: '#f5f5f7', margin: 0, fontSize: '14px' }}>
              💡 <strong>Astuce :</strong> Envoyez ce lien par email, WhatsApp ou ajoutez-le à votre signature !
            </p>
          </div>
        </div>

        {/* Instructions détaillées */}
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '20px',
          borderRadius: '4px'
        }}>
          <h3 style={{ color: '#61bfac', margin: '0 0 16px 0' }}>
            📋 Instructions détaillées
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#f5f5f7', margin: '0 0 8px 0', fontSize: '16px' }}>
              🟢 Créer vos créneaux disponibles :
            </h4>
            <ul style={{ color: '#ccc', margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.5' }}>
              <li>Allez dans Google Calendar</li>
              <li>Créez des événements récurrents avec le titre : <code style={{backgroundColor: '#333', padding: '2px 4px', borderRadius: '4px'}}>"DISPONIBLE - Coaching"</code></li>
              <li>Exemple : Lundi 9h-10h, Mercredi 14h-15h, etc.</li>
              <li>Définissez la récurrence (chaque semaine, chaque mois...)</li>
            </ul>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#f5f5f7', margin: '0 0 8px 0', fontSize: '16px' }}>
              🎯 Quand un talent réserve :
            </h4>
            <ul style={{ color: '#ccc', margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.5' }}>
              <li>Le créneau "DISPONIBLE" devient "Coaching avec [Nom du talent]"</li>
              <li>Vous recevez un email de notification</li>
              <li>Le talent reçoit une confirmation avec le lien Google Meet</li>
              <li>Des rappels sont envoyés automatiquement</li>
            </ul>
          </div>

          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '12px',
            borderRadius: '4px',
            borderLeft: '4px solid #61bfac'
          }}>
            <p style={{ color: '#f5f5f7', margin: 0, fontSize: '14px' }}>
              ✨ <strong>Avantage :</strong> Tout se passe dans Google Calendar que vous utilisez déjà. 
              Aucune nouvelle app à apprendre !
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '30px',
          textAlign: 'center',
          paddingTop: '20px',
          borderTop: '1px solid #333'
        }}>
          <p style={{ color: '#888', margin: 0, fontSize: '12px' }}>
            🚀 Système de réservation propulsé par Google Calendar
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleCalendarManager;