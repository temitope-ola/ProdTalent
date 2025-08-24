import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../contexts/AuthContext';
import { FirestoreService, UserProfile } from '../services/firestoreService';
import Avatar from '../components/Avatar';
import CoachAvailabilityManager from '../components/CoachAvailabilityManager';
import CoachAppointmentManager from '../components/CoachAppointmentManager';
import CoachRecommendationManager from '../components/CoachRecommendationManager';
import { useNotifications } from '../components/NotificationManager';
import EmailJSConfig from '../components/EmailJSConfig';


export default function CoachDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [talents, setTalents] = useState<UserProfile[]>([]);
  const [recruteurs, setRecruteurs] = useState<UserProfile[]>([]);
  const [isAgendaOpen, setIsAgendaOpen] = useState(false);
  const [isAppointmentManagerOpen, setIsAppointmentManagerOpen] = useState(false);
  const [isRecommendationManagerOpen, setIsRecommendationManagerOpen] = useState(false);
  const [isEmailJSConfigOpen, setIsEmailJSConfigOpen] = useState(false);
  const [lastAppointmentCount, setLastAppointmentCount] = useState(0);
  const [emailJSConfigured, setEmailJSConfigured] = useState(false);

  const [loading, setLoading] = useState(false);

  // Redirection si l'utilisateur n'est pas un coach
  useEffect(() => {
    if (user && user.role !== 'coach') {
      navigate(`/dashboard/${user.role}`, { replace: true });
    }
  }, [user, navigate]);

  // Charger le profil et les données
  useEffect(() => {
    if (user) {
      loadProfile();
      loadTalents();
      loadRecruteurs();
    }
  }, [user]);

  // Vérifier les nouveaux rendez-vous toutes les 30 secondes
  useEffect(() => {
    if (!user) return;
    
    // Vérification initiale
    const initialCheck = async () => {
      try {
        const { AppointmentService } = await import('../services/appointmentService');
        const result = await AppointmentService.getCoachAppointments(user.id);
        if (result.success && result.data) {
          setLastAppointmentCount(result.data.length);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification initiale:', error);
      }
    };
    
    initialCheck();
    
    // Vérification périodique
    const interval = setInterval(checkNewAppointments, 30000); // 30 secondes
    
    return () => clearInterval(interval);
  }, [user, lastAppointmentCount]);

  // Vérifier si EmailJS est configuré
  useEffect(() => {
    const checkEmailJSConfig = () => {
      const savedConfig = localStorage.getItem('emailjs_config');
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          const isConfigured = config.publicKey && config.serviceId && 
                              config.templates?.coachingReservation && 
                              config.templates?.appointmentUpdate;
          setEmailJSConfigured(isConfigured);
        } catch (error) {
          setEmailJSConfigured(false);
        }
      } else {
        setEmailJSConfigured(false);
      }
    };
    
    checkEmailJSConfig();
    // Vérifier à chaque fois que la page se charge
    window.addEventListener('storage', checkEmailJSConfig);
    
    return () => window.removeEventListener('storage', checkEmailJSConfig);
  }, []);

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

  const loadRecruteurs = async () => {
    if (!user) return;
    try {
      const recruteursList = await FirestoreService.getAllRecruteurs();
      setRecruteurs(recruteursList);
    } catch (error) {
      console.error('Erreur lors du chargement des recruteurs:', error);
    }
  };

  // Vérifier les nouveaux rendez-vous
  const checkNewAppointments = async () => {
    if (!user) return;
    try {
      const { AppointmentService } = await import('../services/appointmentService');
      const result = await AppointmentService.getCoachAppointments(user.id);
      if (result.success && result.data) {
        const currentCount = result.data.length;
        if (currentCount > lastAppointmentCount && lastAppointmentCount > 0) {
          const newAppointments = result.data.slice(lastAppointmentCount);
          newAppointments.forEach(appointment => {
            if (appointment.status === 'en_attente') {
              showNotification({
                type: 'info',
                title: 'Nouveau rendez-vous',
                message: `${appointment.talentName} a réservé un créneau le ${appointment.date} à ${appointment.time}`
              });
            }
          });
        }
        setLastAppointmentCount(currentCount);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des nouveaux rendez-vous:', error);
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
        color: '#ffcc00'
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

  const handleViewTalents = () => {
    navigate('/coach/talents');
  };

  const handleViewRecruteurs = () => {
    navigate('/coach/recruteurs');
  };



  const handleScheduleSession = () => {
    showNotification({
      type: 'info',
      title: 'Fonctionnalité à venir',
      message: 'La planification de session sera bientôt disponible'
    });
    // Ici vous pourriez ouvrir une modale de planification
  };

  const handleCreateRecommendation = () => {
    setIsRecommendationManagerOpen(true);
  };

  const handleOpenMessages = () => {
    navigate('/coach/messages');
  };



  const handleViewJobs = () => {
    navigate('/jobs');
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
            <span style={{ color: '#ffcc00', fontSize: '14px', marginTop: '4px' }}>Coach Dashboard</span>
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
          <p style={{ color: '#f5f5f7' }}>Accompagnez les talents et connectez-vous avec les recruteurs.</p>
          
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
              </div>
              {profile.bio && (
                <p style={{ color: '#f5f5f7', marginTop: '12px' }}>
                  <strong>Bio:</strong> {profile.bio}
                </p>
              )}
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
                        <h3 style={{ color: '#ffcc00', marginTop: 0 }}>Statistiques</h3>
            <p style={{ color: '#f5f5f7', fontWeight: 500 }}>Talents disponibles: {talents.length}</p>
            <p style={{ color: '#f5f5f7', fontWeight: 500 }}>Recruteurs actifs: {recruteurs.length}</p>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: 24, 
            marginTop: 32 
          }}>
            {/* Mes talents */}
            <div style={{
              backgroundColor: '#111',
              padding: 20,
              borderRadius: 4,
              border: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              height: '200px'
            }}>
              <h3 style={{ color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }}>Mes Talents</h3>
              <p style={{ color: '#f5f5f7', marginBottom: '16px' }}>Gérez vos talents accompagnés ({talents.length} disponibles)</p>
              <button 
                onClick={handleViewTalents}
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
                Voir mes talents
              </button>
            </div>

            {/* Mes recruteurs */}
            <div style={{
              backgroundColor: '#111',
              padding: 20,
              borderRadius: 4,
              border: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              height: '200px'
            }}>
              <h3 style={{ color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }}>Mes Recruteurs</h3>
              <p style={{ color: '#f5f5f7', marginBottom: '16px' }}>Gérez vos recruteurs partenaires ({recruteurs.length} actifs)</p>
              <button 
                onClick={handleViewRecruteurs}
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
                Voir mes recruteurs
              </button>
            </div>

            {/* Sessions de coaching */}
            <div style={{
              backgroundColor: '#111',
              padding: 20,
              borderRadius: 4,
              border: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              height: '200px'
            }}>
              <h3 style={{ color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }}>Sessions de Coaching</h3>
              <p style={{ color: '#f5f5f7', marginBottom: '16px' }}>Planifiez et gérez vos sessions</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 'auto', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => setIsAgendaOpen(true)}
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
                  Configurer l'agenda
                </button>
                <button 
                  onClick={() => setIsAppointmentManagerOpen(true)}
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
                  Gérer les rendez-vous
                </button>
              </div>
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
              <p style={{ color: '#f5f5f7', marginBottom: '16px' }}>Recommandez vos talents aux recruteurs</p>
              <button 
                onClick={handleCreateRecommendation}
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
                Créer une recommandation
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
              <p style={{ color: '#f5f5f7', marginBottom: '16px' }}>Communiquez avec les talents et recruteurs</p>
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

            {/* Configuration EmailJS */}
            <div style={{
              backgroundColor: '#111',
              padding: 20,
              borderRadius: 4,
              border: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              height: '200px'
            }}>
              <h3 style={{ color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }}>Notifications Email</h3>
              <p style={{ color: '#f5f5f7', marginBottom: '16px' }}>Configurez les notifications par email pour les rendez-vous</p>
                              <button 
                  onClick={() => setIsEmailJSConfigOpen(true)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: emailJSConfigured ? '#61bfac' : 'transparent',
                    color: emailJSConfigured ? '#000' : '#ffcc00',
                    border: '0.5px solid #ffcc00',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: 'auto',
                    width: '140px',
                    textAlign: 'left',
                    position: 'relative'
                  }}
                >
                  {emailJSConfigured ? '✅ EmailJS Configuré' : 'Configurer EmailJS'}
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
              <p style={{ color: '#f5f5f7', marginBottom: '16px' }}>Découvrez les dernières offres d'emploi disponibles</p>
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
          </div>
        </section>

        {/* Modal de gestion des disponibilités */}
        {isAgendaOpen && (
          <CoachAvailabilityManager onClose={() => setIsAgendaOpen(false)} />
        )}

        {/* Modal de gestion des rendez-vous */}
        {isAppointmentManagerOpen && (
          <CoachAppointmentManager onClose={() => setIsAppointmentManagerOpen(false)} />
        )}

        {/* Modal de gestion des recommandations */}
        {isRecommendationManagerOpen && (
          <CoachRecommendationManager 
            isOpen={isRecommendationManagerOpen} 
            onClose={() => setIsRecommendationManagerOpen(false)} 
          />
        )}

        {/* Modal de configuration EmailJS */}
        {isEmailJSConfigOpen && (
          <EmailJSConfig onClose={() => {
            setIsEmailJSConfigOpen(false);
            // Rafraîchir l'état de la configuration
            const savedConfig = localStorage.getItem('emailjs_config');
            if (savedConfig) {
              try {
                const config = JSON.parse(savedConfig);
                const isConfigured = config.publicKey && config.serviceId && 
                                    config.templates?.coachingReservation && 
                                    config.templates?.appointmentUpdate;
                setEmailJSConfigured(isConfigured);
              } catch (error) {
                setEmailJSConfigured(false);
              }
            } else {
              setEmailJSConfigured(false);
            }
          }} />
        )}

      </div>
    </div>
  );
}
