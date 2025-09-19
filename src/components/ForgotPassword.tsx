import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Importer FirestoreService dynamiquement
      const { FirestoreService } = await import('../services/firestoreService');

      // Créer une demande de réinitialisation
      const resetRequest = {
        email: email,
        message: userMessage,
        status: 'pending',
        createdAt: new Date(),
        userAgent: navigator.userAgent,
        ip: 'unknown' // On pourrait ajouter une API pour récupérer l'IP
      };

      // Enregistrer dans Firestore
      await FirestoreService.createPasswordResetRequest(resetRequest);

      // Envoyer une notification à l'admin
      await FirestoreService.notifyAdminPasswordReset(email, userMessage);

      setMessage('Votre demande de réinitialisation a été envoyée à l\'administrateur. Vous recevrez un nouveau mot de passe par email sous 24h.');
    } catch (error: any) {
      console.error('Erreur lors de la demande:', error);
      setError('Erreur lors de l\'envoi de la demande. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f7',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#111',
        borderRadius: 4,
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            color: '#ffcc00',
            margin: '0 0 8px 0',
            fontSize: '28px',
            fontWeight: 'bold'
          }}>
            Mot de passe oublié
          </h1>
          <p style={{
            color: '#f5f5f7',
            margin: 0,
            fontSize: '16px',
            opacity: 0.8
          }}>
            Réinitialisez votre mot de passe
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#f5f5f7',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Adresse email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#333',
                color: '#f5f5f7',
                border: 'none',
                borderRadius: 4,
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="votre@email.com"
            />
          </div>

          {/* Message optionnel */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#f5f5f7',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Message (optionnel)
            </label>
            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#333',
                color: '#f5f5f7',
                border: 'none',
                borderRadius: 4,
                fontSize: '16px',
                boxSizing: 'border-box',
                minHeight: '80px',
                resize: 'vertical'
              }}
              placeholder="Décrivez votre situation ou ajoutez des informations pour nous aider..."
            />
          </div>

          {/* Message de succès */}
          {message && (
            <div style={{
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              color: '#4caf50',
              padding: '12px',
              borderRadius: 4,
              marginBottom: '20px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div style={{
              backgroundColor: 'rgba(255, 107, 107, 0.1)',
              color: '#ff6b6b',
              padding: '12px',
              borderRadius: 4,
              marginBottom: '20px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* Bouton d'envoi */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#ffcc00',
              color: '#000',
              border: 'none',
              borderRadius: 4,
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#e6b800';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#ffcc00';
              }
            }}
          >
{loading ? 'Envoi en cours...' : 'Envoyer la demande à l\'administrateur'}
          </button>
        </form>

        {/* Instructions */}
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '16px',
          borderRadius: 4,
          marginBottom: '20px'
        }}>
          <h4 style={{ color: '#ffcc00', margin: '0 0 8px 0', fontSize: '14px' }}>
            Comment ça fonctionne :
          </h4>
          <ul style={{ color: '#f5f5f7', margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
            <li>Entrez l'adresse email de votre compte</li>
            <li>Ajoutez un message optionnel si nécessaire</li>
            <li>Votre demande est envoyée à l'administrateur</li>
            <li>Vous recevrez un nouveau mot de passe par email sous 24h</li>
            <li>Connectez-vous avec le nouveau mot de passe reçu</li>
          </ul>
        </div>

        {/* Liens de navigation */}
        <div style={{
          textAlign: 'center',
          paddingTop: '20px',
          borderTop: '1px solid #333'
        }}>
          <p style={{
            color: '#f5f5f7',
            margin: '0 0 16px 0',
            fontSize: '14px',
            opacity: 0.8
          }}>
            Vous vous souvenez de votre mot de passe ?
          </p>
          <button
            onClick={() => navigate(-1)}
            style={{
              backgroundColor: 'transparent',
              color: '#ffcc00',
              border: 'none',
              borderRadius: 4,
              padding: '10px 20px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginRight: '12px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ffcc00';
              e.currentTarget.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#ffcc00';
            }}
          >
            ← Retour à la connexion
          </button>
        </div>

        {/* Retour à l'accueil */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px'
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              backgroundColor: 'transparent',
              color: '#888',
              border: 'none',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;