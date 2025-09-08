import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../contexts/AuthContext';
import { FirestoreService, UserProfile } from '../services/firestoreService';
import { JobService } from '../services/jobService';
import Avatar from '../components/Avatar';
import CoachAppointmentManager from '../components/CoachAppointmentManager';
import CoachAvailabilityManager from '../components/CoachAvailabilityManager';
// import GoogleCalendarManager from '../components/GoogleCalendarManager'; // Désactivé temporairement
import SimpleRecommendationModal from '../components/SimpleRecommendationModal';
import { useNotifications } from '../components/NotificationManager';

export default function CoachDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [showGoogleCalendar, setShowGoogleCalendar] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    skills: '',
    location: '',
    contractType: '',
    company: ''
  });
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  
  // Statistiques
  const [stats, setStats] = useState({
    talentsCount: 0,
    recruteursCount: 0,
    messagesCount: 0,
    appointmentsCount: 0
  });
  
  // Jobs - exactement comme TalentDashboard
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);

  // Redirection si l'utilisateur n'est pas un coach
  useEffect(() => {
    if (user && user.role !== 'coach') {
      navigate(`/dashboard/${user.role}`, { replace: true });
    }
  }, [user, navigate]);

  // Charger le profil 
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

  const loadStats = async () => {
    if (!user) return;
    
    try {
      // Charger les messages
      const userMessages = await FirestoreService.getUserMessages(user.id);
      
      // Charger les recommandations
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      
      
      // Charger les rendez-vous
      const { AppointmentService } = await import('../services/appointmentService');
      const appointmentsResult = await AppointmentService.getCoachAppointments(user.id);
      const appointmentsData = appointmentsResult.success ? appointmentsResult.data || [] : [];
      
      // Charger les talents et recruteurs
      const allTalents = await FirestoreService.getAllTalents();
      const allRecruiters = await FirestoreService.getAllRecruteurs();
      
      setStats({
        talentsCount: allTalents.length,
        recruteursCount: allRecruiters.length,
        messagesCount: userMessages.length,
        appointmentsCount: appointmentsData.length
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      // En cas d'erreur, on garde les valeurs par défaut (0)
      setStats({
        talentsCount: 0,
        recruteursCount: 0,
        messagesCount: 0,
        appointmentsCount: 0
      });
    }
  };

  const loadJobs = async () => {
    if (!user) return;
    try {
      console.log('🔥 CHARGEMENT JOBS...');
      // Charger toutes les offres d'emploi disponibles avec JobService
      const jobsResult = await JobService.getAllActiveJobs();
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

  // Fonction pour filtrer les jobs
  const applyFilters = () => {
    if (!jobs || jobs.length === 0) {
      setFilteredJobs([]);
      return;
    }

    let filtered = [...jobs];

    // Filtre par compétences
    if (activeFilters.skills.trim()) {
      filtered = filtered.filter(job => 
        job.skills?.toLowerCase().includes(activeFilters.skills.toLowerCase()) ||
        job.title?.toLowerCase().includes(activeFilters.skills.toLowerCase()) ||
        job.description?.toLowerCase().includes(activeFilters.skills.toLowerCase())
      );
    }

    // Filtre par localisation
    if (activeFilters.location.trim()) {
      filtered = filtered.filter(job => 
        job.location?.toLowerCase().includes(activeFilters.location.toLowerCase())
      );
    }

    // Filtre par type de contrat
    if (activeFilters.contractType.trim()) {
      filtered = filtered.filter(job => 
        job.contractType?.toLowerCase().includes(activeFilters.contractType.toLowerCase())
      );
    }

    // Filtre par entreprise
    if (activeFilters.company.trim()) {
      filtered = filtered.filter(job => 
        job.company?.toLowerCase().includes(activeFilters.company.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  };

  // Charger le profil et les statistiques
  useEffect(() => {
    if (user) {
      loadProfile();
      loadStats();
      loadJobs();
    }
  }, [user]);

  // Filtrer les jobs quand les filtres changent
  useEffect(() => {
    applyFilters();
  }, [jobs, activeFilters]);

  // Gérer le redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Handlers
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

  const handleOpenMessages = () => {
    navigate('/coach/messages');
  };


  // Redirection si pas connecté
  if (!user) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#f5f5f7',
      padding: '20px',
      display: 'flex',
      justifyContent: 'center'
    }}>
      
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        padding: screenWidth <= 480 ? '10px' : screenWidth <= 768 ? '15px' : '20px'
      }}>
        
        {/* Header - Simple comme RecruiterDashboard.js */}
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
              fontSize: screenWidth <= 480 ? '18px' : '20px', 
              fontWeight: '600',
              color: '#f5f5f7'
            }}>
              Dashboard Coach
            </h1>
            <p style={{ 
              margin: 0, 
              color: '#888', 
              fontSize: screenWidth <= 480 ? '11px' : '12px' 
            }}>
              Accompagnez les talents
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
                alt={user?.email ? user.email.split('@')[0] : 'Coach'}
                size="small"
              />
              <span style={{ fontSize: '13px', color: '#f5f5f7' }}>
                {String(user?.email ? user.email.split('@')[0] : 'Coach')}
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
                    {String(user?.email || '')}
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

        {/* Actions principales - Exactement comme TalentDashboard avec MAX 3 cartes par ligne */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: screenWidth <= 480 
            ? '1fr' 
            : screenWidth <= 768 
              ? 'repeat(2, 1fr)' 
              : 'repeat(3, 1fr)',
          gap: screenWidth <= 480 ? '12px' : '20px',
          marginBottom: '30px',
          padding: screenWidth <= 480 ? '0 10px' : '0'
        }}>
          
          {/* Première ligne - 3 cartes */}
          <div style={{
            padding: screenWidth <= 480 ? '15px' : '20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }} onClick={handleViewRecruteurs}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ffcc00' }}>Recruteurs ({Number(stats.recruteursCount) || 0})</h3>
            <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
              Connectez-vous avec les recruteurs actifs
            </p>
          </div>

          <div style={{
            padding: screenWidth <= 480 ? '15px' : '20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            border: 'none'
          }} onClick={handleViewTalents}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ffcc00' }}>Talents ({Number(stats.talentsCount) || 0})</h3>
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
          }} onClick={() => setIsAvailabilityOpen(true)}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ffcc00' }}>Agenda de Coaching</h3>
            <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
              Consultez l'agenda et réservez votre créneau
            </p>
          </div>

        </div>

        {/* Deuxième ligne - 3 cartes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: screenWidth <= 480 
            ? '1fr' 
            : screenWidth <= 768 
              ? 'repeat(2, 1fr)' 
              : 'repeat(3, 1fr)',
          gap: screenWidth <= 480 ? '12px' : '20px',
          marginBottom: '30px',
          padding: screenWidth <= 480 ? '0 10px' : '0'
        }}>

          <div style={{
            padding: '20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }} onClick={() => setIsAppointmentsOpen(true)}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ffcc00' }}>Mes Rendez-vous ({Number(stats.appointmentsCount) || 0})</h3>
            <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
              Consultez vos rendez-vous et leur statut
            </p>
          </div>

          <div style={{
            padding: screenWidth <= 480 ? '15px' : '20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }} onClick={() => console.log('Card recommandations cliquée - fonctionnalité à implémenter')}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ffcc00' }}>Recommandations</h3>
            <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
              Créez et gérez vos recommandations
            </p>
          </div>

          <div style={{
            padding: screenWidth <= 480 ? '15px' : '20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }} onClick={handleOpenMessages}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ffcc00' }}>Messages ({Number(stats.messagesCount) || 0})</h3>
            <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
              Communiquez avec les recruteurs et coaches
            </p>
          </div>

        </div>

        {/* Troisième ligne - 1 carte à gauche */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: screenWidth <= 480 
            ? '1fr' 
            : screenWidth <= 768 
              ? 'repeat(2, 1fr)' 
              : 'repeat(3, 1fr)',
          gap: screenWidth <= 480 ? '12px' : '20px',
          marginBottom: '30px',
          padding: screenWidth <= 480 ? '0 10px' : '0'
        }}>
          <div style={{
            padding: screenWidth <= 480 ? '15px' : '20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }} onClick={() => setShowGoogleCalendar(true)}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ffcc00' }}>Google Calendar</h3>
            <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
              Synchroniser avec Google Calendar et Meet
            </p>
          </div>
        </div>

        {/* Section Offres d'emploi avec filtres */}
        <div style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '4px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          
          {/* Header avec bouton filtre */}
          <div style={{
            display: 'flex',
            flexDirection: screenWidth <= 480 ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: screenWidth <= 480 ? 'stretch' : 'center',
            gap: screenWidth <= 480 ? '12px' : '0',
            marginBottom: screenWidth <= 480 ? '15px' : '20px',
            paddingLeft: screenWidth <= 480 ? '0' : screenWidth <= 768 ? '10px' : '20px'
          }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: screenWidth <= 480 ? 'column' : 'row',
              alignItems: screenWidth <= 480 ? 'stretch' : 'center', 
              gap: screenWidth <= 480 ? '8px' : '16px' 
            }}>
              {/* Bouton filtre toggle */}
              <div
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '8px',
                  padding: screenWidth <= 480 ? '10px 16px' : '8px 12px',
                  paddingLeft: screenWidth <= 480 ? '16px' : '16px',
                  backgroundColor: '#333',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  minWidth: screenWidth <= 480 ? '140px' : 'auto'
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
                  fontSize: screenWidth <= 480 ? '13px' : '14px', 
                  color: '#ffcc00' 
                }}>
                  {showFilters ? 'Fermer' : 'Filtrer'}
                </span>
              </div>
              
              {/* Titre "Offres d'emploi récentes" - fixe */}
              <div style={{ 
                textAlign: screenWidth <= 480 ? 'center' : 'left'
              }}>
                <h2 style={{ 
                  margin: 0, 
                  color: '#ffcc00',
                  fontSize: screenWidth <= 480 ? '16px' : screenWidth <= 768 ? '18px' : '20px'
                }}>
                  Offres d'emploi récentes ({Number(filteredJobs.length) || 0})
                </h2>
              </div>
            </div>
            
            {/* Pagination */}
            <span style={{ 
              fontSize: screenWidth <= 480 ? '12px' : '14px', 
              color: '#888',
              alignSelf: screenWidth <= 480 ? 'center' : 'auto'
            }}>Page 1</span>
          </div>

          <div style={{ width: '100%' }}>
            {/* Filtres au-dessus - comme RecruiterDashboard */}
            {showFilters && (
              <div style={{
                width: '100%',
                backgroundColor: '#1a1a1a',
                borderRadius: '4px',
                padding: screenWidth <= 480 ? '15px' : '20px',
                marginBottom: '20px'
              }}>
                {/* Filtres en grid sur toute la largeur */}
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: screenWidth <= 480 
                    ? '1fr' 
                    : screenWidth <= 768 
                      ? 'repeat(2, 1fr)' 
                      : 'repeat(4, 1fr)',
                  gap: screenWidth <= 480 ? '12px' : '16px' 
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
                              onClick={() => setActiveFilters(prev => ({ ...prev, skills: '' }))}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#888',
                                cursor: 'pointer',
                                fontSize: '12px',
                                padding: '2px'
                              }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="React, Node.js..."
                          value={activeFilters.skills}
                          onChange={(e) => setActiveFilters(prev => ({ ...prev, skills: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '4px',
                            color: '#f5f5f7',
                            fontSize: '13px'
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
                              onClick={() => setActiveFilters(prev => ({ ...prev, location: '' }))}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#888',
                                cursor: 'pointer',
                                fontSize: '12px',
                                padding: '2px'
                              }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Paris, Lyon, Remote..."
                          value={activeFilters.location}
                          onChange={(e) => setActiveFilters(prev => ({ ...prev, location: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '4px',
                            color: '#f5f5f7',
                            fontSize: '13px'
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
                              onClick={() => setActiveFilters(prev => ({ ...prev, contractType: '' }))}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#888',
                                cursor: 'pointer',
                                fontSize: '12px',
                                padding: '2px'
                              }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="CDI, CDD, Freelance..."
                          value={activeFilters.contractType}
                          onChange={(e) => setActiveFilters(prev => ({ ...prev, contractType: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '4px',
                            color: '#f5f5f7',
                            fontSize: '13px'
                          }}
                        />
                      </div>

                      {/* Filtre par entreprise */}
                      <div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <span style={{ fontSize: '14px', color: '#f5f5f7', fontWeight: '500' }}>
                            Entreprise
                          </span>
                          {activeFilters.company && (
                            <button
                              onClick={() => setActiveFilters(prev => ({ ...prev, company: '' }))}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#888',
                                cursor: 'pointer',
                                fontSize: '12px',
                                padding: '2px'
                              }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Google, Airbnb..."
                          value={activeFilters.company}
                          onChange={(e) => setActiveFilters(prev => ({ ...prev, company: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '4px',
                            color: '#f5f5f7',
                            fontSize: '13px'
                          }}
                        />
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
              padding: screenWidth <= 480 ? '0 5px' : screenWidth <= 768 ? '0 10px' : '0'
            }}>
            
            {filteredJobs.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px',
                color: '#888'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px',
                  opacity: 0.5
                }}>
                  🔍
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Aucune offre trouvée</h3>
                <p style={{ margin: 0, textAlign: 'center', fontSize: '14px' }}>
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: screenWidth <= 480 
                  ? '1fr' 
                  : screenWidth <= 768 
                    ? 'repeat(auto-fit, minmax(280px, 1fr))' 
                    : 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: screenWidth <= 480 ? '12px' : '16px',
                padding: screenWidth <= 480 ? '0 10px' : '0'
              }}>
                {filteredJobs.slice(0, 6).map((job, index) => (
                  <div
                    key={job.id || index}
                    style={{
                      padding: '20px',
                      backgroundColor: '#111',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onClick={() => {
                      console.log('🔥 CLIC SUR OFFRE:', job.id, job.title);
                      setSelectedJob(job);
                      setShowJobDetails(true);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 204, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0px)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          margin: '0 0 6px 0',
                          color: '#f5f5f7',
                          fontSize: '16px',
                          fontWeight: '600',
                          lineHeight: '1.3'
                        }}>
                          {String(job.title || 'Poste à pourvoir')}
                        </h3>
                        <p style={{ 
                          margin: '0 0 4px 0', 
                          color: '#ffcc00', 
                          fontSize: '14px',
                          fontWeight: '500' 
                        }}>
                          {String(job.company || 'Entreprise')}
                        </p>
                        <div style={{ 
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          margin: 0,
                          color: '#888', 
                          fontSize: '12px' 
                        }}>
                          <span>📍 {String(job.location || 'Non spécifié')}</span>
                          <span>💼 {String(job.contractType || 'CDI')}</span>
                          <span>💰 {String(job.salary || 'À négocier')}</span>
                        </div>
                      </div>
                      <div style={{
                        padding: '4px 8px',
                        backgroundColor: '#333',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: '#61bfac',
                        marginLeft: '12px',
                        flexShrink: 0
                      }}>
                        Nouveau
                      </div>
                    </div>
                    <p style={{
                      margin: 0,
                      color: '#ccc',
                      fontSize: '13px',
                      lineHeight: '1.5'
                    }}>
                      {String((job.description || '').toString()).substring(0, 120)}...
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isAppointmentsOpen && (
        <CoachAppointmentManager onClose={() => setIsAppointmentsOpen(false)} />
      )}

      {isAvailabilityOpen && (
        <CoachAvailabilityManager onClose={() => setIsAvailabilityOpen(false)} />
      )}

      {/* GoogleCalendarManager désactivé temporairement pour éviter l'authentification client-side
      {showGoogleCalendar && (
        <GoogleCalendarManager 
          isOpen={showGoogleCalendar}
          onClose={() => setShowGoogleCalendar(false)} 
          coachId={user?.id || ''}
        />
      )}
      */}

      {/* Modal des détails d'offre */}
      {showJobDetails && selectedJob && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            padding: '30px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            {/* Bouton fermer */}
            <button
              onClick={() => {
                setShowJobDetails(false);
                setSelectedJob(null);
              }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                backgroundColor: 'transparent',
                color: '#f5f5f7',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              ✕
            </button>

            {/* Détails de l'offre */}
            <div style={{ marginRight: '40px' }}>
              <h1 style={{
                margin: '0 0 8px 0',
                color: '#ffcc00',
                fontSize: '28px',
                fontWeight: '600'
              }}>
                {String(selectedJob.title || 'Titre non spécifié')}
              </h1>
              <p style={{
                margin: '0 0 4px 0',
                color: '#f5f5f7',
                fontSize: '18px'
              }}>
                {String(selectedJob.company || 'Entreprise non spécifiée')}
              </p>
              <p style={{
                margin: '0 0 20px 0',
                color: '#888',
                fontSize: '16px'
              }}>
                📍 {String(selectedJob.location || 'Localisation non spécifiée')} • 
                💼 {String(selectedJob.contractType || 'CDI')} • 
                💰 {String(selectedJob.salary || 'À négocier')}
              </p>

              <div style={{
                borderTop: '1px solid #333',
                paddingTop: '20px',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  margin: '0 0 12px 0',
                  color: '#ffcc00',
                  fontSize: '18px'
                }}>
                  Description du poste
                </h3>
                <p style={{
                  margin: 0,
                  color: '#ccc',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {String(selectedJob.description || 'Aucune description disponible')}
                </p>
              </div>

              {selectedJob.requirements && (
                <div style={{
                  borderTop: '1px solid #333',
                  paddingTop: '20px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{
                    margin: '0 0 12px 0',
                    color: '#ffcc00',
                    fontSize: '18px'
                  }}>
                    Exigences
                  </h3>
                  <p style={{
                    margin: 0,
                    color: '#ccc',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {String(selectedJob.requirements)}
                  </p>
                </div>
              )}

              {/* Bouton recommandation */}
              <div style={{
                borderTop: '1px solid #333',
                paddingTop: '20px',
                textAlign: 'center'
              }}>
                <button
                  onClick={() => {
                    console.log('🔥 CLIC RECOMMANDATION pour offre:', selectedJob.title);
                    console.log('🔥 SELECTED JOB COMPLET:', selectedJob);
                    console.log('🔥 SELECTED JOB.ID:', selectedJob.id);
                    setShowJobDetails(false);
                    setShowRecommendationModal(true);
                  }}
                  style={{
                    padding: '14px 28px',
                    backgroundColor: '#ffcc00',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  📋 Recommander des talents pour cette offre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nouveau Modal de Recommandation Simple */}
      <SimpleRecommendationModal 
        isOpen={showRecommendationModal}
        onClose={() => {
          setShowRecommendationModal(false);
          setSelectedJob(null);
        }}
        job={selectedJob}
      />
    </div>
  );
}