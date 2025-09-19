import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService, UserProfile } from '../services/firestoreService';
import Avatar from '../components/Avatar';

const CoachTalentsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [talents, setTalents] = useState<UserProfile[]>([]);
  const [filteredTalents, setFilteredTalents] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    skills: '',
    availability: '',
    location: '',
    experience: ''
  });
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

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

  // Screen width detection
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter talents when filters change
  useEffect(() => {
    applyFilters();
  }, [talents, activeFilters]);

  // Close profile menu when clicking outside
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

  // Apply filters function
  const applyFilters = () => {
    let filtered = talents;

    // Filter by skills
    if (activeFilters.skills) {
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

    // Filter by availability
    if (activeFilters.availability) {
      filtered = filtered.filter(talent => 
        talent.availability && talent.availability.toLowerCase().includes(activeFilters.availability.toLowerCase())
      );
    }

    // Filter by location
    if (activeFilters.location) {
      filtered = filtered.filter(talent => 
        talent.location && talent.location.toLowerCase().includes(activeFilters.location.toLowerCase())
      );
    }

    // Filter by experience
    if (activeFilters.experience) {
      filtered = filtered.filter(talent => 
        talent.experience && talent.experience.toLowerCase().includes(activeFilters.experience.toLowerCase())
      );
    }

    setFilteredTalents(filtered);
  };

  // Filter handlers
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
      await FirestoreService.signOut();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleViewProfile = (talentId: string) => {
    navigate(`/profile/${talentId}?from=coach-talents`);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Bouton retour */}
            <button
              onClick={() => navigate('/dashboard/coach')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: '#333',
                color: '#ffcc00',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffcc00';
                e.currentTarget.style.color = '#0a0a0a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#333';
                e.currentTarget.style.color = '#ffcc00';
              }}
            >
              ← Retour
            </button>
            
            <div>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                Mes Talents
              </h1>
              <p style={{ margin: 0, color: '#888', fontSize: '12px' }}>
                Accompagnez et gérez vos talents
              </p>
            </div>
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
                email={user?.email || ''}
                src={user?.avatarUrl}
                size="small"
                editable={false}
              />
              <span style={{ fontSize: '13px', color: '#f5f5f7' }}>
                {user?.displayName || (user?.email ? user.email.split('@')[0] : 'Utilisateur')}
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


        {/* Section Talents avec filtres */}
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
                }}>
                  Tous les talents ({Number(filteredTalents.length) || 0})
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


        {/* Filtres responsives - affichage unifié */}
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
              gap: screenWidth <= 480 ? '12px' : '16px',
              width: '100%'
            }}>
                {/* Compétences */}
                <div>
                  <span style={{ fontSize: '14px', color: '#f5f5f7', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                    Compétences
                  </span>
                  <input
                    type="text"
                    placeholder="ex: React, Python..."
                    value={activeFilters.skills}
                    onChange={(e) => handleFilterChange('skills', e.target.value)}
                    style={{
                      width: '100%',
                      padding: screenWidth <= 480 ? '10px 12px' : '8px 12px',
                      backgroundColor: '#1a1a1a',
                      color: '#f5f5f7',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: screenWidth <= 480 ? '14px' : '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Disponibilité */}
                <div>
                  <span style={{ fontSize: '14px', color: '#f5f5f7', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                    Disponibilité
                  </span>
                  <select
                    value={activeFilters.availability}
                    onChange={(e) => handleFilterChange('availability', e.target.value)}
                    style={{
                      width: '100%',
                      padding: screenWidth <= 480 ? '10px 12px' : '8px 12px',
                      backgroundColor: '#1a1a1a',
                      color: '#f5f5f7',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: screenWidth <= 480 ? '14px' : '13px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Toutes</option>
                    <option value="immédiate">Immédiate</option>
                    <option value="1 mois">Dans 1 mois</option>
                    <option value="2 mois">Dans 2 mois</option>
                    <option value="3 mois">Dans 3 mois+</option>
                  </select>
                </div>

                {/* Localisation */}
                <div>
                  <span style={{ fontSize: '14px', color: '#f5f5f7', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                    Localisation
                  </span>
                  <input
                    type="text"
                    placeholder="ex: Paris, Lyon..."
                    value={activeFilters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    style={{
                      width: '100%',
                      padding: screenWidth <= 480 ? '10px 12px' : '8px 12px',
                      backgroundColor: '#1a1a1a',
                      color: '#f5f5f7',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: screenWidth <= 480 ? '14px' : '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Expérience */}
                <div>
                  <span style={{ fontSize: '14px', color: '#f5f5f7', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
                    Expérience
                  </span>
                  <select
                    value={activeFilters.experience}
                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                    style={{
                      width: '100%',
                      padding: screenWidth <= 480 ? '10px 12px' : '8px 12px',
                      backgroundColor: '#1a1a1a',
                      color: '#f5f5f7',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: screenWidth <= 480 ? '14px' : '13px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Tous niveaux</option>
                    <option value="junior">Junior (0-2 ans)</option>
                    <option value="confirmé">Confirmé (3-5 ans)</option>
                    <option value="senior">Senior (5+ ans)</option>
                  </select>
                </div>
              </div>

              {/* Bouton Reset */}
              <button
                onClick={() => setActiveFilters({ skills: '', availability: '', location: '', experience: '' })}
                style={{
                  width: '100%',
                  padding: screenWidth <= 480 ? '12px' : '8px',
                  marginTop: '16px',
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: screenWidth <= 480 ? '14px' : '13px',
                  transition: 'background-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#333'}
              >
                Réinitialiser
              </button>
            </div>
          )}

          <div style={{ width: '100%' }}>
            {/* Contenu principal avec cartes */}
            <div style={{
              width: '100%',
              padding: screenWidth <= 480 ? '0 5px' : screenWidth <= 768 ? '0 10px' : '0'
            }}>
              
            {filteredTalents.length === 0 ? (
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
                  🎯
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Aucun talent trouvé</h3>
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
                {filteredTalents.slice(0, 12).map((talent, index) => (
                  <div
                    key={talent.id || index}
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
                    onClick={() => handleViewProfile(talent.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <Avatar 
                          email={talent.email}
                          src={talent.avatarUrl}
                          size="medium"
                          editable={false}
                        />
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: '0 0 4px 0', color: '#ffcc00', fontSize: '16px' }}>
                            {talent.displayName || talent.email.split('@')[0]}
                          </h3>
                          <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>
                            {talent.email} • {talent.location || 'Localisation'}
                          </div>
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
                      {talent.bio ? (talent.bio.length > 80 ? talent.bio.substring(0, 80) + '...' : talent.bio) : 'Talent expérimenté prêt pour de nouveaux défis'}
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {talent.skills && (
                        <span style={{
                          padding: '2px 6px',
                          backgroundColor: '#333',
                          color: '#ffcc00',
                          borderRadius: '4px',
                          fontSize: '10px'
                        }}>
                          {typeof talent.skills === 'string' 
                            ? talent.skills.split(',')[0].trim()
                            : talent.skills[0] || 'Compétences'}
                        </span>
                      )}
                      {talent.availability && (
                        <span style={{
                          padding: '2px 6px',
                          backgroundColor: '#333',
                          color: '#888',
                          borderRadius: '4px',
                          fontSize: '10px'
                        }}>
                          {talent.availability}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachTalentsPage;
