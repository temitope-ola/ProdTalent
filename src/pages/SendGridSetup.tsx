import React, { useState } from 'react';
import sendGridService from '../services/sendGridService';

export default function SendGridSetup() {
  const [apiKey, setApiKey] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const saveApiKey = () => {
    // En production, ceci sera dans les variables d'environnement
    localStorage.setItem('SENDGRID_API_KEY', apiKey);
    setStatus('✅ Clé API sauvegardée localement');
  };

  const testSendGrid = async () => {
    setIsLoading(true);
    setStatus('🔄 Test de SendGrid...');
    
    try {
      // Utiliser l'email de test comme expéditeur (doit être vérifié dans SendGrid)
      const success = await sendGridService.sendEmail({
        to: testEmail,
        from: testEmail, // Utiliser l'email de test comme expéditeur
        subject: 'Test ProdTalent - Configuration SendGrid',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: #ffcc00; padding: 30px; text-align: center;">
              <h1 style="color: #000; margin: 0;">🎉 ProdTalent</h1>
            </div>
            <div style="background: #fff; padding: 30px;">
              <h2 style="color: #333;">Test de configuration réussi !</h2>
              <p>Si vous recevez cet email, SendGrid est correctement configuré pour ProdTalent.</p>
              <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="color: #155724; margin: 0;">
                  ✅ <strong>SendGrid fonctionne parfaitement !</strong><br>
                  Vous pouvez maintenant envoyer des emails fiables depuis votre application.
                </p>
              </div>
              <p>Prochaines étapes : Configuration de Google Calendar + Meet pour les rendez-vous.</p>
            </div>
          </div>
        `
      });
      
      setStatus(success 
        ? '✅ Email de test envoyé avec succès via SendGrid!'
        : '❌ Échec envoi email - Vérifiez votre clé API'
      );
    } catch (error) {
      setStatus(`❌ Erreur: ${error}`);
    }
    
    setIsLoading(false);
  };

  const testMessageNotification = async () => {
    setIsLoading(true);
    setStatus('🔄 Test notification message...');
    
    try {
      const success = await sendGridService.sendMessageNotification({
        recipientEmail: testEmail,
        recipientName: 'John Doe',
        senderName: 'Coach Martin',
        senderRole: 'Coach Senior',
        messagePreview: 'Bonjour ! J\'espère que vous allez bien. J\'aimerais discuter de votre progression...'
      });
      
      setStatus(success 
        ? '✅ Notification message envoyée!'
        : '❌ Échec notification message'
      );
    } catch (error) {
      setStatus(`❌ Erreur: ${error}`);
    }
    
    setIsLoading(false);
  };

  const testRecommendationNotification = async () => {
    setIsLoading(true);
    setStatus('🔄 Test notification recommandation...');
    
    try {
      const success = await sendGridService.sendRecommendationNotification({
        recipientEmail: testEmail,
        recipientName: 'Marie Dupont',
        coachName: 'Coach Pierre',
        message: 'Je recommande vivement ce talent pour ses compétences exceptionnelles en développement et sa motivation.',
        jobTitle: 'Développeur Full Stack',
        isForTalent: true
      });
      
      setStatus(success 
        ? '✅ Notification recommandation envoyée!'
        : '❌ Échec notification recommandation'
      );
    } catch (error) {
      setStatus(`❌ Erreur: ${error}`);
    }
    
    setIsLoading(false);
  };

  const testAppointmentConfirmation = async () => {
    setIsLoading(true);
    setStatus('🔄 Test confirmation rendez-vous...');
    
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const success = await sendGridService.sendAppointmentConfirmation({
        recipientEmail: testEmail,
        recipientName: 'Jean Dupont',
        coachName: 'Coach Marie',
        date: tomorrow.toLocaleDateString('fr-FR'),
        time: '14:00',
        meetLink: 'https://meet.google.com/abc-defg-hij',
        calendarLink: 'https://calendar.google.com/calendar/event?action=TEMPLATE'
      });
      
      setStatus(success 
        ? '✅ Confirmation rendez-vous envoyée!'
        : '❌ Échec confirmation rendez-vous'
      );
    } catch (error) {
      setStatus(`❌ Erreur: ${error}`);
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
          📧 Configuration SendGrid
        </h1>

        {/* Configuration */}
        <div style={{
          backgroundColor: '#111',
          padding: '24px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <h2 style={{ color: '#ffcc00', marginBottom: '16px' }}>
            🔧 Étape 1: Configuration
          </h2>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
              Clé API SendGrid:
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="SG.xxxxxxxxxxxxxxxxxxxxx"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#222',
                color: '#f5f5f7',
                border: '1px solid #444',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          <button
            onClick={saveApiKey}
            disabled={!apiKey}
            style={{
              backgroundColor: apiKey ? '#ffcc00' : '#444',
              color: apiKey ? '#000' : '#888',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: apiKey ? 'pointer' : 'not-allowed'
            }}
          >
            💾 Sauvegarder la clé
          </button>
        </div>

        {/* Tests */}
        <div style={{
          backgroundColor: '#111',
          padding: '24px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <h2 style={{ color: '#ffcc00', marginBottom: '16px' }}>
            🧪 Étape 2: Tests
          </h2>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
              Email de test <span style={{color: '#ff6b6b'}}>(doit être vérifié dans SendGrid)</span>:
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="votre-email-verifie@gmail.com"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#222',
                color: '#f5f5f7',
                border: '1px solid #444',
                borderRadius: '4px',
                fontSize: '14px',
                marginBottom: '16px'
              }}
            />
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            <button
              onClick={testSendGrid}
              disabled={isLoading || !testEmail}
              style={{
                backgroundColor: '#4CAF50',
                color: '#fff',
                padding: '12px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading || !testEmail ? 'not-allowed' : 'pointer'
              }}
            >
              ✉️ Test Basic
            </button>
            
            <button
              onClick={testMessageNotification}
              disabled={isLoading || !testEmail}
              style={{
                backgroundColor: '#2196F3',
                color: '#fff',
                padding: '12px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading || !testEmail ? 'not-allowed' : 'pointer'
              }}
            >
              💬 Test Message
            </button>
            
            <button
              onClick={testRecommendationNotification}
              disabled={isLoading || !testEmail}
              style={{
                backgroundColor: '#FF9800',
                color: '#fff',
                padding: '12px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading || !testEmail ? 'not-allowed' : 'pointer'
              }}
            >
              🎯 Test Recommandation
            </button>
            
            <button
              onClick={testAppointmentConfirmation}
              disabled={isLoading || !testEmail}
              style={{
                backgroundColor: '#9C27B0',
                color: '#fff',
                padding: '12px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading || !testEmail ? 'not-allowed' : 'pointer'
              }}
            >
              📅 Test Rendez-vous
            </button>
          </div>
        </div>

        {/* Résultats */}
        <div style={{
          backgroundColor: '#111',
          padding: '24px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <h2 style={{ color: '#ffcc00', marginBottom: '16px' }}>
            📝 Résultats
          </h2>
          <div style={{
            backgroundColor: '#000',
            padding: '16px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '14px',
            minHeight: '60px'
          }}>
            {status || 'En attente de test...'}
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          backgroundColor: '#111',
          padding: '24px',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <h2 style={{ color: '#ffcc00', marginBottom: '16px' }}>
            📋 Instructions SendGrid
          </h2>
          <ol style={{ paddingLeft: '20px', lineHeight: 1.6 }}>
            <li>Créer un compte sur <a href="https://sendgrid.com" target="_blank" style={{color: '#ffcc00'}}>sendgrid.com</a></li>
            <li>Aller dans <strong>Settings → API Keys</strong></li>
            <li>Créer une nouvelle clé API avec permissions <strong>Mail Send</strong></li>
            <li>Copier la clé (commence par SG.xxxxx)</li>
            <li><strong style={{color: '#ff6b6b'}}>IMPORTANT:</strong> Aller sur <a href="https://app.sendgrid.com/settings/sender_auth/senders" target="_blank" style={{color: '#ffcc00'}}>Sender Identity</a></li>
            <li><strong style={{color: '#ff6b6b'}}>Créer un sender</strong> avec votre vraie adresse email</li>
            <li>Vérifier votre email via le lien SendGrid</li>
            <li>Utiliser cette adresse vérifiée ci-dessous</li>
          </ol>
          <p style={{ marginTop: '16px', color: '#61bfac' }}>
            ⚡ <strong>Avantages SendGrid:</strong> 99.9% de deliverabilité, analytics, templates, anti-spam
          </p>
        </div>
      </div>
    </div>
  );
}