import React, { useState, useEffect } from 'react';
import { sendGridConfigService } from '../services/sendGridConfigService';
import sendGridService from '../services/sendGridService';

export default function SendGridAdminPage() {
  const [config, setConfig] = useState({
    apiKey: '',
    verifiedSender: 'france@edacy.com'
  });
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingConfig, setHasExistingConfig] = useState(false);

  useEffect(() => {
    loadExistingConfig();
  }, []);

  const loadExistingConfig = async () => {
    try {
      const existingConfig = await sendGridConfigService.getSendGridConfig();
      if (existingConfig) {
        setConfig({
          apiKey: existingConfig.apiKey,
          verifiedSender: existingConfig.verifiedSender
        });
        setHasExistingConfig(true);
        setStatus('✅ Configuration SendGrid existante chargée');
      } else {
        // Essayer de récupérer depuis localStorage
        const localApiKey = localStorage.getItem('SENDGRID_API_KEY');
        if (localApiKey) {
          setConfig(prev => ({ ...prev, apiKey: localApiKey }));
          setStatus('📋 Clé API trouvée dans le navigateur');
        } else {
          setStatus('⚠️ Aucune configuration trouvée');
        }
      }
    } catch (error) {
      setStatus('❌ Erreur chargement configuration');
    }
  };

  const saveConfig = async () => {
    setIsLoading(true);
    setStatus('💾 Sauvegarde configuration SendGrid...');

    try {
      const success = await sendGridConfigService.saveSendGridConfig({
        apiKey: config.apiKey,
        verifiedSender: config.verifiedSender
      });

      if (success) {
        // Sauvegarder aussi dans localStorage pour compatibilité
        localStorage.setItem('SENDGRID_API_KEY', config.apiKey);
        
        setHasExistingConfig(true);
        setStatus('✅ Configuration SendGrid sauvegardée avec succès!');
      } else {
        setStatus('❌ Erreur lors de la sauvegarde');
      }
    } catch (error) {
      setStatus(`❌ Erreur: ${error}`);
    }

    setIsLoading(false);
  };

  const testConfig = async () => {
    setIsLoading(true);
    setStatus('🧪 Test configuration SendGrid...');

    try {
      const success = await sendGridService.sendEmail({
        to: config.verifiedSender,
        from: config.verifiedSender,
        subject: 'Test Admin ProdTalent - SendGrid',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: #ffcc00; padding: 30px; text-align: center;">
              <h1 style="color: #000; margin: 0;">🎉 ProdTalent Admin</h1>
            </div>
            <div style="background: #fff; padding: 30px;">
              <h2 style="color: #333;">Configuration SendGrid réussie !</h2>
              <p>Ce test confirme que SendGrid est correctement configuré pour ProdTalent.</p>
              <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="color: #155724; margin: 0;">
                  ✅ <strong>SendGrid fonctionne parfaitement !</strong><br>
                  Les notifications de l'application utilisent maintenant SendGrid.
                </p>
              </div>
              <p><strong>Configuration active :</strong></p>
              <ul>
                <li>Expéditeur vérifié : ${config.verifiedSender}</li>
                <li>Firestore : Configuration sauvegardée</li>
                <li>Status : Opérationnel</li>
              </ul>
            </div>
          </div>
        `
      });

      if (success) {
        setStatus('✅ Test réussi ! Email envoyé via SendGrid');
      } else {
        setStatus('❌ Test échoué - Vérifiez la configuration');
      }
    } catch (error) {
      setStatus(`❌ Erreur test: ${error}`);
    }

    setIsLoading(false);
  };

  const migrateFromEmailJS = async () => {
    setIsLoading(true);
    setStatus('🔄 Migration EmailJS → SendGrid...');

    try {
      const success = await sendGridConfigService.migrateFromEmailJS();
      if (success) {
        setStatus('✅ Migration EmailJS → SendGrid terminée!');
        loadExistingConfig(); // Recharger la config
      } else {
        setStatus('❌ Erreur lors de la migration');
      }
    } catch (error) {
      setStatus(`❌ Erreur migration: ${error}`);
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
        <h1 style={{ color: '#ffcc00', textAlign: 'center', marginBottom: '8px' }}>
          ⚙️ Administration SendGrid
        </h1>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '32px' }}>
          Configuration SendGrid pour ProdTalent (remplace EmailJS)
        </p>

        {/* Configuration */}
        <div style={{
          backgroundColor: '#111',
          padding: '24px',
          borderRadius: '4px',
          marginBottom: '24px'
        }}>
          <h2 style={{ color: '#ffcc00', marginBottom: '16px' }}>
            📧 Configuration SendGrid
          </h2>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
              Clé API SendGrid:
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
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

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
              Expéditeur vérifié:
            </label>
            <input
              type="email"
              value={config.verifiedSender}
              onChange={(e) => setConfig(prev => ({ ...prev, verifiedSender: e.target.value }))}
              placeholder="votre@email.com"
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

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            <button
              onClick={saveConfig}
              disabled={isLoading || !config.apiKey}
              style={{
                backgroundColor: config.apiKey ? '#4CAF50' : '#444',
                color: '#fff',
                padding: '12px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading || !config.apiKey ? 'not-allowed' : 'pointer'
              }}
            >
              💾 Sauvegarder
            </button>

            <button
              onClick={testConfig}
              disabled={isLoading || !config.apiKey}
              style={{
                backgroundColor: '#2196F3',
                color: '#fff',
                padding: '12px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading || !config.apiKey ? 'not-allowed' : 'pointer'
              }}
            >
              🧪 Tester
            </button>

            <button
              onClick={migrateFromEmailJS}
              disabled={isLoading}
              style={{
                backgroundColor: '#FF9800',
                color: '#fff',
                padding: '12px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              🔄 Migrer EmailJS
            </button>
          </div>
        </div>

        {/* Status */}
        <div style={{
          backgroundColor: hasExistingConfig ? '#1a4d3a' : '#111',
          border: hasExistingConfig ? '1px solid #4CAF50' : '1px solid #444',
          padding: '20px',
          borderRadius: '4px',
          marginBottom: '24px'
        }}>
          <h3 style={{ color: hasExistingConfig ? '#4CAF50' : '#ffcc00', margin: '0 0 16px 0' }}>
            📊 Status
          </h3>
          <div style={{
            backgroundColor: '#000',
            padding: '16px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '14px',
            minHeight: '60px'
          }}>
            {status || 'En attente de configuration...'}
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          backgroundColor: '#111',
          padding: '24px',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          <h2 style={{ color: '#ffcc00', marginBottom: '16px' }}>
            📋 Instructions
          </h2>
          <ol style={{ paddingLeft: '20px', lineHeight: 1.6 }}>
            <li>Obtenez votre clé API SendGrid depuis <a href="https://app.sendgrid.com/settings/api_keys" target="_blank" style={{color: '#ffcc00'}}>Settings → API Keys</a></li>
            <li>Vérifiez votre adresse d'expéditeur sur <a href="https://app.sendgrid.com/settings/sender_auth/senders" target="_blank" style={{color: '#ffcc00'}}>Sender Identity</a></li>
            <li>Sauvegarder la configuration dans Firestore</li>
            <li>Tester l'envoi d'email</li>
            <li>Migrer les anciennes configurations EmailJS</li>
          </ol>
          
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#1a4d3a', borderRadius: '4px' }}>
            <strong style={{ color: '#4CAF50' }}>✅ Avantages SendGrid :</strong>
            <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
              <li>99.9% de délivrabilité</li>
              <li>Templates HTML professionnels</li>
              <li>Statistiques détaillées</li>
              <li>Aucun problème de fiabilité</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}