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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredTalents, setFilteredTalents] = useState<UserProfile[]>([]);
  const [activeFilters, setActiveFilters] = useState({
    skills: '',
    searchTerm: ''
  });
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  
  // Métriques simplifiées
  const [jobStats, setJobStats] = useState({
    activeJobs: 0,
    pendingApplications: 0
  });
  const [messagesCount, setMessagesCount] = useState(0);

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
      loadMessagesCount();
    }
  }, [user]);

  // Filtrer les talents quand les filtres changent
  useEffect(() => {
    applyTalentFilters();
  }, [talents, activeFilters]);

  // Gérer le redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fonction legacy pour compatibilité 
  const applyFilters = () => {
    applyTalentFilters();
  };

  // Fermer le menu profil quand on clique ailleurs
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

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      console.log('🔄 Chargement du profil Firebase...', { userId: user.id, role: user.role });
      const userProfile = await FirestoreService.getCurrentProfile(user.id, user.role);
      console.log('✅ Profil chargé:', userProfile);
      setProfile(userProfile);
    } catch (error) {
      console.error('❌ Erreur lors du chargement du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTalents = async () => {
    if (!user) return;
    try {
      console.log('🔄 Chargement des talents Firebase...');
      const talentsList = await FirestoreService.getAllTalents();
      console.log('✅ Talents chargés:', talentsList.length, 'talents trouvés');
      setTalents(talentsList);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des talents:', error);
    }
  };

  // Fonction pour naviguer vers le profil d'un talent
  const handleTalentClick = (talentId: string) => {
    navigate(`/profile/${talentId}`);
  };

  const loadJobStats = async () => {
    if (!user) return;
    try {
      console.log('🔄 Chargement des statistiques jobs...');
      
      // Charger les annonces du recruteur
      const recruiterJobs = await FirestoreService.getRecruiterJobs(user.id);
      
      // Compter toutes les candidatures
      let totalApplications = 0;
      for (const job of recruiterJobs) {
        try {
          const jobApplications = await FirestoreService.getJobApplications(job.id);
          totalApplications += jobApplications.length;
          console.log(`📊 Annonce "${job.title}": ${jobApplications.length} candidatures`);
        } catch (error) {
          console.error(`Erreur lors du chargement des candidatures pour l'annonce ${job.id}:`, error);
        }
      }
      
      setJobStats({
        activeJobs: recruiterJobs.length,
        pendingApplications: totalApplications
      });
      console.log('✅ Stats jobs chargées (données réelles)');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des stats:', error);
      // En cas d'erreur, utiliser des valeurs par défaut
      setJobStats({
        activeJobs: 0,
        pendingApplications: 0
      });
    }
  };

  const loadMessagesCount = async () => {
    if (!user) return;
    try {
      console.log('🔄 Chargement du nombre de messages...');
      
      // Charger les messages de l'utilisateur
      const userMessages = await FirestoreService.getUserMessages(user.id);
      setMessagesCount(userMessages.length);
      
      console.log('✅ Nombre de messages chargé (données réelles)');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des messages:', error);
      // En cas d'erreur, utiliser une valeur par défaut
      setMessagesCount(0);
    }
  };





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

  const handleOpenMessages = () => {
    navigate('/messages');
  };

  const handleOpenApplications = () => {
    navigate('/applications');
  };

  const handleViewMyJobs = () => {
    navigate('/my-jobs');
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

  // Fonction pour appliquer les filtres
  const applyTalentFilters = () => {
    if (!talents || talents.length === 0) {
      setFilteredTalents([]);
      return;
    }

    let filtered = [...talents];

    // Filtre par compétences
    if (activeFilters.skills.trim()) {
      filtered = filtered.filter(talent => {
        if (!talent.skills) return false;
        
        const talentSkills = Array.isArray(talent.skills) 
          ? talent.skills.map((skill: string) => skill.toLowerCase())
          : talent.skills.toLowerCase().split(/[,\s]+/).filter((skill: string) => skill.trim());
          
        return talentSkills.some((skill: string) => 
          skill.includes(activeFilters.skills.toLowerCase()) || 
          activeFilters.skills.toLowerCase().includes(skill)
        );
      });
    }

    // Filtre par recherche générale (nom, email, bio)
    if (activeFilters.searchTerm.trim()) {
      const searchLower = activeFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(talent => {
        const nameMatch = talent.displayName?.toLowerCase().includes(searchLower);
        const emailMatch = talent.email.toLowerCase().includes(searchLower);
        const bioMatch = talent.bio?.toLowerCase().includes(searchLower);
        return nameMatch || emailMatch || bioMatch;
      });
    }

    setFilteredTalents(filtered);
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
        padding: screenWidth <= 480 ? '10px' : screenWidth <= 768 ? '15px' : '20px'
      }}>
        


        {/* Header avec navigation user-friendly */}
        <div style={{
          display: 'flex',
          flexDirection: screenWidth <= 480 ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: screenWidth <= 480 ? 'stretch' : 'center',
          gap: screenWidth <= 480 ? '12px' : '0',
          marginBottom: screenWidth <= 480 ? '15px' : '20px',
          padding: screenWidth <= 480 ? '12px' : '12px 16px',
          backgroundColor: '#1a1a1a',
          borderRadius: '4px'
        }}>
          <div style={{ textAlign: screenWidth <= 480 ? 'center' : 'left' }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: screenWidth <= 480 ? '18px' : '20px', 
              fontWeight: '600' 
            }}>
              Dashboard Recruteur
            </h1>
            <p style={{ 
              margin: 0, 
              color: '#888', 
              fontSize: screenWidth <= 480 ? '11px' : '12px' 
            }}>
              Gérez vos offres et candidatures
            </p>
          </div>
          
          {/* Menu profil déroulant */}
          <div style={{ 
            position: 'relative', 
            alignSelf: screenWidth <= 480 ? 'center' : 'auto' 
          }} data-profile-menu>
            <div
              onClick={handleProfileClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: screenWidth <= 480 ? '6px' : '8px',
                padding: screenWidth <= 480 ? '8px 12px' : '6px 10px',
                backgroundColor: '#333',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                minWidth: screenWidth <= 480 ? '140px' : 'auto',
                justifyContent: screenWidth <= 480 ? 'center' : 'flex-start'
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
              <div style={{
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
                  onClick={() => handleProfileAction('profile')}
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
                  onClick={() => handleProfileAction('logout')}
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
          gridTemplateColumns: screenWidth <= 480 
            ? '1fr' 
            : screenWidth <= 768 
              ? 'repeat(auto-fit, minmax(250px, 1fr))' 
              : 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: screenWidth <= 480 ? '12px' : '20px',
          marginBottom: '30px',
          padding: screenWidth <= 480 ? '0 10px' : '0'
        }}>
          
          <div style={{
            padding: screenWidth <= 480 ? '15px' : '20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            border: 'none',
            minHeight: screenWidth <= 480 ? '80px' : '90px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }} onClick={handleOpenApplications}>
            <h3 style={{ 
              margin: '0 0 8px 0', 
              color: '#ffcc00',
              fontSize: screenWidth <= 480 ? '14px' : '16px',
              textAlign: screenWidth <= 480 ? 'center' : 'left'
            }}>Candidatures ({jobStats.pendingApplications})</h3>
            <p style={{ 
              margin: 0, 
              color: '#888', 
              fontSize: screenWidth <= 480 ? '12px' : '14px',
              textAlign: screenWidth <= 480 ? 'center' : 'left',
              lineHeight: '1.3'
            }}>
              {screenWidth <= 480 ? 'Gérez les candidatures' : 'Consultez et gérez les candidatures reçues'}
            </p>
          </div>

          <div style={{
            padding: screenWidth <= 480 ? '15px' : '20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            minHeight: screenWidth <= 480 ? '80px' : '90px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }} onClick={handleViewMyJobs}>
            <h3 style={{ 
              margin: '0 0 8px 0', 
              color: '#ffcc00',
              fontSize: screenWidth <= 480 ? '14px' : '16px',
              textAlign: screenWidth <= 480 ? 'center' : 'left'
            }}>Mes annonces ({jobStats.activeJobs})</h3>
            <p style={{ 
              margin: 0, 
              color: '#888', 
              fontSize: screenWidth <= 480 ? '12px' : '14px',
              textAlign: screenWidth <= 480 ? 'center' : 'left',
              lineHeight: '1.3'
            }}>
              {screenWidth <= 480 ? 'Gérez vos offres' : 'Gérez vos offres d\'emploi et candidatures'}
            </p>
          </div>

          <div style={{
            padding: screenWidth <= 480 ? '15px' : '20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            minHeight: screenWidth <= 480 ? '80px' : '90px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }} onClick={handleOpenMessages}>
            <h3 style={{ 
              margin: '0 0 8px 0', 
              color: '#ffcc00',
              fontSize: screenWidth <= 480 ? '14px' : '16px',
              textAlign: screenWidth <= 480 ? 'center' : 'left'
            }}>Messages ({messagesCount || 0})</h3>
            <p style={{ 
              margin: 0, 
              color: '#888', 
              fontSize: screenWidth <= 480 ? '12px' : '14px',
              textAlign: screenWidth <= 480 ? 'center' : 'left',
              lineHeight: '1.3'
            }}>
              {screenWidth <= 480 ? 'Chat avec talents' : 'Communiquez avec les talents'}
            </p>
          </div>

        </div>



                        {/* Section "Tous les talents" avec filtre */}
        <div style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '4px',
          padding: screenWidth <= 480 ? '12px' : screenWidth <= 768 ? '16px' : '20px',
          marginBottom: screenWidth <= 480 ? '15px' : '20px'
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
                  justifyContent: screenWidth <= 480 ? 'center' : 'flex-start',
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
              
              {/* Titre "Tous les talents" - fixe */}
              <div style={{ 
                textAlign: screenWidth <= 480 ? 'center' : 'left'
              }}>
                <h2 style={{ 
                  margin: 0, 
                  color: '#ffcc00',
                  fontSize: screenWidth <= 480 ? '16px' : screenWidth <= 768 ? '18px' : '20px'
                }}>Tous les talents ({talents.length})</h2>
              </div>
            </div>
            
            {/* Pagination */}
            <span style={{ 
              fontSize: screenWidth <= 480 ? '12px' : '14px', 
              color: '#888',
              alignSelf: screenWidth <= 480 ? 'center' : 'auto'
            }}>Page 1</span>
          </div>

          {/* Filtres au-dessus - comme TalentDashboard */}
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
                    
                    {/* Filtre par nom/compétences */}
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
                        placeholder="React, Python, JavaScript..."
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
                    





                    {/* Filtre par recherche */}
                    <div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}>
                        <span style={{ fontSize: '14px', color: '#f5f5f7', fontWeight: '500' }}>
                          Rechercher un talent
                        </span>
                        {activeFilters.searchTerm && (
                          <button
                            onClick={() => setActiveFilters(prev => ({ ...prev, searchTerm: '' }))}
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
                        placeholder="Nom, email, bio..."
                        value={activeFilters.searchTerm}
                        onChange={(e) => setActiveFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
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
                  onClick={() => setActiveFilters({ skills: '', searchTerm: '' })}
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
              
              {/* Liste des talents en disposition horizontale */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: screenWidth <= 480 
                  ? '1fr' 
                  : screenWidth <= 768 
                    ? 'repeat(auto-fit, minmax(250px, 1fr))' 
                    : 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: screenWidth <= 480 ? '8px' : screenWidth <= 768 ? '12px' : '16px',
                marginTop: (showFilters && screenWidth > 768) ? '30px' : '0px',
                padding: screenWidth <= 480 ? '0 5px' : '0'
              }}>
                {filteredTalents.length > 0 ? filteredTalents.map((talent) => (
                  <div key={talent.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: screenWidth <= 480 ? '8px' : '10px',
                    paddingLeft: screenWidth <= 480 ? '12px' : '16px',
                    backgroundColor: '#333',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    height: screenWidth <= 480 ? '60px' : '65px',
                    minHeight: screenWidth <= 480 ? '60px' : '65px'
                  }}
                  onClick={() => handleTalentClick(talent.id)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#333'}
                  >
                    {/* Avatar */}
                    <div style={{ 
                      marginRight: screenWidth <= 480 ? '8px' : '12px', 
                      flexShrink: 0 
                    }}>
                      <Avatar src={talent.avatarUrl} alt={talent.displayName || 'Talent'} size="small" />
                    </div>
                    
                    {/* Contenu principal */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Titre */}
                      <h4 style={{ 
                        margin: '0 0 4px 0', 
                        fontSize: screenWidth <= 480 ? '13px' : '14px', 
                        color: '#f5f5f7',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {talent.displayName || 'Talent'}
                      </h4>
                      
                      {/* Métadonnées compactes */}
                      <div style={{ 
                        fontSize: screenWidth <= 480 ? '10px' : '11px', 
                        color: '#888', 
                        lineHeight: '1.3' 
                      }}>
                        <div>
                          {screenWidth <= 480 
                            ? `${getTimeAgo(talent.createdAt)}` 
                            : `${getTimeAgo(talent.createdAt)} • 0 candidatures`}
                        </div>
                      </div>
                    </div>

                    {/* Disponibilité sur le côté droit */}
                    <div style={{ 
                      marginLeft: screenWidth <= 480 ? '6px' : '12px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        padding: screenWidth <= 480 ? '2px 6px' : '2px 8px',
                        backgroundColor: '#ffcc00',
                        color: '#1a1a1a',
                        borderRadius: '12px',
                        fontSize: screenWidth <= 480 ? '9px' : '10px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap'
                      }}>
                        {screenWidth <= 480 ? 'Dispo' : 'Disponible'}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: screenWidth <= 480 ? '20px' : '40px',
                    color: '#888',
                    fontSize: screenWidth <= 480 ? '14px' : '16px'
                  }}>
                    {talents.length === 0 ? 'Aucun talent trouvé' : 'Aucun talent ne correspond aux filtres'}
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
