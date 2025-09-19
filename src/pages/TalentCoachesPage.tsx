import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService, UserProfile } from '../services/firestoreService';
import Avatar from '../components/Avatar';

const TalentCoachesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState<UserProfile[]>([]);
  const [filteredCoaches, setFilteredCoaches] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    skills: '',
    searchTerm: ''
  });
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const loadCoaches = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      try {
        setIsLoading(true);
        const coachesList = await FirestoreService.getAllCoaches();
        setCoaches(coachesList);
        setFilteredCoaches(coachesList);
      } catch (error) {
        console.error('Erreur lors du chargement des coaches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCoaches();
  }, [user, navigate]);

  // Screen width detection
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter coaches
  useEffect(() => {
    let filtered = coaches;

    if (activeFilters.searchTerm) {
      filtered = filtered.filter(coach => 
        coach.displayName?.toLowerCase().includes(activeFilters.searchTerm.toLowerCase()) ||
        coach.bio?.toLowerCase().includes(activeFilters.searchTerm.toLowerCase())
      );
    }

    if (activeFilters.skills) {
      filtered = filtered.filter(coach => 
        coach.skills?.some(skill => 
          skill.toLowerCase().includes(activeFilters.skills.toLowerCase())
        )
      );
    }

    setFilteredCoaches(filtered);
  }, [coaches, activeFilters]);

  const handleContactCoach = (coach: UserProfile) => {
    // Rediriger vers le profil détaillé du coach
    navigate(`/talent/coach/${coach.id}`, { state: { coach } });
  };


  if (!user || user.role !== 'talent') {
    navigate('/dashboard/talent');
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#f5f5f7'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#1a1a1a',
        borderBottom: '1px solid #333',
        padding: screenWidth <= 768 ? '16px' : '24px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/dashboard/talent')}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffcc00',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ← Retour
            </button>
            <h1 style={{
              margin: 0,
              fontSize: screenWidth <= 768 ? '20px' : '24px',
              color: '#ffcc00'
            }}>
              Profils des Coaches
            </h1>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '8px 16px',
              backgroundColor: showFilters ? '#ffcc00' : 'transparent',
              color: showFilters ? '#0a0a0a' : '#ffcc00',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Filtrer
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div style={{
          backgroundColor: '#1a1a1a',
          borderBottom: '1px solid #333',
          padding: screenWidth <= 768 ? '16px' : '24px'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: screenWidth <= 768 ? '1fr' : '1fr 1fr',
            gap: '16px'
          }}>
            <input
              type="text"
              placeholder="Rechercher un coach..."
              value={activeFilters.searchTerm}
              onChange={(e) => setActiveFilters({
                ...activeFilters,
                searchTerm: e.target.value
              })}
              style={{
                padding: '8px 12px',
                backgroundColor: '#333',
                border: 'none',
                borderRadius: '4px',
                color: '#f5f5f7',
                fontSize: '14px'
              }}
            />
            <input
              type="text"
              placeholder="Compétences..."
              value={activeFilters.skills}
              onChange={(e) => setActiveFilters({
                ...activeFilters,
                skills: e.target.value
              })}
              style={{
                padding: '8px 12px',
                backgroundColor: '#333',
                border: 'none',
                borderRadius: '4px',
                color: '#f5f5f7',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: screenWidth <= 768 ? '16px' : '24px'
      }}>
        {isLoading ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#888'
          }}>
            Chargement des coaches...
          </div>
        ) : filteredCoaches.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#888'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '16px', fontWeight: 'bold', color: '#ffcc00' }}>Coaches</div>
            <p>Aucun coach trouvé</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: screenWidth <= 768 ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {filteredCoaches.map((coach) => (
              <div
                key={coach.id}
                style={{
                  backgroundColor: '#1a1a1a',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '20px',
                  transition: 'border-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ffcc00'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}
              >
                {/* Profile Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <Avatar
                    src={coach.avatarUrl}
                    alt={coach.displayName || 'Coach'}
                    size="medium"
                  />
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      margin: '0 0 4px 0',
                      color: '#ffcc00',
                      fontSize: '18px'
                    }}>
                      {coach.displayName || 'Coach'}
                    </h3>
                    {coach.position && (
                      <p style={{
                        margin: 0,
                        color: '#888',
                        fontSize: '14px'
                      }}>
                        {coach.position}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {coach.bio && (
                  <p style={{
                    color: '#f5f5f7',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    marginBottom: '16px'
                  }}>
                    {coach.bio.length > 100 ? `${coach.bio.substring(0, 100)}...` : coach.bio}
                  </p>
                )}

                {/* Skills */}
                {coach.skills && coach.skills.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px'
                    }}>
                      {coach.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          style={{
                            backgroundColor: '#333',
                            color: '#f5f5f7',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                      {coach.skills.length > 3 && (
                        <span style={{
                          color: '#888',
                          fontSize: '12px',
                          padding: '4px 8px'
                        }}>
                          +{coach.skills.length - 3} autres
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <button
                    onClick={() => handleContactCoach(coach)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#ffcc00',
                      color: '#0a0a0a',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    Contacter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TalentCoachesPage;