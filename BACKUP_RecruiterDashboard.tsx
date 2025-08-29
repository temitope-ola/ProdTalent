import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../src/contexts/AuthContext';
import { FirestoreService, UserProfile } from './services/firestoreService';
import { useNotifications } from './components/NotificationManager';
import Avatar from './components/Avatar';


// VERSION AMÉLIORÉE - Dashboard Recruteur Optimisé
export default function RecruiterDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [talents, setTalents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  
  console.log('🚀 RecruiterDashboard chargé - Timestamp:', Date.now());

  
  // Nouvelles métriques pour prioriser les actions
  const [jobStats, setJobStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    recentApplications: 0
  });
  
  const [recommendationStats, setRecommendationStats] = useState({
    totalRecommendations: 0,
    newRecommendations: 0
  });

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
      loadJobStats();
      loadRecommendationStats();
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

  // Nouvelles fonctions pour charger les métriques
  const loadJobStats = async () => {
    if (!user) return;
    try {
      // Simulation des statistiques - à remplacer par de vraies données
      setJobStats({
        activeJobs: 3,
        totalApplications: 24,
        pendingApplications: 8,
        recentApplications: 3
      });
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    }
  };

  const loadRecommendationStats = async () => {
    if (!user) return;
    try {
      // Simulation des statistiques - à remplacer par de vraies données
      setRecommendationStats({
        totalRecommendations: 12,
        newRecommendations: 2
      });
    } catch (error) {
      console.error('Erreur lors du chargement des recommandations:', error);
    }
  };

  // Fonction pour afficher les badges de notification
  const getNotificationBadge = (count: number) => {
    if (count === 0) return null;
    return (
      <span style={{
        backgroundColor: '#ff4444',
        color: 'white',
        borderRadius: '50%',
        padding: '2px 6px',
        fontSize: '12px',
        marginLeft: '8px',
        fontWeight: 'bold'
      }}>
        {count > 99 ? '99+' : count}
      </span>
    );
  };

  // Affichage de chargement (COMMENTÉ POUR LE TEST)
  // if (loading) {
  //   return (
  //     <div style={{ 
  //       display: 'flex', 
  //       justifyContent: 'center', 
  //       alignItems: 'center', 
  //       height: '100vh',
  //       color: '#f5f5f7'
  //     }}>
  //       Chargement...
  //     </div>
  //   );
  // }

  // Redirection si pas connecté (COMMENTÉ POUR LE TEST)
  // if (!user) {
  //   navigate('/', { replace: true });
  //   return null;
  // }

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

      {/* TEST - CHANGEMENTS VISIBLES */}
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        backgroundColor: 'red',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        zIndex: 9999,
        fontSize: '16px',
        fontWeight: 'bold',
        border: '3px solid yellow'
      }}>
        🔴 TEST - CHANGEMENTS APPLIQUÉS - {Date.now()}
      </div>

      
      <div style={{
        width: '1214px',
        maxWidth: '100%',
        padding: '24px'
      }}>
        {/* Header avec profil intégré */}
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
          
          {/* Profil compact dans le header */}
          {profile && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12,
              padding: '8px 16px',
              backgroundColor: '#111',
              borderRadius: '8px',
              border: '1px solid #333',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}>
              <Avatar 
                email={profile.email} 
                src={profile.avatarUrl} 
                size="small"
                editable={true}
                onImageChange={async (file) => {
                  try {
                    const avatarUrl = await FirestoreService.uploadAvatar(file);
                    await FirestoreService.updateProfile(profile.id, profile.role, { avatarUrl });
                    const updatedProfile = await FirestoreService.getCurrentProfile(profile.id, profile.role);
                    if (updatedProfile) {
                      setProfile(updatedProfile);
                    }
                  } catch (error) {
                    console.error('Erreur lors de l\'upload de l\'avatar:', error);
                  }
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: '120px' }}>
                <span style={{ color: '#f5f5f7', fontSize: '14px', fontWeight: '500' }}>
                  {profile.displayName || (user?.email ? user.email.split('@')[0] : 'Utilisateur')}
                </span>
                <span style={{ color: '#888', fontSize: '12px' }}>
                  Recruteur
                </span>
              </div>
              <button
                onClick={() => navigate('/profile')}
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'transparent',
                  color: '#ffcc00',
                  border: '1px solid #ffcc00',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Profil
              </button>
            </div>
          )}
          
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

          
          <h2 style={{ color: '#ffcc00' }}>Bienvenue {user?.displayName || (user?.email ? user.email.split('@')[0] : 'Utilisateur')}</h2>
          <p>Gérez vos annonces, candidatures et trouvez les meilleurs talents.</p>
          


          {/* Raccourcis rapides */}
          <div style={{ 
            display: 'flex', 
            gap: 12, 
            marginBottom: 24,
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={handleCreateJob}
              style={{
                padding: '12px 20px',
                backgroundColor: '#ffcc00',
                color: '#000',
                border: 'none',
                borderRadius: 4,
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ➕ Créer une annonce
            </button>
            
            <button 
              onClick={() => navigate('/talents')}
              style={{
                padding: '12px 20px',
                backgroundColor: 'transparent',
                color: '#ffcc00',
                border: '1px solid #ffcc00',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🔍 Rechercher des talents
            </button>
          </div>

          {/* Statistiques améliorées */}
          <div style={{ 
            marginBottom: 24, 
            padding: 24, 
            backgroundColor: '#111', 
            borderRadius: 4
          }}>
            <h3 style={{ color: '#ffcc00', marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>
              📊 Vue d'ensemble
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: 20 
            }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#888', margin: '0 0 8px 0', fontSize: '14px' }}>Annonces actives</p>
                <p style={{ color: '#ffcc00', fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
                  {jobStats.activeJobs}
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#888', margin: '0 0 8px 0', fontSize: '14px' }}>Candidatures totales</p>
                <p style={{ color: '#61bfac', fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
                  {jobStats.totalApplications}
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#888', margin: '0 0 8px 0', fontSize: '14px' }}>Talents disponibles</p>
                <p style={{ color: '#f5f5f7', fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
                  {talents.length}
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#888', margin: '0 0 8px 0', fontSize: '14px' }}>Recommandations</p>
                <p style={{ color: '#ffcc00', fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
                  {recommendationStats.totalRecommendations}
                </p>
              </div>
            </div>
          </div>
          
          {/* Cartes fonctionnelles réorganisées par priorité */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: 24, 
            marginTop: 32 
          }}>
            {/* 1. CANDIDATURES (PRIORITÉ MAXIMALE) */}
            <div style={{
              backgroundColor: '#111',
              padding: 20,
              borderRadius: 4,
              display: 'flex',
              flexDirection: 'column',
              height: '200px'
            }}>
              <h3 style={{ color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }}>
                📋 Candidatures ({jobStats.pendingApplications} en attente)
                {getNotificationBadge(jobStats.pendingApplications)}
              </h3>
              <p style={{ color: '#f5f5f7', marginBottom: '16px' }}>
                Gérez les candidatures reçues pour vos annonces
              </p>
              <button 
                onClick={handleViewApplications}
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'transparent',
                  color: '#ffcc00',
                  border: '1px solid #ffcc00',
                  borderRadius: 4,
                  cursor: 'pointer',
                  marginTop: 'auto',
                  width: '140px',
                  textAlign: 'left'
                }}
              >
                Voir les candidatures
              </button>
            </div>

            {/* 2. RECOMMANDATIONS (PRIORITÉ ÉLEVÉE) */}
            <div style={{
              backgroundColor: '#111',
              padding: 20,
              borderRadius: 4,
              display: 'flex',
              flexDirection: 'column',
              height: '200px'
            }}>
              <h3 style={{ color: '#61bfac', marginTop: 0, fontWeight: 500, marginBottom: '16px' }}>
                ⭐ Recommandations ({recommendationStats.newRecommendations} nouvelles)
                {getNotificationBadge(recommendationStats.newRecommendations)}
              </h3>
              <p style={{ color: '#f5f5f7', marginBottom: '16px' }}>
                Talents recommandés par les coaches
              </p>
              <button 
                onClick={() => navigate('/recommendations')}
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'transparent',
                  color: '#61bfac',
                  border: '1px solid #61bfac',
                  borderRadius: 4,
                  cursor: 'pointer',
                  marginTop: 'auto',
                  width: '140px',
                  textAlign: 'left'
                }}
              >
                Voir les recommandations
              </button>
            </div>

            {/* 3. ANNONCES */}
            <div style={{
              backgroundColor: '#111',
              padding: 20,
              borderRadius: 4,
              display: 'flex',
              flexDirection: 'column',
              height: '200px'
            }}>
              <h3 style={{ color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }}>
                📢 Mes Annonces ({jobStats.activeJobs} actives)
              </h3>
              <p style={{ color: '#f5f5f7', marginBottom: '16px' }}>Créez et gérez vos offres d'emploi</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 'auto', flexWrap: 'wrap' }}>
                <button 
                  onClick={handleCreateJob}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: '#ffcc00',
                    border: '1px solid #ffcc00',
                    borderRadius: 4,
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
                    border: '1px solid #ffcc00',
                    borderRadius: 4,
                    cursor: 'pointer',
                    width: '140px',
                    textAlign: 'left'
                  }}
                >
                  Mes annonces
                </button>
              </div>
            </div>

            {/* 4. TALENTS */}
            <div style={{
              backgroundColor: '#111',
              padding: 20,
              borderRadius: 4,
              display: 'flex',
              flexDirection: 'column',
              height: '200px'
            }}>
              <h3 style={{ color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }}>
                👥 Talents Disponibles ({talents.length})
              </h3>
              <p style={{ color: '#f5f5f7', marginBottom: '16px' }}>Découvrez des talents </p>
              <button 
                onClick={() => navigate('/talents')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#ffcc00',
                  border: '1px solid #ffcc00',
                  borderRadius: 4,
                  cursor: 'pointer',
                  marginTop: 'auto',
                  width: '140px',
                  textAlign: 'left'
                }}
              >
                Voir les profils
              </button>
            </div>

            {/* 5. MESSAGES */}
            <div style={{
              backgroundColor: '#111',
              padding: 20,
              borderRadius: 4,
              display: 'flex',
              flexDirection: 'column',
              height: '200px'
            }}>
              <h3 style={{ color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }}>
                💬 Messages
              </h3>
              <p style={{ color: '#f5f5f7', marginBottom: '16px' }}>Communiquez avec les talents et coaches</p>
              <button 
                onClick={handleOpenMessages}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#ffcc00',
                  border: '1px solid #ffcc00',
                  borderRadius: 4,
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
