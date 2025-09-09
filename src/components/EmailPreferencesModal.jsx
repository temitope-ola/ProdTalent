import React, { useState, useEffect } from 'react';
import { FirestoreService } from '../services/firestoreService';
import { useNotifications } from './NotificationManager';
import useAuth from '../contexts/AuthContext';

// Types d'emails disponibles avec leurs descriptions
const EMAIL_TYPES = {
  // Messages et communications
  messages: {
    name: '💬 Messages privés',
    description: 'Notifications lorsque vous recevez un nouveau message'
  },
  messageConfirmations: {
    name: '✅ Confirmations d\'envoi de messages',
    description: 'Confirmation que votre message a été envoyé'
  },
  
  // Rendez-vous et coaching
  appointments: {
    name: '📅 Rendez-vous de coaching',
    description: 'Notifications pour nouveaux RDV, confirmations, modifications'
  },
  appointmentReminders: {
    name: '⏰ Rappels de rendez-vous',
    description: 'Rappels 24h et 1h avant vos rendez-vous'
  },
  
  // Recommandations et opportunités
  recommendations: {
    name: '🎯 Recommandations de talents/jobs',
    description: 'Nouvelles recommandations correspondant à votre profil'
  },
  jobAlerts: {
    name: '💼 Alertes emploi',
    description: 'Nouvelles offres d\'emploi correspondant à vos compétences'
  },
  
  // Marketing et newsletter
  newsletter: {
    name: '📧 Newsletter ProdTalent',
    description: 'Actualités, conseils carrière, tendances tech'
  },
  productUpdates: {
    name: '🚀 Mises à jour produit',
    description: 'Nouvelles fonctionnalités et améliorations de ProdTalent'
  },
  
  // Administratif et compte
  accountSecurity: {
    name: '🔐 Sécurité du compte',
    description: 'Alertes de sécurité, changements de mot de passe (recommandé)'
  },
  adminNotices: {
    name: '📢 Notices administratives',
    description: 'Informations importantes sur votre compte ou le service'
  }
};

// Préférences par défaut (tous activés sauf marketing)
const DEFAULT_PREFERENCES = {
  messages: true,
  messageConfirmations: true,
  appointments: true,
  appointmentReminders: true,
  recommendations: true,
  jobAlerts: true,
  newsletter: false, // Désactivé par défaut
  productUpdates: false, // Désactivé par défaut
  accountSecurity: true, // Toujours recommandé
  adminNotices: true // Important pour les utilisateurs
};

const EmailPreferencesModal = ({ isOpen, onClose, userId }) => {
  const { showNotification } = useNotifications();
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Charger les préférences existantes
  useEffect(() => {
    if (isOpen && userId) {
      loadPreferences();
    }
  }, [isOpen, userId]);

  const loadPreferences = async () => {
    setIsLoading(true);
    try {
      const userPrefs = await FirestoreService.getEmailPreferences(userId);
      if (userPrefs) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...userPrefs });
      } else {
        setPreferences(DEFAULT_PREFERENCES);
      }
    } catch (error) {
      console.error('Erreur chargement préférences email:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger vos préférences email'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (emailType) => {
    setPreferences(prev => ({
      ...prev,
      [emailType]: !prev[emailType]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await FirestoreService.saveEmailPreferences(userId, preferences);
      
      showNotification({
        type: 'success',
        title: 'Préférences sauvegardées',
        message: 'Vos préférences email ont été mises à jour avec succès'
      });
      
      onClose();
    } catch (error) {
      console.error('Erreur sauvegarde préférences:', error);
      showNotification({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: 'Impossible de sauvegarder vos préférences email'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectAll = () => {
    const newPrefs = {};
    Object.keys(EMAIL_TYPES).forEach(key => {
      newPrefs[key] = true;
    });
    setPreferences(newPrefs);
  };

  const handleDeselectAll = () => {
    const newPrefs = {};
    Object.keys(EMAIL_TYPES).forEach(key => {
      // Garder les critiques activés (sécurité et admin)
      newPrefs[key] = key === 'accountSecurity' || key === 'adminNotices';
    });
    setPreferences(newPrefs);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#111',
        padding: '32px',
        borderRadius: '8px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ color: '#ffcc00', margin: 0, fontSize: '24px' }}>
            📧 Préférences Email
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        {/* Description */}
        <p style={{ 
          color: '#ccc', 
          fontSize: '14px', 
          marginBottom: '24px',
          lineHeight: '1.5'
        }}>
          Choisissez les types d'emails que vous souhaitez recevoir. 
          Vous pouvez modifier ces préférences à tout moment.
        </p>

        {/* Actions rapides */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <button
            onClick={handleSelectAll}
            style={{
              padding: '8px 16px',
              backgroundColor: '#61bfac',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Tout sélectionner
          </button>
          <button
            onClick={handleDeselectAll}
            style={{
              padding: '8px 16px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Désélectionner tout
          </button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', color: '#ccc', padding: '40px' }}>
            Chargement des préférences...
          </div>
        ) : (
          <>
            {/* Liste des préférences */}
            <div style={{ marginBottom: '32px' }}>
              {Object.entries(EMAIL_TYPES).map(([key, config]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    padding: '16px',
                    backgroundColor: preferences[key] ? 'rgba(97, 191, 172, 0.1)' : '#1a1a1a',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    border: `2px solid ${preferences[key] ? '#61bfac' : '#333'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handlePreferenceChange(key)}
                >
                  {/* Checkbox custom */}
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    backgroundColor: preferences[key] ? '#61bfac' : 'transparent',
                    border: `2px solid ${preferences[key] ? '#61bfac' : '#666'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    {preferences[key] && (
                      <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Contenu */}
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      color: preferences[key] ? '#61bfac' : '#f5f5f7',
                      margin: '0 0 4px 0',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}>
                      {config.name}
                    </h4>
                    <p style={{
                      color: preferences[key] ? '#b8d4ce' : '#999',
                      fontSize: '14px',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {config.description}
                    </p>
                    
                    {/* Badge recommandé pour les critiques */}
                    {(key === 'accountSecurity' || key === 'adminNotices') && (
                      <span style={{
                        display: 'inline-block',
                        backgroundColor: '#ffcc00',
                        color: '#000',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        padding: '2px 6px',
                        borderRadius: '12px',
                        marginTop: '6px'
                      }}>
                        RECOMMANDÉ
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Résumé */}
            <div style={{
              padding: '16px',
              backgroundColor: '#1a1a1a',
              borderRadius: '8px',
              marginBottom: '24px',
              border: '1px solid #333'
            }}>
              <h4 style={{ color: '#ffcc00', margin: '0 0 8px 0', fontSize: '14px' }}>
                📊 Résumé de vos préférences
              </h4>
              <p style={{ color: '#ccc', fontSize: '13px', margin: 0 }}>
                {Object.values(preferences).filter(p => p).length} types d'emails activés sur {Object.keys(EMAIL_TYPES).length} disponibles
              </p>
            </div>

            {/* Boutons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={onClose}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: '#888',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#ffcc00',
                  color: '#000',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  opacity: isSaving ? 0.6 : 1
                }}
              >
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailPreferencesModal;