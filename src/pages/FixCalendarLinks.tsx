import React, { useState } from 'react';
import { CalendarLinkService } from '../services/calendarLinkService';

export default function FixCalendarLinks() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fixCalendarLinks = async () => {
    setLoading(true);
    setMessage('🔧 Correction des liens calendar en cours...');

    try {
      await CalendarLinkService.fixMissingCalendarLinks();
      setMessage('✅ Tous les liens calendar manquants ont été corrigés !');
    } catch (error) {
      console.error('Erreur:', error);
      setMessage(`❌ Erreur: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#111',
      color: '#f5f5f7',
      minHeight: '100vh',
      fontFamily: 'system-ui'
    }}>
      <h1>🔧 Corriger les liens Google Calendar</h1>

      <div style={{
        backgroundColor: '#1a1a1a',
        padding: '20px',
        borderRadius: '4px',
        marginBottom: '20px'
      }}>
        <h2>Problème détecté:</h2>
        <p>Certains rendez-vous confirmés n'ont pas de lien Google Calendar, ce qui empêche l'affichage du bouton "📅 Voir dans Google Calendar".</p>

        <h3>Cette correction va:</h3>
        <ul>
          <li>✅ Identifier tous les rendez-vous confirmés sans lien calendar</li>
          <li>✅ Générer des liens Google Calendar manuels pour chacun</li>
          <li>✅ Mettre à jour la base de données</li>
          <li>✅ Permettre aux utilisateurs de voir le bouton "Voir dans agenda"</li>
        </ul>
      </div>

      <button
        onClick={fixCalendarLinks}
        disabled={loading}
        style={{
          padding: '12px 24px',
          backgroundColor: loading ? '#666' : '#0066cc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? '⏳ Correction en cours...' : '🚀 Corriger tous les liens calendar'}
      </button>

      {message && (
        <div style={{
          padding: '15px',
          backgroundColor: message.includes('❌') ? '#660000' : '#006600',
          borderRadius: '4px',
          whiteSpace: 'pre-line',
          fontFamily: 'monospace'
        }}>
          {message}
        </div>
      )}

      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#1a1a1a',
        borderRadius: '4px'
      }}>
        <h3>ℹ️ Comment ça fonctionne</h3>
        <p>Les liens générés sont des URLs Google Calendar standard qui permettent aux utilisateurs d'ajouter automatiquement le rendez-vous à leur agenda personnel.</p>

        <div style={{ marginTop: '15px', fontSize: '14px', color: '#888' }}>
          <strong>Exemple de lien généré:</strong><br/>
          https://calendar.google.com/calendar/render?action=TEMPLATE&text=Session%20de%20coaching...
        </div>
      </div>
    </div>
  );
}