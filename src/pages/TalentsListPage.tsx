import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService, UserProfile } from '../services/firestoreService';
import Avatar from '../components/Avatar';

const TalentsListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [talents, setTalents] = useState<UserProfile[]>([]);
  const [filteredTalents, setFilteredTalents] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
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
        setFilteredTalents(talentsList);
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

  const handleLogout = async () => {
    try {
      await FirestoreService.signOut();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleViewProfile = (talentId: string) => {
    navigate(`/profile/${talentId}?from=recruiter-talents`);
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
        width: '1214px',
        maxWidth: '100%',
        padding: '24px'
      }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
        borderBottom: '1px solid #333',
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate('/dashboard/recruteur')}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#ffcc00',
              border: '1px solid #ffcc00',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← Retour
          </button>
          <h1 style={{ margin: 0, color: '#ffcc00' }}>
            Talents Disponibles ({filteredTalents.length})
          </h1>
        </div>
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

      {/* Filtres Section */}
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '4px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        {/* Header avec bouton filtre */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
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
          </div>
          
          <span style={{ fontSize: '14px', color: '#888' }}>Page 1</span>
        </div>

        {/* Filtres mobiles/tablettes */}
        {showFilters && (
          <div style={{
            width: '100%',
            backgroundColor: '#0a0a0a',
            borderRadius: '4px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: screenWidth <= 480 ? '1fr' : screenWidth <= 768 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: '16px' 
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
                    padding: '8px',
                    backgroundColor: '#333',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '13px'
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
                    padding: '8px',
                    backgroundColor: '#333',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '13px'
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
                    padding: '8px',
                    backgroundColor: '#333',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '13px'
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
                    padding: '8px',
                    backgroundColor: '#333',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '13px'
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
                padding: '8px',
                marginTop: '16px',
                backgroundColor: '#333',
                color: '#f5f5f7',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Réinitialiser
            </button>
          </div>
        )}
      </div>

      {/* Talents Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: 20 
      }}>
        {filteredTalents.map(talent => (
          <div key={talent.id} style={{
            backgroundColor: '#111',
            borderRadius: 8,
            padding: 20,
            border: '1px solid #333'
          }}>
            {/* Talent Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <Avatar
                email={talent.email}
                src={talent.avatarUrl}
                size="medium"
                editable={false}
              />
              <div>
                <h3 style={{ 
                  color: '#f5f5f7', 
                  margin: '0 0 4px 0',
                  fontSize: '18px'
                }}>
                  {talent.displayName || talent.email.split('@')[0]}
                </h3>
                <p style={{ 
                  color: '#888', 
                  margin: 0,
                  fontSize: '14px'
                }}>
                  {talent.email}
                </p>
              </div>
            </div>

            {/* Bio Preview */}
            {talent.bio && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ 
                  color: '#f5f5f7', 
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.4',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {talent.bio}
                </p>
              </div>
            )}

            {/* Skills Preview */}
            {talent.skills && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ 
                  color: '#888', 
                  margin: '0 0 4px 0',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Compétences
                </p>
                <p style={{ 
                  color: '#f5f5f7', 
                  margin: 0,
                  fontSize: '13px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {talent.skills}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => handleViewProfile(talent.id)}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: '#ffcc00',
                  border: '1px solid #ffcc00',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Voir le profil
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTalents.length === 0 && talents.length > 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#888'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ color: '#f5f5f7', marginBottom: '8px' }}>Aucun talent trouvé</h3>
          <p>Essayez de modifier vos critères de recherche</p>
        </div>
      )}

      {talents.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#888'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍💼</div>
          <h3 style={{ color: '#f5f5f7', marginBottom: '8px' }}>Aucun talent disponible</h3>
          <p>Aucun talent n'est disponible pour le moment</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default TalentsListPage;
