import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CoachLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      // Si on arrive ici, la connexion a réussi
      // Rediriger vers le dashboard coach
      navigate('/dashboard/coach', { replace: true });
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError('Erreur lors de la connexion');
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
        borderRadius: 12,
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
            Coach Login
          </h1>
          <p style={{ 
            color: '#f5f5f7', 
            margin: 0,
            fontSize: '16px',
            opacity: 0.8
          }}>
            Accédez à votre espace coach
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
              Email *
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
                border: '1px solid #555',
                borderRadius: 8,
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="votre@email.com"
            />
          </div>

          {/* Mot de passe */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#f5f5f7',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Mot de passe *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#333',
                color: '#f5f5f7',
                border: '1px solid #555',
                borderRadius: 8,
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="••••••••"
            />
          </div>

          {/* Message d'erreur */}
          {error && (
            <div style={{
              backgroundColor: 'rgba(255, 107, 107, 0.1)',
              color: '#ff6b6b',
              padding: '12px',
              borderRadius: 8,
              marginBottom: '20px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* Bouton de connexion */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#ffcc00',
              color: '#000',
              border: 'none',
              borderRadius: 8,
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
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Liens */}
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
            Pas encore de compte coach ?
          </p>
          <button
            onClick={() => navigate('/register/coach')}
            style={{
              backgroundColor: 'transparent',
              color: '#ffcc00',
              border: '1px solid #ffcc00',
              borderRadius: 8,
              padding: '10px 20px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
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
            Créer un compte coach
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

export default CoachLogin;
