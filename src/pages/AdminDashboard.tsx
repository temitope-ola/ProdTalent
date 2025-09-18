import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FeaturedTalentsManager from '../components/FeaturedTalentsManager';
import { FirestoreService } from '../services/firestoreService';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('featured');
  const [passwordResetRequests, setPasswordResetRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger les demandes de réinitialisation
  const loadPasswordResetRequests = async () => {
    setLoading(true);
    try {
      const requests = await FirestoreService.getPasswordResetRequests();
      setPasswordResetRequests(requests);
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Générer un nouveau mot de passe temporaire
  const generateTempPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Traiter une demande de réinitialisation
  const handlePasswordReset = async (request: any) => {
    try {
      const tempPassword = generateTempPassword();

      // Mettre à jour le mot de passe dans Firebase Auth
      await FirestoreService.updateUserPassword(request.email, tempPassword);

      // Envoyer le nouveau mot de passe par email
      await FirestoreService.sendPasswordResetEmail(request.email, tempPassword);

      // Marquer la demande comme traitée
      await FirestoreService.updatePasswordResetStatus(request.id, 'completed');

      // Recharger la liste
      await loadPasswordResetRequests();

      alert(`Nouveau mot de passe mis à jour et envoyé à ${request.email}`);
    } catch (error) {
      console.error('Erreur traitement demande:', error);
      alert('Erreur lors du traitement de la demande: ' + (error as any).message);
    }
  };

  // Rejeter une demande
  const handleRejectRequest = async (request: any) => {
    try {
      await FirestoreService.updatePasswordResetStatus(request.id, 'rejected');
      await loadPasswordResetRequests();
      alert('Demande rejetée');
    } catch (error) {
      console.error('Erreur rejet demande:', error);
      alert('Erreur lors du rejet');
    }
  };

  useEffect(() => {
    if (activeSection === 'password-reset') {
      loadPasswordResetRequests();
    }
  }, [activeSection]);

  const menuItems = [
    { id: 'featured', label: 'Talents Mis en Avant', icon: '⭐' },
    { id: 'password-reset', label: 'Réinitialisation Mots de Passe', icon: '🔐' },
    { id: 'sendgrid', label: 'SendGrid Templates', icon: '📮' },
    { id: 'google', label: 'Google Config', icon: '🔗' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'featured':
        return (
          <div>
            <h2 style={{ color: '#ffcc00', marginBottom: '24px' }}>Talents Mis en Avant</h2>
            <FeaturedTalentsManager />
          </div>
        );

      case 'password-reset':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#ffcc00', margin: 0 }}>Demandes de Réinitialisation</h2>
              <button
                onClick={loadPasswordResetRequests}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ffcc00',
                  color: '#000',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Chargement...' : '🔄 Actualiser'}
              </button>
            </div>

            {passwordResetRequests.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                backgroundColor: '#1a1a1a',
                borderRadius: '4px',
                color: '#888'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
                <p>Aucune demande de réinitialisation en attente</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {passwordResetRequests.map((request: any) => (
                  <div key={request.id} style={{
                    backgroundColor: '#1a1a1a',
                    padding: '20px',
                    borderRadius: '8px',
                    border: `1px solid ${
                      request.status === 'pending' ? '#ffcc00' :
                      request.status === 'completed' ? '#4caf50' : '#ff6b6b'
                    }`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{
                            backgroundColor: request.status === 'pending' ? '#ffcc00' :
                                          request.status === 'completed' ? '#4caf50' : '#ff6b6b',
                            color: '#000',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            marginRight: '16px',
                            textTransform: 'uppercase'
                          }}>
                            {request.status === 'pending' ? 'En attente' :
                             request.status === 'completed' ? 'Traité' : 'Rejeté'}
                          </span>
                          <strong style={{ color: '#ffcc00', fontSize: '16px' }}>
                            {request.email}
                          </strong>
                        </div>

                        <div style={{ marginBottom: '8px', color: '#ccc', fontSize: '14px' }}>
                          <strong>Date:</strong> {request.createdAt?.toDate?.()?.toLocaleString('fr-FR') || 'Date inconnue'}
                        </div>

                        {request.message && (
                          <div style={{
                            marginBottom: '12px',
                            padding: '12px',
                            backgroundColor: '#2a2a2a',
                            borderRadius: '4px',
                            borderLeft: '3px solid #ffcc00'
                          }}>
                            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                              Message de l'utilisateur:
                            </div>
                            <div style={{ color: '#f5f5f7' }}>
                              {request.message}
                            </div>
                          </div>
                        )}

                        <div style={{ fontSize: '12px', color: '#666' }}>
                          <strong>User Agent:</strong> {request.userAgent || 'Non spécifié'}
                        </div>
                      </div>

                      {request.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '12px', marginLeft: '20px' }}>
                          <button
                            onClick={() => handlePasswordReset(request)}
                            style={{
                              padding: '12px 20px',
                              backgroundColor: '#4caf50',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            ✅ Réinitialiser
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request)}
                            style={{
                              padding: '12px 20px',
                              backgroundColor: '#ff6b6b',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            ❌ Rejeter
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'sendgrid':
        return (
          <div>
            <h2 style={{ color: '#ffcc00', marginBottom: '24px' }}>Tests SendGrid</h2>
            <button 
              onClick={() => navigate('/sendgrid-test')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#ffcc00',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Accéder aux tests SendGrid
            </button>
          </div>
        );

      case 'google':
        return (
          <div>
            <h2 style={{ color: '#ffcc00', marginBottom: '24px' }}>Configuration Google</h2>
            <button 
              onClick={() => navigate('/google-config')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#61bfac',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Configurer Google Services
            </button>
          </div>
        );

      default:
        return <div>Section non trouvée</div>;
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0a',
      color: '#f5f5f7'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ color: '#ffcc00', margin: 0 }}>Admin Dashboard</h1>
        <button
          onClick={() => navigate('/dashboard/admin')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#333',
            color: '#f5f5f7',
            border: '1px solid #555',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retour
        </button>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
        {/* Sidebar */}
        <div style={{
          width: '300px',
          backgroundColor: '#1a1a1a',
          padding: '24px',
          borderRight: '1px solid #333'
        }}>
          {menuItems.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              style={{
                padding: '16px',
                marginBottom: '8px',
                backgroundColor: activeSection === item.id ? '#333' : 'transparent',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                border: activeSection === item.id ? '1px solid #ffcc00' : '1px solid transparent'
              }}
            >
              <span style={{ marginRight: '12px', fontSize: '18px' }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          padding: '24px'
        }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}