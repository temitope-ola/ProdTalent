import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../contexts/AuthContext';
import { FirestoreService, UserProfile } from '../services/firestoreService';
import Avatar from '../components/Avatar';
import ProfileEditModal from '../components/ProfileEditModal';
import TalentAgendaView from '../components/TalentAgendaView';
import TalentAppointmentManager from '../components/TalentAppointmentManager';
import { useNotifications } from '../components/NotificationManager';



export default function TalentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(false);


  // Redirection si l'utilisateur n'est pas un talent
  useEffect(() => {
    if (user && user.role !== 'talent') {
      navigate(`/dashboard/${user.role}`, { replace: true });
    }
  }, [user, navigate]);

  // Charger le profil
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let userProfile = await FirestoreService.getCurrentProfile(user.id, user.role);
      
      // Si le profil n'existe pas, le créer
      if (!userProfile) {
        const created = await FirestoreService.createProfile(user.id, user.email, user.role);
        if (created) {
          userProfile = await FirestoreService.getCurrentProfile(user.id, user.role);
        }
      }
      
      setProfile(userProfile);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setLoading(false);
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

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  const handleSaveProfile = async (updatedProfile: UserProfile) => {
    console.log('Profil mis à jour:', updatedProfile);
    setProfile(updatedProfile);
    // Recharger le profil depuis Firestore pour s'assurer que tout est à jour
    await loadProfile();
  };



  const handleViewJobs = () => {
    navigate('/jobs');
  };

  const handleViewApplications = () => {
    navigate('/my-applications');
  };

  const handleViewMessages = () => {
    navigate('/talent/messages');
  };

  const handleOpenMessages = () => {
    showNotification({
      type: 'info',
      title: 'Fonctionnalité à venir',
      message: 'Les messages seront bientôt disponibles'
    });
    // Ici vous pourriez ouvrir un chat ou naviguer vers une page de messages
  };

  const handleConnectToRecruiters = () => {
    showNotification({
      type: 'info',
      title: 'Fonctionnalité à venir',
      message: 'La connexion aux recruteurs sera bientôt disponible'
    });
    // Ici vous pourriez naviguer vers une page de recherche de recruteurs
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
            <span style={{ color: '#ffcc00', fontSize: '14px', marginTop: '4px' }}>Talent Dashboard</span>
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
          <p>Gérez votre profil, vos compétences et vos opportunités.</p>
          

          
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
                      onClick={handleViewProfile}
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
              </div>
              {profile && (
                <div style={{ padding: '0 20px 20px 20px' }}>
                  {profile.bio && (
                    <p style={{ color: '#f5f5f7', marginTop: '12px', marginBottom: '8px' }}>
                      <strong>Bio:</strong> {profile.bio}
                    </p>
                  )}
                  
                  {/* Liens sociaux */}
                  {(profile.linkedinUrl || profile.githubUrl) && (
                    <div style={{ marginTop: '12px' }}>
                      <p style={{ color: '#888', margin: '0 0 8px 0', fontSize: '14px' }}>
                        <strong>Liens:</strong>
                      </p>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {profile.linkedinUrl && (
                          <a 
                            href={profile.linkedinUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                              color: '#ffcc00',
                              textDecoration: 'none',
                              fontSize: '14px'
                            }}
                          >
                            🔗 LinkedIn
                          </a>
                        )}
                        {profile.githubUrl && (
                          <a 
                            href={profile.githubUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                              color: '#ffcc00',
                              textDecoration: 'none',
                              fontSize: '14px'
                            }}
                          >
                            🐙 GitHub
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* CV */}
                  {profile.cvUrl && (
                    <div style={{ marginTop: '12px' }}>
                      <a 
                        href={profile.cvUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          color: '#ffcc00',
                          textDecoration: 'none',
                          fontSize: '14px'
                        }}
                      >
                        📄 Voir mon CV
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: 24, 
            marginTop: 32 
          }}>
            {/* Profil */}
            <div style={{
              backgroundColor: '#111',
              padding: 20,
              borderRadius: 4,
              border: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              height: '200px'
            }}>
              <h3 style={{ color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }}>Compléter le Profil</h3>
              <p style={{ color: '#f5f5f7', marginBottom: '16px' }}>Complétez votre profil pour être visible des recruteurs</p>
              <button 
                onClick={handleEditProfile}
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
                Éditer le profil
              </button>
            </div>

            {/* Missions */}


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
              <p style={{ color: '#f5f5f7', marginBottom: '16px' }}>Communiquez avec les recruteurs et coaches</p>
              <button 
                onClick={handleViewMessages}
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
                Voir mes messages
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
              <h3 style={{ color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }}>Mes Recommandations</h3>
              <p style={{ color: '#f5f5f7', marginBottom: '16px' }}>Recommandations envoyées par vos coaches</p>
              <button 
                onClick={() => navigate('/talent/recommendations')}
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
                Voir mes recommandations
              </button>
            </div>

                                     {/* Agenda de Coaching */}
                   <div style={{
                     backgroundColor: '#111',
                     padding: 20,
                     borderRadius: 4,
                     border: 'transparent',
                     display: 'flex',
                     flexDirection: 'column',
                     height: '200px'
                   }}>
                     <h3 style={{ color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }}>Agenda de Coaching</h3>
                     <p style={{ color: '#f5f5f7', marginBottom: '16px' }}>Consultez l'agenda et réservez votre créneau</p>
                     <button
                       onClick={() => setIsCalendarOpen(true)}
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
                       Voir l'agenda
                     </button>
                   </div>

                   {/* Mes Rendez-vous */}
                   <div style={{
                     backgroundColor: '#111',
                     padding: 20,
                     borderRadius: 4,
                     border: 'transparent',
                     display: 'flex',
                     flexDirection: 'column',
                     height: '200px'
                   }}>
                     <h3 style={{ color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }}>Mes Rendez-vous</h3>
                     <p style={{ color: '#f5f5f7', marginBottom: '16px' }}>Consultez vos rendez-vous et leur statut</p>
                     <button
                       onClick={() => setIsAppointmentsOpen(true)}
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
                       Voir mes rendez-vous
                     </button>
                   </div>

            {/* Connexion aux recruteurs */}
            <div style={{
              backgroundColor: '#111',
              padding: 20,
              borderRadius: 4,
              border: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              height: '200px'
            }}>
              <h3 style={{ color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }}>Recruteurs</h3>
              <p style={{ color: '#f5f5f7', marginBottom: '16px' }}>Trouvez et connectez-vous avec des recruteurs</p>
              <button 
                onClick={handleConnectToRecruiters}
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
                Voir les recruteurs
              </button>
            </div>

            {/* Offres d'emploi */}
            <div style={{
              backgroundColor: '#111',
              padding: 20,
              borderRadius: 4,
              border: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              height: '200px'
            }}>
              <h3 style={{ color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }}>Offres d'emploi</h3>
              <p style={{ color: '#f5f5f7', marginBottom: '16px' }}>Découvrez les opportunités disponibles</p>
              <button 
                onClick={handleViewJobs}
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
                Voir les offres
              </button>
            </div>

            {/* Mes candidatures */}
            <div style={{
              backgroundColor: '#111',
              padding: 20,
              borderRadius: 4,
              border: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              height: '200px'
            }}>
              <h3 style={{ color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }}>Mes candidatures</h3>
              <p style={{ color: '#f5f5f7', marginBottom: '16px' }}>Suivez l'état de vos candidatures</p>
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
                Voir mes candidatures
              </button>
            </div>
          </div>
        </section>
        
        {profile && (
          <ProfileEditModal
            profile={profile}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveProfile}
          />
        )}

                            {/* Agenda de coaching */}
              {isCalendarOpen && (
                <TalentAgendaView onClose={() => setIsCalendarOpen(false)} />
              )}

              {/* Mes rendez-vous */}
              {isAppointmentsOpen && (
                <TalentAppointmentManager onClose={() => setIsAppointmentsOpen(false)} />
              )}
      </div>
    </div>
  );
}
