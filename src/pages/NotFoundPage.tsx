import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../contexts/AuthContext';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoToDashboard = () => {
    if (user) {
      navigate(`/dashboard/${user.role}`, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#f5f5f7',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '1214px',
        maxWidth: '100%',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        {/* Illustration */}
        <div style={{
          marginBottom: 32,
          fontSize: '120px',
          color: '#ffcc00'
        }}>
          🗺️
        </div>

        {/* Titre */}
        <h1 style={{
          fontSize: '2.5rem',
          marginBottom: 16,
          color: '#f5f5f7',
          fontWeight: 'bold'
        }}>
          Page introuvable
        </h1>

        {/* Séparateur */}
        <div style={{
          width: '100px',
          height: '2px',
          backgroundColor: '#333',
          marginBottom: 24
        }} />

        {/* Message */}
        <p style={{
          fontSize: '1.1rem',
          marginBottom: 32,
          color: '#ccc',
          maxWidth: '500px',
          lineHeight: 1.6
        }}>
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        {/* Instructions */}
        <div style={{
          backgroundColor: '#111',
          padding: 24,
          borderRadius: 8,
          marginBottom: 32,
          maxWidth: '500px'
        }}>
          <h3 style={{ color: '#ffcc00', marginBottom: 16 }}>Essayez ces solutions :</h3>
          <ul style={{
            textAlign: 'left',
            color: '#f5f5f7',
            lineHeight: 1.8,
            paddingLeft: 20
          }}>
            <li>Vérifiez que l'URL est correcte</li>
            <li>Utilisez les liens de navigation de l'application</li>
            <li>Retournez à votre dashboard</li>
          </ul>
        </div>

        {/* Boutons d'action */}
        <div style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {user && (
            <button
              onClick={handleGoToDashboard}
              style={{
                padding: '12px 24px',
                backgroundColor: '#ffcc00',
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              🏠 Aller au Dashboard
            </button>
          )}
          
          <button
            onClick={handleGoHome}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: '#ffcc00',
              border: '1px solid #ffcc00',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🏠 Page d'accueil
          </button>
        </div>

        {/* Informations techniques */}
        <div style={{
          marginTop: 48,
          padding: 16,
          backgroundColor: '#1a1a1a',
          borderRadius: 6,
          fontSize: '14px',
          color: '#999',
          maxWidth: '400px'
        }}>
          <p style={{ margin: 0 }}>
            <strong>Erreur 404</strong> - Page non trouvée
          </p>
          <p style={{ margin: '8px 0 0 0' }}>
            URL actuelle : {window.location.pathname}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
