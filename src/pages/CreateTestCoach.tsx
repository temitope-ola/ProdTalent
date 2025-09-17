import React, { useState } from 'react';
import { FirestoreService } from '../services/firestoreService';
import { AvailabilityService } from '../services/availabilityService';
import { TimezoneService } from '../services/timezoneService';

export default function CreateTestCoach() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const createCoachWithAvailability = async () => {
    setLoading(true);
    setMessage('');

    try {
      // 1. Créer le profil coach
      const coachData = {
        email: 'coach.newyork@prodtalent.test',
        displayName: 'Coach New York',
        role: 'coach' as const,
        bio: 'Coach spécialisé en développement de carrière - Basé à New York',
        skills: 'Coaching carrière, Entretiens, CV, Négociation salaire',
        timezone: 'America/New_York',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Générer un ID unique pour le coach
      const coachId = 'coach_ny_' + Date.now();

      await FirestoreService.createProfile(coachId, coachData, 'coach');
      setMessage(`✅ Coach créé avec l'ID: ${coachId}`);

      // 2. Ajouter des disponibilités pour les 7 prochains jours
      const today = new Date();
      const dates = [];
      for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }

      // Créneaux en heure de New York (EDT/EST)
      const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

      for (const date of dates) {
        await AvailabilityService.saveAvailabilityWithTimezone(coachId, date, timeSlots, 'America/New_York');

        // Afficher la conversion pour info
        const convertedTimes = timeSlots.map(time => {
          const zurichTime = TimezoneService.convertTime(time, date, 'America/New_York', 'Europe/Zurich');
          return `${time} NY → ${zurichTime} Zurich`;
        });

        console.log(`📅 ${date}: ${convertedTimes.join(', ')}`);
      }

      setMessage(prev => prev + `\n✅ Disponibilités ajoutées pour 7 jours (New York timezone)`);
      setMessage(prev => prev + `\n\n🕐 Les créneaux sont en heure de New York:`);
      setMessage(prev => prev + `\n09:00 NY = 15:00 Zurich`);
      setMessage(prev => prev + `\n10:00 NY = 16:00 Zurich`);
      setMessage(prev => prev + `\n11:00 NY = 17:00 Zurich`);
      setMessage(prev => prev + `\netc...`);

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
      <h1>🧪 Créer un Coach de Test</h1>

      <div style={{
        backgroundColor: '#1a1a1a',
        padding: '20px',
        borderRadius: '4px',
        marginBottom: '20px'
      }}>
        <h2>Coach à créer:</h2>
        <ul>
          <li><strong>Nom:</strong> Coach New York</li>
          <li><strong>Email:</strong> coach.newyork@prodtalent.test</li>
          <li><strong>Timezone:</strong> America/New_York (UTC-5/-4)</li>
          <li><strong>Disponibilités:</strong> 7 prochains jours</li>
          <li><strong>Créneaux:</strong> 09:00-16:00 (heure de New York)</li>
        </ul>
      </div>

      <button
        onClick={createCoachWithAvailability}
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
        {loading ? '⏳ Création en cours...' : '🚀 Créer le coach + disponibilités'}
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
        <h3>ℹ️ Test de timezone</h3>
        <p>Ce coach permettra de tester:</p>
        <ul>
          <li>✅ Conversion d'heures New York → Zurich</li>
          <li>✅ Affichage correct dans l'agenda talent</li>
          <li>✅ Emails avec heure locale du destinataire</li>
          <li>✅ Cohérence entre interface et confirmations</li>
        </ul>

        <div style={{ marginTop: '15px', fontSize: '14px', color: '#888' }}>
          <strong>Exemple de conversion:</strong><br/>
          10:00 New York (coach) = 16:00 Zurich (talent)
        </div>
      </div>
    </div>
  );
}