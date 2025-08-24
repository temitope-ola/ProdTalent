import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../contexts/AuthContext';
import { FirestoreService, UserProfile } from '../services/firestoreService';
import { useNotifications } from '../components/NotificationManager';
import Avatar from '../components/Avatar';

export default function RecruiterDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [talents, setTalents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // Redirection si l'utilisateur n'est pas un recruteur
  useEffect(() => {
    if (user && user.role !== 'recruteur') {
      navigate(`/dashboard/${user.role}`, { replace: true });
    }
  }, [user, navigate]);

  // Charger le profil et les talents
  useEffect(() => {
    if (user) {
      loadProfile();
      loadTalents();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userProfile = await FirestoreService.getCurrentProfile(user.id, user.role);
      setProfile(userProfile);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTalents = async () => {
    if (!user) return;
    try {
      const talentsList = await FirestoreService.getAllTalents();
      setTalents(talentsList);
    } catch (error) {
      console.error('Erreur lors du chargement des talents:', error);
    }
  };

  // Affichage de chargement
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: '#f5f5f7'
      }}>
        Chargement...
      </div>
    );
  }

  // Redirection si pas connecté
  if (!user) {
    navigate('/', { replace: true });
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleCreateJob = () => {
    navigate('/create-job');
  };

  const handleViewApplications = () => {
    navigate('/applications');
  };

  const handleSearchTalents = () => {
    showNotification({
      type: 'info',
      title: 'Fonctionnalité à venir',
      message: 'La recherche de talents sera bientôt disponible'
    });
    // Ici vous pourriez naviguer vers une page de recherche avancée
  };

  const handleOpenMessages = () => {
    navigate('/messages');
  };

  const handleViewMyJobs = () => {
    navigate('/my-jobs');
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
        padding: '24px'
      }}>
        <header style={{ 
          display: 'flex', 
          gap: 16, 
          alignItems: 'center',
          paddingBottom: 16,
          borderBottom: '1px solid #333',
          padding: '0 24px 16px 24px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h1 style={{ margin: 0, color: '#f5f5f7', fontSize: '24px', fontWeight: 'bold' }}>ProdTalent</h1>
            <span style={{ color: '#ffcc00', fontSize: '14px', marginTop: '4px' }}>Recruteur Dashboard</span>
          </div>
          <div style={{ flex: 1 }} />
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

        <section style={{ marginTop: 24, padding: '0 24px' }}>
          <h2 style={{ color: '#ffcc00' }}>Bienvenue {user.displayName || (user.email ? user.email.split('@')[0] : 'Utilisateur')}</h2>
          <p>Gérez vos annonces, candidatures et trouvez les meilleurs talents.</p>
          
          {/* Profil utilisateur */}
          {profile && (
            <div style={{ 
              marginBottom: 24,
              marginTop: 24,
              padding: 0, 
              backgroundColor: '#111', 
              borderRadius: 4,
              border: 'transparent',
              overflow: 'hidden',
              height: '150px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                            <div style={{
                width: '150px',
                height: '150px',
                backgroundColor: '#ffcc00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px 0 0 4px'
              }}>
                  <Avatar 
                    email={profile.email} 
                    src={profile.avatarUrl} 
                    size="large"
                    editable={true}
                    onImageChange={async (file) => {
                      try {
                        const avatarUrl = await FirestoreService.uploadAvatar(file);
                        await FirestoreService.updateProfile(profile.id, profile.role, { avatarUrl });
                        // Recharger le profil
                        const updatedProfile = await FirestoreService.getCurrentProfile(profile.id, profile.role);
                        if (updatedProfile) {
                          setProfile(updatedProfile);
                        }
                      } catch (error) {
                        console.error('Erreur lors de l\'upload de l\'avatar:', error);
                      }
                    }}
                  />
                </div>
                <div style={{ flex: 1, padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ color: '#ffcc00', marginTop: 0, marginBottom: '12px' }}>Mon Profil</h3>
                      <h4 style={{ color: '#f5f5f7', margin: '0 0 8px 0' }}>
                        {profile.displayName || (profile.email ? profile.email.split('@')[0] : 'Utilisateur')}
                      </h4>
                      <p style={{ color: '#888', margin: '0 0 4px 0' }}>
                        <strong>Rôle:</strong> {profile.role}
                      </p>
                      <p style={{ color: '#888', margin: '0' }}>
                        <strong>Membre depuis:</strong> {profile.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/profile')}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: 'transparent',
                        color: '#ffcc00',
                        border: '0.5px solid #ffcc00',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '12px',
                        width: '140px',
                        textAlign: 'left',
                        alignSelf: 'flex-end'
                      }}
                    >
                      Voir Profil Complet
                    </button>
                  </div>
                </div>
                {profile.bio && (
                  <div style={{ padding: '0 20px 20px 20px' }}>
                    <p style={{ color: '#f5f5f7', marginTop: '12px' }}>
                      <strong>Bio:</strong> {profile.bio}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Statistiques rapides */}
          <div style={{ 
            marginBottom: 24, 
            padding: 20, 
            backgroundColor: '#111', 
            borderRadius: 4,
            border: 'transparent'
          }}>
            <h3 style={{ color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }}>Statistiques</h3>
            <p style={{ color: '#f5f5f7', fontWeight: 500 }}>Talents disponibles: {talents.length}</p>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: 24, 
            marginTop: 32 
          }}>
            {/* Annonces */}
            <div style={{
              backgroundColor: '#111',
              padding: 20,
              borderRadius: 4,
              border: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              height: '200px'
            }}>
              <h3 style={{ color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }}>Mes Annonces</h3>
              <p style={{ color: '#f5f5f7', marginBottom: '16px' }}>Créez et gérez vos offres d'emploi</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 'auto', flexWrap: 'wrap' }}>
                <button 
                  onClick={handleCreateJob}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: '#ffcc00',
                    border: '0.5px solid #ffcc00',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    width: '140px',
                    textAlign: 'left'
                  }}
                >
                  Créer une annonce
                </button>
                <button 
                  onClick={handleViewMyJobs}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: '#ffcc00',
                    border: '0.5px solid #ffcc00',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    width: '140px',
                    textAlign: 'left'
                  }}
                >
                  Mes annonces
                </button>
              </div>
            </div>

            {/* Recherche de talents */}
            <div style={{
              backgroundColor: '#111',
              padding: 20,
              borderRadius: 4,
              border: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              height: '200px'
            }}>
              <h3 style={{ color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }}>Talents Disponibles</h3>
              <p style={{ color: '#f5f5f7', marginBottom: '16px' }}>Découvrez des talents qualifiés ({talents.length} disponibles)</p>
              <button 
                onClick={() => navigate('/talents')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#ffcc00',
                  border: '0.5px solid #ffcc00',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: 'auto',
                  width: '140px',
                  textAlign: 'left'
                }}
              >
                Voir les profils
              </button>
            </div>

            {/* Recommandations */}
            <div style={{
              backgroundColor: '#111',
              padding: 20,
              borderRadius: 4,
              border: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              height: '200px'
            }}>
              <h3 style={{ color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }}>Recommandations</h3>
              <p style={{ color: '#f5f5f7', marginBottom: '16px' }}>Recommandations de talents par les coaches</p>
              <button 
                onClick={() => navigate('/recommendations')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#ffcc00',
                  border: '0.5px solid #ffcc00',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: 'auto',
                  width: '140px',
                  textAlign: 'left'
                }}
              >
                Voir les recommandations
              </button>
            </div>

            {/* Candidatures */}
            <div style={{
              backgroundColor: '#111',
              padding: 20,
              borderRadius: 4,
              border: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              height: '200px'
            }}>
              <h3 style={{ color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }}>Candidatures</h3>
              <p style={{ color: '#f5f5f7', marginBottom: '16px' }}>Consultez et gérez les candidatures reçues</p>
              <button 
                onClick={handleViewApplications}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#ffcc00',
                  border: '0.5px solid #ffcc00',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: 'auto',
                  width: '140px',
                  textAlign: 'left'
                }}
              >
                Voir les candidatures
              </button>
            </div>

            {/* Messages */}
            <div style={{
              backgroundColor: '#111',
              padding: 20,
              borderRadius: 4,
              border: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              height: '200px'
            }}>
              <h3 style={{ color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }}>Messages</h3>
              <p style={{ color: '#f5f5f7', marginBottom: '16px' }}>Communiquez avec les talents et coaches</p>
              <button 
                onClick={handleOpenMessages}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#ffcc00',
                  border: '0.5px solid #ffcc00',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: 'auto',
                  width: '140px',
                  textAlign: 'left'
                }}
              >
                Ouvrir les messages
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
