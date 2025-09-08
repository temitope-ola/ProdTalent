import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService, UserProfile } from '../services/firestoreService';
import Avatar from '../components/Avatar';

const CoachRecruteursPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recruteurs, setRecruteurs] = useState<UserProfile[]>([]);
  const [filteredRecruteurs, setFilteredRecruteurs] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    location: '',
    company: '',
    industry: '',
    experience: ''
  });
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const loadRecruteurs = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      try {
        setIsLoading(true);
        const recruteursList = await FirestoreService.getAllRecruteurs();
        setRecruteurs(recruteursList);
      } catch (error) {
        console.error('Erreur lors du chargement des recruteurs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecruteurs();
  }, [user, navigate]);

  // Screen width detection
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter recruiters when filters change
  useEffect(() => {
    applyFilters();
  }, [recruteurs, activeFilters]);

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
    let filtered = recruteurs;

    // Filter by location
    if (activeFilters.location) {
      filtered = filtered.filter(recruteur => 
        recruteur.location && recruteur.location.toLowerCase().includes(activeFilters.location.toLowerCase())
      );
    }

    // Filter by company
    if (activeFilters.company) {
      filtered = filtered.filter(recruteur => 
        recruteur.company && recruteur.company.toLowerCase().includes(activeFilters.company.toLowerCase())
      );
    }

    // Filter by industry
    if (activeFilters.industry) {
      filtered = filtered.filter(recruteur => 
        recruteur.industry && recruteur.industry.toLowerCase().includes(activeFilters.industry.toLowerCase())
      );
    }

    // Filter by experience
    if (activeFilters.experience) {
      filtered = filtered.filter(recruteur => 
        recruteur.experience && recruteur.experience.toLowerCase().includes(activeFilters.experience.toLowerCase())
      );
    }

    setFilteredRecruteurs(filtered);
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

  const handleViewProfile = (recruteurId: string) => {
    navigate(`/profile/${recruteurId}?from=coach-recruteurs`);
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
        Chargement des recruteurs...
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
                border: '1px solid #ffcc00',
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
                Mes Recruteurs
              </h1>
              <p style={{ margin: 0, color: '#888', fontSize: '12px' }}>
                Connectez-vous avec les recruteurs actifs
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
                src={undefined} 
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

        {/* Filtres mobiles au-dessus - s'ouvrent vers le haut */}
        {showFilters && screenWidth <= 768 && (
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

              {/* Filtre par localisation */}
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <label style={{ color: '#f5f5f7', fontSize: '14px', fontWeight: 'bold' }}>
                    Localisation
                  </label>
                  {activeFilters.location && (
                    <button 
                      onClick={() => setActiveFilters(prev => ({ ...prev, location: '' }))}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '0'
                      }}
                    >
                      Effacer
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Ville, pays..."
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

              {/* Filtre par entreprise */}
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <label style={{ color: '#f5f5f7', fontSize: '14px', fontWeight: 'bold' }}>
                    Entreprise
                  </label>
                  {activeFilters.company && (
                    <button 
                      onClick={() => setActiveFilters(prev => ({ ...prev, company: '' }))}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '0'
                      }}
                    >
                      Effacer
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Nom d'entreprise..."
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

              {/* Filtre par secteur */}
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <label style={{ color: '#f5f5f7', fontSize: '14px', fontWeight: 'bold' }}>
                    Secteur
                  </label>
                  {activeFilters.industry && (
                    <button 
                      onClick={() => setActiveFilters(prev => ({ ...prev, industry: '' }))}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '0'
                      }}
                    >
                      Effacer
                    </button>
                  )}
                </div>
                <select
                  value={activeFilters.industry}
                  onChange={(e) => setActiveFilters(prev => ({ ...prev, industry: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    color: '#f5f5f7',
                    fontSize: '13px'
                  }}
                >
                  <option value="">Tous les secteurs</option>
                  <option value="Technologie">Technologie</option>
                  <option value="Finance">Finance</option>
                  <option value="Santé">Santé</option>
                  <option value="Éducation">Éducation</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              {/* Filtre par expérience */}
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <label style={{ color: '#f5f5f7', fontSize: '14px', fontWeight: 'bold' }}>
                    Expérience
                  </label>
                  {activeFilters.experience && (
                    <button 
                      onClick={() => setActiveFilters(prev => ({ ...prev, experience: '' }))}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '0'
                      }}
                    >
                      Effacer
                    </button>
                  )}
                </div>
                <select
                  value={activeFilters.experience}
                  onChange={(e) => setActiveFilters(prev => ({ ...prev, experience: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    color: '#f5f5f7',
                    fontSize: '13px'
                  }}
                >
                  <option value="">Toute expérience</option>
                  <option value="0-2">0-2 ans</option>
                  <option value="3-5">3-5 ans</option>
                  <option value="6-10">6-10 ans</option>
                  <option value="10+">10+ ans</option>
                </select>
              </div>

            </div>

            {/* Bouton "Appliquer les filtres" */}
            <button 
              onClick={() => setShowFilters(false)}
              style={{
                width: '100%',
                padding: '12px',
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
              Appliquer les filtres
            </button>
          </div>
        )}

        {/* Section "Tous les recruteurs" avec filtre sidebar */}
        <div style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '4px',
          padding: '20px',
          paddingLeft: '0px'
        }}>
          
          {/* Header avec bouton filtre et titre */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
            paddingLeft: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Bouton filtre toggle */}
              <div
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  paddingLeft: '16px',
                  backgroundColor: '#333',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
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
                <span style={{ fontSize: '14px', color: '#ffcc00' }}>
                  {showFilters ? 'Fermer' : 'Filtrer'}
                </span>
              </div>
              
              {/* Titre "Tous les recruteurs" - slide avec les filtres */}
              <div style={{ 
                marginLeft: screenWidth <= 768 ? '0px' : (showFilters ? '250px' : '0px'),
                transition: screenWidth <= 768 ? 'none' : 'margin-left 0.3s ease'
              }}>
                <h2 style={{ margin: 0, color: '#ffcc00' }}>Tous les recruteurs ({filteredRecruteurs.length})</h2>
              </div>
            </div>
            
            {/* Pagination */}
            <span style={{ fontSize: '14px', color: '#888' }}>Page 1</span>
          </div>


          {/* Contenu principal avec sidebar et cartes */}
          <div style={{ 
            display: 'flex', 
            flexDirection: screenWidth <= 768 ? 'column' : 'row',
            gap: '20px' 
          }}>
            
            {/* Sidebar filtres - seulement sur desktop */}
            {screenWidth > 768 && showFilters && (
            <div style={{
              width: showFilters ? '250px' : '0px',
              overflow: 'hidden',
              transition: 'width 0.3s ease',
              backgroundColor: '#0a0a0a',
              borderRadius: '4px',
              padding: showFilters ? '25px' : '0px',
              height: 'fit-content'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
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
                        placeholder="ex: Paris, Lyon..."
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
                            onClick={() => clearFilter('company')}
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
                        placeholder="ex: Google, Microsoft..."
                        value={activeFilters.company}
                        onChange={(e) => handleFilterChange('company', e.target.value)}
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

                    {/* Filtre par secteur */}
                    <div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}>
                        <span style={{ fontSize: '14px', color: '#f5f5f7', fontWeight: '500' }}>
                          Secteur
                        </span>
                        {activeFilters.industry && (
                          <button
                            onClick={() => clearFilter('industry')}
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
                        placeholder="ex: Tech, Finance..."
                        value={activeFilters.industry}
                        onChange={(e) => handleFilterChange('industry', e.target.value)}
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
                    
                </div>
              </div>
            )}

            {/* Section des cartes recruteurs */}
            <div style={{ 
              flex: 1,
              padding: screenWidth <= 768 
                ? '0px 10px' 
                : (showFilters ? '0px' : '0px 20px')
            }}>
              
              {/* Grille des recruteurs */}
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
                {filteredRecruteurs.slice(0, 12).map((recruteur, index) => (
                  <div
                    key={recruteur.id || index}
                    style={{
                      padding: '20px',
                      backgroundColor: '#111',
                      borderRadius: '4px',
                      border: '1px solid #333',
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
                    onClick={() => handleViewProfile(recruteur.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <Avatar 
                          src={recruteur.avatarUrl}
                          alt={recruteur.displayName || recruteur.email}
                          size="medium"
                        />
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: '0 0 4px 0', color: '#ffcc00', fontSize: '16px' }}>
                            {recruteur.displayName || recruteur.email.split('@')[0]}
                          </h3>
                          <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>
                            {recruteur.company || 'Entreprise'} • {recruteur.location || 'Localisation'}
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
                        Actif
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '13px', color: '#ccc', lineHeight: '1.4', marginBottom: '12px' }}>
                      {recruteur.bio ? (recruteur.bio.length > 80 ? recruteur.bio.substring(0, 80) + '...' : recruteur.bio) : 'Expert en recrutement de talents'}
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {recruteur.industry && (
                        <span style={{
                          padding: '2px 6px',
                          backgroundColor: '#333',
                          color: '#ffcc00',
                          borderRadius: '2px',
                          fontSize: '10px'
                        }}>
                          {recruteur.industry}
                        </span>
                      )}
                      {recruteur.company && (
                        <span style={{
                          padding: '2px 6px',
                          backgroundColor: '#333',
                          color: '#888',
                          borderRadius: '2px',
                          fontSize: '10px'
                        }}>
                          {recruteur.company}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Message si aucun recruteur */}
              {filteredRecruteurs.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#888'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>👔</div>
                  <h3 style={{ color: '#f5f5f7', marginBottom: '8px' }}>Aucun recruteur trouvé</h3>
                  <p>Essayez de modifier vos critères de recherche</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachRecruteursPage;
