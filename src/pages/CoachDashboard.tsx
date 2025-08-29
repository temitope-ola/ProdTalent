import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../contexts/AuthContext';
import { FirestoreService, UserProfile } from '../services/firestoreService';
import Avatar from '../components/Avatar';
import CoachAvailabilityManager from '../components/CoachAvailabilityManager';
import CoachAppointmentManager from '../components/CoachAppointmentManager';
import CoachRecommendationManager from '../components/CoachRecommendationManager';
import SimpleCalendarManager from '../components/SimpleCalendarManager';
import { useNotifications } from '../components/NotificationManager';


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
  const [isGoogleCalendarOpen, setIsGoogleCalendarOpen] = useState(false);
  const [lastAppointmentCount, setLastAppointmentCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Statistiques
  const [stats, setStats] = useState({
    jobsCount: 0,
    recruteursCount: 0,
    talentsCount: 0,
    recommendationsCount: 0,
    messagesCount: 0,
    appointmentsCount: 0
  });

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
      loadStats();
    }
  }, [user]);

  // Fermer le menu profil quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-profile-menu]')) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

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

  const loadStats = async () => {
    if (!user) return;
    
    try {
      // Charger les offres d'emploi
      const allJobs = await FirestoreService.getAllJobs();
      
      // Charger les messages
      const userMessages = await FirestoreService.getUserMessages(user.id);
      
      // Charger les recommandations
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      
      const recommendationsRef = collection(db, 'recommendations');
      const recommendationsQuery = query(
        recommendationsRef,
        where('coachId', '==', user.id)
      );
      const recommendationsSnapshot = await getDocs(recommendationsQuery);
      
      // Charger les rendez-vous du coach
      const { AppointmentService } = await import('../services/appointmentService');
      const appointmentsResult = await AppointmentService.getCoachAppointments(user.id);
      const appointmentsData = appointmentsResult.success ? appointmentsResult.data || [] : [];
      
      setStats({
        jobsCount: allJobs.length,
        recruteursCount: recruteurs.length,
        talentsCount: talents.length,
        recommendationsCount: recommendationsSnapshot.size,
        messagesCount: userMessages.length,
        appointmentsCount: appointmentsData.length
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      setStats({
        jobsCount: 0,
        recruteursCount: 0,
        talentsCount: 0,
        recommendationsCount: 0,
        messagesCount: 0,
        appointmentsCount: 0
      });
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

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleProfileAction = (action: string) => {
    setShowProfileMenu(false);
    switch (action) {
      case 'profile':
        navigate('/profile');
        break;
      case 'logout':
        handleLogout();
        break;
    }
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
        width: '100%',
        maxWidth: '1200px',
        padding: '20px'
      }}>
        
        {/* Header avec navigation user-friendly */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '12px 16px',
          backgroundColor: '#1a1a1a',
          borderRadius: '4px'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
              Dashboard Coach
            </h1>
            <p style={{ margin: 0, color: '#888', fontSize: '12px' }}>
              Accompagnez les talents et connectez-vous avec les recruteurs
            </p>
          </div>
          
          {/* Menu profil déroulant */}
          <div style={{ position: 'relative' }} data-profile-menu>
            <div
              onClick={handleProfileClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                backgroundColor: '#333',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#333'}
            >
              <Avatar 
                src={profile?.avatarUrl} 
                alt={user?.email ? user.email.split('@')[0] : 'Utilisateur'}
                size="small"
              />
              <span style={{ fontSize: '13px', color: '#f5f5f7' }}>
                {user?.email ? user.email.split('@')[0] : 'Utilisateur'}
              </span>
              <span style={{ 
                fontSize: '10px', 
                color: '#888',
                transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}>
                ▼
              </span>
            </div>
            
            {/* Menu déroulant */}
            {showProfileMenu && (
              <div data-profile-menu style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '5px',
                backgroundColor: '#1a1a1a',
                borderRadius: '4px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                border: '1px solid #333',
                minWidth: '180px',
                zIndex: 1000
              }}>
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleProfileAction('profile');
                  }}
                  style={{
                    padding: '10px 14px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #333',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
                >
                  <div style={{ fontSize: '13px', color: '#f5f5f7' }}>👤 Mon profil</div>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                    {user?.email}
                  </div>
                </div>
                
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleProfileAction('logout');
                  }}
                  style={{
                    padding: '10px 14px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
                >
                  <div style={{ fontSize: '13px', color: '#f5f5f7' }}>🚪 Se déconnecter</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions principales */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          
          <div style={{
            padding: '20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            border: 'none'
          }} onClick={handleViewJobs}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ffcc00' }}>Offres d'emploi ({stats.jobsCount})</h3>
            <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
              Consultez toutes les offres d'emploi disponibles
            </p>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }} onClick={handleViewRecruteurs}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ffcc00' }}>Recruteurs ({stats.recruteursCount})</h3>
            <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
              Connectez-vous avec les recruteurs actifs
            </p>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }} onClick={handleViewTalents}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ffcc00' }}>Talents ({stats.talentsCount})</h3>
            <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
              Accompagnez et gérez vos talents
            </p>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }} onClick={handleCreateRecommendation}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ffcc00' }}>Recommandations ({stats.recommendationsCount})</h3>
            <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
              Créez et gérez vos recommandations
            </p>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }} onClick={handleOpenMessages}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ffcc00' }}>Messages ({stats.messagesCount})</h3>
            <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
              Communiquez avec talents et recruteurs
            </p>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }} onClick={() => setIsAgendaOpen(true)}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ffcc00' }}>Agenda ({stats.appointmentsCount})</h3>
            <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
              Gérez vos disponibilités et rendez-vous
            </p>
          </div>

        </div>

        {/* Section d'informations simples */}
        <div style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '4px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: '0 0 16px 0', color: '#ffcc00', fontSize: '18px' }}>
            Bienvenue sur votre dashboard coach ! 👋
          </h2>
          <p style={{ color: '#f5f5f7', margin: '0 0 12px 0', fontSize: '14px' }}>
            Gérez facilement vos talents, connectez-vous avec les recruteurs et organisez vos sessions de coaching.
          </p>
          <p style={{ color: '#888', margin: 0, fontSize: '12px' }}>
            Utilisez les cartes ci-dessus pour accéder rapidement à toutes les fonctionnalités.
          </p>
        </div>
      </div>

      {/* Modals existants */}
      {isAgendaOpen && (
        <CoachAvailabilityManager 
          isOpen={isAgendaOpen} 
          onClose={() => setIsAgendaOpen(false)} 
        />
      )}

      {isAppointmentManagerOpen && (
        <CoachAppointmentManager 
          isOpen={isAppointmentManagerOpen} 
          onClose={() => setIsAppointmentManagerOpen(false)} 
        />
      )}

      {isRecommendationManagerOpen && (
        <CoachRecommendationManager 
          isOpen={isRecommendationManagerOpen} 
          onClose={() => setIsRecommendationManagerOpen(false)} 
        />
      )}


      {isGoogleCalendarOpen && (
        <SimpleCalendarManager 
          isOpen={isGoogleCalendarOpen}
          onClose={() => setIsGoogleCalendarOpen(false)}
        />
      )}

    </div>
  );
}
