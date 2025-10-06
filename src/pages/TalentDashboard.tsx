import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../contexts/AuthContext';
import { FirestoreService, UserProfile } from '../services/firestoreService';
// JobService methods are now in FirestoreService
import Avatar from '../components/Avatar';
import ProfileEditModal from '../components/ProfileEditModal.jsx';
import TalentAgendaView from '../components/TalentAgendaView';
import TalentAppointmentViewer from '../components/TalentAppointmentViewer';
import { useNotifications } from '../components/NotificationManager';
import { useResponsive } from '../components/ResponsiveLayout';

export default function TalentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [activeFilters, setActiveFilters] = useState({
    skills: '',
    location: '',
    contractType: '',
    company: ''
  });
  const isMobile = useResponsive(540);

  // Pagination pour les jobs
  const [jobsCurrentPage, setJobsCurrentPage] = useState(1);
  const JOBS_PER_PAGE = 6;
  
  // Statistiques
  const [stats, setStats] = useState({
    applicationsCount: 0,
    messagesCount: 0,
    unreadMessagesCount: 0,
    recommendationsCount: 0,
    appointmentsCount: 0
  });

  // Redirection si l'utilisateur n'est pas un talent
  useEffect(() => {
    if (user && user.role !== 'talent') {
      navigate(`/dashboard/${user.role}`, { replace: true });
    }
  }, [user, navigate]);

  // Charger le profil et les statistiques
  useEffect(() => {
    if (user) {
      console.log('🚀 TALENT USEEFFECT - User détecté, chargement des données...', user.id);
      loadProfile();
      loadStats();
      console.log('🚀 TALENT USEEFFECT - Appel loadJobs()...');
      loadJobs();
    } else {
      console.log('❌ TALENT USEEFFECT - Pas d\'utilisateur détecté');
    }
  }, [user]);

  // Filtrer les jobs quand les filtres changent
  useEffect(() => {
    applyFilters();
  }, [jobs, activeFilters]);


  // Fermer le menu profil quand on clique à l'extérieur (copié du RecruiterDashboard)
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

  // Réinitialiser la pagination quand les filtres changent
  useEffect(() => {
    setJobsCurrentPage(1);
  }, [activeFilters.skills, activeFilters.location, activeFilters.contractType, activeFilters.company]);

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

  const loadStats = async () => {
    if (!user) return;
    
    try {
      // Charger les candidatures depuis Firestore
      const applications = await FirestoreService.getUserApplications(user.id);
      
      // Charger les messages
      const userMessages = await FirestoreService.getUserMessages(user.id);
      const unreadMessages = userMessages.filter(message => 
        message.type === 'received' && !message.read
      );
      
      // Charger les recommandations
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      
      const recommendationsRef = collection(db, 'recommendations');
      const recommendationsQuery = query(
        recommendationsRef,
        where('talentId', '==', user.id)
      );
      const recommendationsSnapshot = await getDocs(recommendationsQuery);
      
      // Charger les rendez-vous
      const { AppointmentService } = await import('../services/appointmentService');
      const appointmentsResult = await AppointmentService.getTalentAppointments(user.id);
      const appointmentsData = appointmentsResult.success ? appointmentsResult.data || [] : [];
      
      setStats({
        applicationsCount: applications.length,
        messagesCount: userMessages.length,
        unreadMessagesCount: unreadMessages.length,
        recommendationsCount: recommendationsSnapshot.size,
        appointmentsCount: appointmentsData.length
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      // En cas d'erreur, on garde les valeurs par défaut (0)
      setStats({
        applicationsCount: 0,
        messagesCount: 0,
        unreadMessagesCount: 0,
        recommendationsCount: 0,
        appointmentsCount: 0
      });
    }
  };

  const loadJobs = async () => {
    if (!user) return;
    try {
      console.log('🔥 CHARGEMENT JOBS...');
      // Charger toutes les offres d'emploi disponibles avec JobService
      const jobsResult = await FirestoreService.getAllActiveJobs();
      console.log('📊 RÉSULTAT JOBS:', jobsResult);
      
      if (jobsResult.success && jobsResult.data) {
        console.log('✅ JOBS RÉCUPÉRÉS:', jobsResult.data.length, jobsResult.data);
        setJobs(jobsResult.data);
        setFilteredJobs(jobsResult.data);
      } else {
        console.log('⚠️ Aucun job ou erreur:', jobsResult);
        setJobs([]);
        setFilteredJobs([]);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des jobs:', error);
      setJobs([]);
      setFilteredJobs([]);
    }
  };

  // Fonction pour appliquer les filtres
  const applyFilters = () => {
    let filtered = jobs;

    // Filtre par compétences
    if (activeFilters.skills) {
      filtered = filtered.filter(job => {
        if (!job.skills) return false;
        
        const jobSkills = Array.isArray(job.skills) 
          ? job.skills.map((skill: string) => skill.toLowerCase())
          : job.skills.toLowerCase().split(/[,\s]+/).filter((skill: string) => skill.trim());
          
        return jobSkills.some((skill: string) => 
          skill.includes(activeFilters.skills.toLowerCase()) || 
          activeFilters.skills.toLowerCase().includes(skill)
        );
      });
    }

    // Filtre par localisation
    if (activeFilters.location) {
      filtered = filtered.filter(job => 
        job.location && job.location.toLowerCase().includes(activeFilters.location.toLowerCase())
      );
    }

    // Filtre par type de contrat
    if (activeFilters.contractType) {
      filtered = filtered.filter(job => 
        job.contractType === activeFilters.contractType
      );
    }

    // Filtre par entreprise
    if (activeFilters.company) {
      filtered = filtered.filter(job => 
        job.company && job.company.toLowerCase().includes(activeFilters.company.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  };

  // Fonctions pour gérer les filtres
  const handleFilterChange = (filterType: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilter = (filterType: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: ''
    }));
  };

  // Fonction pour calculer le temps écoulé
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return 'Hier';
    return `Il y a ${Math.floor(diffInHours / 24)}j`;
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
      console.log('🔍 Test: Tentative de déconnexion...');
      console.log('🔍 Test: User actuel:', user);
      console.log('🔍 Test: Fonction logout disponible:', typeof logout);
      
      await logout();
      console.log('✅ Test: Déconnexion réussie, redirection...');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('❌ Test: Erreur lors de la déconnexion:', error);
      // Afficher une notification d'erreur à l'utilisateur
      showNotification({
        type: 'error',
        title: 'Erreur de déconnexion',
        message: 'Impossible de se déconnecter. Veuillez réessayer.'
      });
    }
  };

  const handleEditProfile = () => {
    console.log('🔍 Test: handleEditProfile appelée');
    console.log('🔍 Test: isEditModalOpen avant:', isEditModalOpen);
    setIsEditModalOpen(true);
    console.log('🔍 Test: isEditModalOpen après setState');
  };

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleProfileAction = (action: string) => {
    console.log('🔍 handleProfileAction called with:', action);
    setShowProfileMenu(false);
    switch (action) {
      case 'profile':
        console.log('🔍 Navigating to profile page');
        navigate('/profile');
        break;
      case 'edit':
        console.log('🔍 Opening edit modal');
        setIsEditModalOpen(true);
        break;
      case 'logout':
        console.log('🔍 Handling logout');
        handleLogout();
        break;
      default:
        console.log('🔍 Unknown action:', action);
    }
  };

  const handleViewProfile = () => {
    console.log('🔍 Test: handleViewProfile appelée');
    console.log('🔍 Test: Navigation vers /profile');
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

  const handleViewCoaches = () => {
    navigate('/talent/coaches');
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
        width: '100%',
        maxWidth: '1200px',
        padding: isMobile ? '10px' : !isMobile ? '15px' : '20px'
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
            <h1 style={{ 
              margin: 0, 
              fontSize: isMobile ? '18px' : '20px', 
              fontWeight: '600',
              color: '#f5f5f7'
            }}>
              Dashboard Talent
            </h1>
            <p style={{ 
              margin: 0, 
              color: '#888', 
              fontSize: isMobile ? '11px' : '12px' 
            }}>
              Gérez votre carrière et vos opportunités
            </p>
          </div>
          
          {/* Menu profil déroulant */}
          <div style={{ 
            position: 'relative'
          }} data-profile-menu>
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
                border: 'none',
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
          gridTemplateColumns: isMobile 
            ? '1fr' 
            : !isMobile 
              ? 'repeat(auto-fit, minmax(250px, 1fr))' 
              : 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: isMobile ? '12px' : '20px',
          marginBottom: '30px',
          padding: isMobile ? '0 10px' : '0'
        }}>
          
          <div style={{
            padding: isMobile ? '15px' : '20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            border: 'none'
          }} onClick={handleViewApplications}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ffcc00' }}>Candidatures ({stats.applicationsCount})</h3>
            <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
              Consultez et gérez vos candidatures
            </p>
          </div>

          <div style={{
            padding: isMobile ? '15px' : '20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }} onClick={() => setIsCalendarOpen(true)}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ffcc00' }}>Agenda de Coaching</h3>
            <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
              Consultez l'agenda et réservez votre créneau
            </p>
          </div>

          <div style={{
            padding: isMobile ? '15px' : '20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }} onClick={() => setIsAppointmentsOpen(true)}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ffcc00' }}>Mes Rendez-vous ({stats.appointmentsCount})</h3>
            <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
              Consultez vos rendez-vous et leur statut
            </p>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }} onClick={() => navigate('/talent/recommendations')}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ffcc00' }}>Recommandations ({stats.recommendationsCount})</h3>
            <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
              Recommandations envoyées par vos coaches
            </p>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }} onClick={handleViewMessages}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ffcc00' }}>
              Messages {stats.unreadMessagesCount > 0 ? `(${stats.unreadMessagesCount} non lu${stats.unreadMessagesCount > 1 ? 's' : ''})` : ''}
            </h3>
            <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
              Communiquez avec les recruteurs et coaches
            </p>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }} onClick={handleViewCoaches}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ffcc00' }}>Profils des Coaches</h3>
            <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
              Découvrez nos coaches et leurs spécialités
            </p>
          </div>

        </div>

        {/* Section "Opportunités récentes" avec filtre sidebar */}
        <div style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '4px',
          padding: '20px',
          paddingLeft: '0px'
        }}>
          
          {/* Header avec bouton filtre et titre */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: isMobile ? '12px' : '0',
            marginBottom: isMobile ? '15px' : '20px',
            paddingLeft: isMobile ? '0' : !isMobile ? '10px' : '20px'
          }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center', 
              gap: isMobile ? '8px' : '16px' 
            }}>
              {/* Bouton filtre toggle */}
              <div
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '8px',
                  padding: isMobile ? '10px 16px' : '8px 12px',
                  paddingLeft: isMobile ? '16px' : '16px',
                  backgroundColor: '#333',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  minWidth: isMobile ? '140px' : 'auto'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#333'}
              >
                <div style={{
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ width: '100%', height: '2px', backgroundColor: '#ffcc00' }}></div>
                  <div style={{ width: '75%', height: '2px', backgroundColor: '#ffcc00' }}></div>
                  <div style={{ width: '50%', height: '2px', backgroundColor: '#ffcc00' }}></div>
                </div>
                <span style={{ 
                  fontSize: isMobile ? '13px' : '14px', 
                  color: '#ffcc00' 
                }}>
                  {showFilters ? 'Fermer' : 'Filtrer'}
                </span>
              </div>
              
              {/* Titre "Opportunités récentes" - fixe */}
              <div style={{ 
                textAlign: isMobile ? 'center' : 'left'
              }}>
                <h2 style={{ 
                  margin: 0, 
                  color: '#ffcc00',
                  fontSize: isMobile ? '16px' : !isMobile ? '18px' : '20px'
                }}>
                  Opportunités récentes ({filteredJobs.length})
                </h2>
              </div>
            </div>
            
            {/* Pagination */}
            <span style={{ 
              fontSize: isMobile ? '12px' : '14px', 
              color: '#888',
              alignSelf: isMobile ? 'center' : 'auto'
            }}>Page 1</span>
          </div>

          <div style={{ width: '100%' }}>
            {/* Filtres au-dessus - comme RecruiterDashboard */}
            {showFilters && (
              <div style={{
                width: '100%',
                backgroundColor: '#1a1a1a',
                borderRadius: '4px',
                padding: isMobile ? '15px' : '20px',
                marginBottom: '20px'
              }}>
                {/* Filtres en grid sur toute la largeur */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: isMobile 
                    ? '1fr' 
                    : !isMobile 
                      ? 'repeat(2, 1fr)' 
                      : 'repeat(4, 1fr)',
                  gap: isMobile ? '12px' : '16px' 
                }}>
                      
                      {/* Filtre par compétences */}
                      <div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <span style={{ fontSize: '14px', color: '#f5f5f7', fontWeight: '500' }}>
                            Compétences
                          </span>
                          {activeFilters.skills && (
                            <button
                              onClick={() => clearFilter('skills')}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ff6b6b',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Effacer
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="ex: React, Python..."
                          value={activeFilters.skills}
                          onChange={(e) => handleFilterChange('skills', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            backgroundColor: '#333',
                            color: '#f5f5f7',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        />
                      </div>

                      {/* Filtre par localisation */}
                      <div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <span style={{ fontSize: '14px', color: '#f5f5f7', fontWeight: '500' }}>
                            Localisation
                          </span>
                          {activeFilters.location && (
                            <button
                              onClick={() => clearFilter('location')}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ff6b6b',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Effacer
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="ex: Paris, Remote..."
                          value={activeFilters.location}
                          onChange={(e) => handleFilterChange('location', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            backgroundColor: '#333',
                            color: '#f5f5f7',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        />
                      </div>

                      {/* Filtre par type de contrat */}
                      <div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <span style={{ fontSize: '14px', color: '#f5f5f7', fontWeight: '500' }}>
                            Type de contrat
                          </span>
                          {activeFilters.contractType && (
                            <button
                              onClick={() => clearFilter('contractType')}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ff6b6b',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Effacer
                            </button>
                          )}
                        </div>
                        <select
                          value={activeFilters.contractType}
                          onChange={(e) => handleFilterChange('contractType', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            backgroundColor: '#333',
                            color: '#f5f5f7',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        >
                          <option value="">Tous types</option>
                          <option value="CDI">CDI</option>
                          <option value="CDD">CDD</option>
                          <option value="Freelance">Freelance</option>
                          <option value="Préstation">Préstation</option>
                          <option value="Stage">Stage</option>
                        </select>
                      </div>
                      
                    </div>

                    {/* Bouton Reset */}
                    <button
                      onClick={() => setActiveFilters({ skills: '', location: '', contractType: '', company: '' })}
                      style={{
                        width: '100%',
                        padding: '8px',
                        marginTop: '16px',
                        backgroundColor: '#333',
                        color: '#f5f5f7',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#333'}
                    >
                      Réinitialiser
                    </button>
              </div>
            )}

            {/* Contenu principal avec cartes */}
            <div style={{ 
              width: '100%',
              padding: isMobile ? '0 5px' : !isMobile ? '0 10px' : '0'
            }}>

            {/* Logique de pagination pour les jobs */}
            {(() => {
              const totalJobsPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
              const startJobsIndex = (jobsCurrentPage - 1) * JOBS_PER_PAGE;
              const endJobsIndex = startJobsIndex + JOBS_PER_PAGE;
              const paginatedJobs = filteredJobs.slice(startJobsIndex, endJobsIndex);

              return (
                <div>
                  {/* Grille des opportunités */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile 
                ? '1fr' 
                : !isMobile 
                  ? 'repeat(auto-fit, minmax(280px, 1fr))' 
                  : 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: isMobile ? '12px' : '16px',
              padding: isMobile ? '0 10px' : '0'
            }}>
              {paginatedJobs.map((job, index) => (
                <div
                  key={job.id || index}
                  style={{
                    padding: '20px',
                    backgroundColor: '#111',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#ffcc00';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#333';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 4px 0', color: '#ffcc00', fontSize: '16px' }}>
                        {job.title || 'Titre non disponible'}
                      </h3>
                      <div style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>
                        {job.company || 'Entreprise'} • {job.location || 'Localisation'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {job.contractType || 'Type de contrat'} • {job.createdAt ? getTimeAgo(new Date(job.createdAt.seconds * 1000)) : 'Récent'}
                      </div>
                    </div>
                    <div style={{
                      backgroundColor: '#ffcc00',
                      color: '#0a0a0a',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>
                      Disponible
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '13px', color: '#ccc', lineHeight: '1.4', marginBottom: '12px' }}>
                    {job.description ? (job.description.length > 80 ? job.description.substring(0, 80) + '...' : job.description) : 'Description non disponible'}
                  </div>
                  
                  {job.skills && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {(Array.isArray(job.skills) ? job.skills : job.skills.split(',')).slice(0, 3).map((skill: any, skillIndex: number) => (
                        <span
                          key={skillIndex}
                          style={{
                            padding: '2px 6px',
                            backgroundColor: '#333',
                            color: '#ffcc00',
                            borderRadius: '4px',
                            fontSize: '10px'
                          }}
                        >
                          {typeof skill === 'string' ? skill.trim() : skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Message si aucune opportunité */}
            {filteredJobs.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#888'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ color: '#f5f5f7', marginBottom: '8px' }}>Aucune opportunité trouvée</h3>
                <p>Essayez de modifier vos critères de recherche</p>
              </div>
            )}

                  {/* Interface de pagination pour les jobs */}
                  {filteredJobs.length > 0 && totalJobsPages > 1 && (
                    <div id="jobs-section" style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px',
                      marginTop: '40px',
                      padding: '20px 0'
                    }}>
                      {/* Bouton Précédent */}
                      <button
                        onClick={() => {
                          if (jobsCurrentPage > 1) {
                            setJobsCurrentPage(jobsCurrentPage - 1);
                            // Scroll vers la section des jobs
                            document.getElementById('jobs-section')?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'start'
                            });
                          }
                        }}
                        disabled={jobsCurrentPage === 1}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: jobsCurrentPage === 1 ? '#333' : '#007bff',
                          color: jobsCurrentPage === 1 ? '#666' : 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: jobsCurrentPage === 1 ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          minWidth: '80px'
                        }}
                      >
                        Précédent
                      </button>

                      {/* Numéros de pages */}
                      {Array.from({ length: totalJobsPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => {
                            setJobsCurrentPage(page);
                            // Scroll vers la section des jobs
                            document.getElementById('jobs-section')?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'start'
                            });
                          }}
                          style={{
                            padding: '10px 12px',
                            backgroundColor: page === jobsCurrentPage ? '#007bff' : '#333',
                            color: page === jobsCurrentPage ? 'white' : '#ccc',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            minWidth: '40px',
                            fontWeight: page === jobsCurrentPage ? 'bold' : 'normal'
                          }}
                        >
                          {page}
                        </button>
                      ))}

                      {/* Bouton Suivant */}
                      <button
                        onClick={() => {
                          if (jobsCurrentPage < totalJobsPages) {
                            setJobsCurrentPage(jobsCurrentPage + 1);
                            // Scroll vers la section des jobs
                            document.getElementById('jobs-section')?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'start'
                            });
                          }
                        }}
                        disabled={jobsCurrentPage === totalJobsPages}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: jobsCurrentPage === totalJobsPages ? '#333' : '#007bff',
                          color: jobsCurrentPage === totalJobsPages ? '#666' : 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: jobsCurrentPage === totalJobsPages ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          minWidth: '80px'
                        }}
                      >
                        Suivant
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {user && (
        <ProfileEditModal
          profile={user}
          isOpen={isEditModalOpen}
          onClose={() => {
            console.log('🔍 Test: Fermeture de ProfileEditModal');
            setIsEditModalOpen(false);
          }}
          onSave={handleSaveProfile}
        />
      )}

      {/* Agenda de coaching */}
      {isCalendarOpen && (
        <TalentAgendaView onClose={() => setIsCalendarOpen(false)} />
      )}

      {/* Mes rendez-vous */}
      {isAppointmentsOpen && (
        <TalentAppointmentViewer onClose={() => setIsAppointmentsOpen(false)} />
      )}
    </div>
  );
}
