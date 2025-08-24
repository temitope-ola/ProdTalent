import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService, UserProfile } from '../services/firestoreService';
import Avatar from '../components/Avatar';

const TalentsListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [talents, setTalents] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTalents = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      try {
        setIsLoading(true);
        const talentsList = await FirestoreService.getAllTalents();
        setTalents(talentsList);
      } catch (error) {
        console.error('Erreur lors du chargement des talents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTalents();
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await FirestoreService.signOut();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleViewProfile = (talentId: string) => {
    navigate(`/profile/${talentId}?from=recruiter-talents`);
  };

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#000', 
        color: '#f5f5f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        Chargement des talents...
      </div>
    );
  }

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
        padding: '24px'
      }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
        borderBottom: '1px solid #333',
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
                          onClick={() => navigate('/dashboard/recruteur')}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#ffcc00',
              border: '1px solid #ffcc00',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '12px'
            }}
          >
            Retour
          </button>
          <h1 style={{ margin: 0, color: '#ffcc00' }}>
            Talents Disponibles ({talents.length})
          </h1>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#333',
            color: '#f5f5f7',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Se déconnecter
        </button>
      </header>

      {/* Talents Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: 20 
      }}>
        {talents.map(talent => (
          <div key={talent.id} style={{
            backgroundColor: '#111',
            borderRadius: 8,
            padding: 20,
            border: '1px solid #333'
          }}>
            {/* Talent Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <Avatar
                email={talent.email}
                src={talent.avatarUrl}
                size="medium"
                editable={false}
              />
              <div>
                <h3 style={{ 
                  color: '#f5f5f7', 
                  margin: '0 0 4px 0',
                  fontSize: '18px'
                }}>
                  {talent.displayName || talent.email.split('@')[0]}
                </h3>
                <p style={{ 
                  color: '#888', 
                  margin: 0,
                  fontSize: '14px'
                }}>
                  {talent.email}
                </p>
              </div>
            </div>

            {/* Bio Preview */}
            {talent.bio && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ 
                  color: '#f5f5f7', 
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.4',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {talent.bio}
                </p>
              </div>
            )}

            {/* Skills Preview */}
            {talent.skills && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ 
                  color: '#888', 
                  margin: '0 0 4px 0',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Compétences
                </p>
                <p style={{ 
                  color: '#f5f5f7', 
                  margin: 0,
                  fontSize: '13px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {talent.skills}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => handleViewProfile(talent.id)}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#ffcc00',
                  border: '1px solid #ffcc00',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Voir le profil
              </button>
            </div>
          </div>
        ))}
      </div>

      {talents.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#888'
        }}>
          <p>Aucun talent disponible pour le moment.</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default TalentsListPage;
