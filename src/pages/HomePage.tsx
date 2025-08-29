import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../contexts/AuthContext';
import { FeaturedTalentsService, FeaturedTalent } from '../services/featuredTalentsService';

type Mode = 'login' | 'signup';
type Role = 'talent' | 'recruteur' | 'coach';

export default function HomePage() {
  const { user, signUp, login } = useAuth();
  const navigate = useNavigate();
  

  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>('login');
  const [role, setRole] = React.useState<Role>('talent');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [featuredTalents, setFeaturedTalents] = React.useState<FeaturedTalent[]>([]);
  const [loadingTalents, setLoadingTalents] = React.useState(true);

  // Détecter la taille d'écran
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Charger les talents mis en avant
  React.useEffect(() => {
    const loadFeaturedTalents = async () => {
      try {
        const talents = await FeaturedTalentsService.getFeaturedTalents();
        setFeaturedTalents(talents);
      } catch (error) {
        console.error('Erreur lors du chargement des talents:', error);
      } finally {
        setLoadingTalents(false);
      }
    };

    loadFeaturedTalents();
  }, []);

  React.useEffect(() => {
    if (user) {
      navigate(`/dashboard/${user.role}`, { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (mode === 'signup') {
        await signUp(email, password, role);
        setSuccess('Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.');
        setTimeout(() => {
          navigate(`/dashboard/${role}`, { replace: true });
        }, 2000);
      } else {
        await login(email, password);
        setSuccess('Connexion réussie !');
      }
      setOpen(false);
    } catch (err: any) {
      console.error('Erreur auth:', err);
      if (err.message.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect');
      } else if (err.message.includes('Email not confirmed')) {
        setError('Veuillez confirmer votre email avant de vous connecter');
      } else if (err.message.includes('User already registered')) {
        setError('Un compte existe déjà avec cet email');
      } else {
        setError(err.message || 'Une erreur est survenue');
      }
    } finally {
      setBusy(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setSuccess(null);
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    resetForm();
  };

  return (
    <main style={{ 
      padding: 0, 
      color: '#f5f5f7',
      backgroundColor: '#0a0a0a',
      minHeight: '100vh',
      width: '100%'
    }}>

      {/* Header avec effet de flou */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px 24px',
        background: 'rgba(10, 10, 10, 0.4)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          width: '1214px',
          maxWidth: '100%'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h1 style={{ 
              margin: 0, 
              color: '#ffcc00',
              fontSize: '28px',
              fontWeight: '700'
            }}>
              ProdTalent
            </h1>
            <span style={{ 
              color: '#61bfac', 
              fontSize: '12px', 
              marginTop: '2px',
              fontWeight: '500'
            }}>
              Un produit d'Edacy
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div style={{ 
            display: isMobile ? 'none' : 'flex', 
            gap: 12
          }}>
            <button 
              onClick={() => { handleModeChange('login'); setOpen(true); }}
              style={{
                padding: '10px 20px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#f5f5f7',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Se connecter
            </button>
            <button 
              onClick={() => { handleModeChange('signup'); setRole('recruteur'); setOpen(true); }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ffcc00',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              S'inscrire
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              display: isMobile ? 'flex' : 'none',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              width: '40px',
              height: '40px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <div style={{
              width: '24px',
              height: '2px',
              backgroundColor: '#f5f5f7',
              marginBottom: '4px',
              transition: 'all 0.3s ease',
              transform: isMobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
            }} />
            <div style={{
              width: '24px',
              height: '2px',
              backgroundColor: '#f5f5f7',
              marginBottom: '4px',
              transition: 'all 0.3s ease',
              opacity: isMobileMenuOpen ? 0 : 1
            }} />
            <div style={{
              width: '24px',
              height: '2px',
              backgroundColor: '#f5f5f7',
              transition: 'all 0.3s ease',
              transform: isMobileMenuOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none'
            }} />
          </button>
        </div>
      </header>


      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 99,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            width: '100%',
            maxWidth: '300px'
          }}>
            <button 
              onClick={() => { 
                handleModeChange('login'); 
                setOpen(true); 
                setIsMobileMenuOpen(false); 
              }}
              style={{
                padding: '16px 24px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#f5f5f7',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                width: '100%'
              }}
            >
              Se connecter
            </button>
            <button 
              onClick={() => { 
                handleModeChange('signup'); 
                setRole('recruteur'); 
                setOpen(true); 
                setIsMobileMenuOpen(false); 
              }}
              style={{
                padding: '16px 24px',
                backgroundColor: '#ffcc00',
                color: '#000',
                border: '1px solid #ffcc00',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                width: '100%'
              }}
            >
              S'inscrire
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#888',
                border: '1px solid #333',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '16px',
                marginTop: '20px'
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Hero Section sur toute la largeur */}
      <section style={{ 
        position: 'relative',
        padding: isMobile ? '80px 0 60px' : '140px 0 100px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
        width: '100%'
      }}>
        {/* Particules animées en arrière-plan */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(255, 204, 0, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(97, 191, 172, 0.05) 0%, transparent 50%)',
          animation: 'pulse 4s ease-in-out infinite alternate'
        }} />
        
        <div style={{ 
          position: 'relative', 
          zIndex: 2,
          maxWidth: '1214px',
          margin: '0 auto',
          padding: isMobile ? '0 16px' : '0 24px'
        }}>
          <h2 style={{ 
            fontSize: isMobile ? '2.5rem' : '4.5rem', 
            marginBottom: '32px', 
            color: '#ffcc00',
            fontWeight: '800',
            lineHeight: '1.1',
            letterSpacing: '-0.02em',
            maxWidth: '800px',
            margin: '0 auto 32px'
          }}>
            Le talent ne tient pas sur une page,
          </h2>
          <p style={{ 
            fontSize: isMobile ? '1.8rem' : '3.2rem', 
            color: '#f5f5f7', 
            marginBottom: isMobile ? '40px' : '60px',
            fontWeight: '700',
            lineHeight: '1.2'
          }}>
            Rencontrez-le.
          </p>
          <p style={{ 
            fontSize: isMobile ? '1rem' : '1.3rem', 
            color: '#f5f5f7', 
            marginBottom: isMobile ? '40px' : '80px',
            fontWeight: '400',
            maxWidth: '600px',
            margin: '0 auto 100px',
            lineHeight: '1.5',
            opacity: '0.9'
          }}>
ProdTalent est une initiative d'Edacy qui met en lumière le potentiel unique de ses talents.
Notre ambition est de dépasser le simple CV pour révéler les parcours, les compétences et l'énergie créative de chacun. Avec ProdTalent, nous donnons aux talents la visibilité qu'ils méritent et offrons aux entreprises l'opportunité de rencontrer des profils qui feront la différence.          </p>
          
          {/* Statistiques Edacy */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: isMobile ? '40px' : '100px',
            marginBottom: isMobile ? '60px' : '100px',
            flexWrap: isMobile ? 'wrap' : 'nowrap'
          }}>
            <div style={{ textAlign: 'center' }}>
              <img 
                src="/icons/students.png" 
                alt="Étudiants"
                style={{
                  width: isMobile ? '36px' : '48px',
                  height: isMobile ? '36px' : '48px',
                  marginBottom: isMobile ? '12px' : '20px'
                }}
              />
              <div style={{ 
                fontSize: isMobile ? '2.5rem' : '3.5rem', 
                fontWeight: '900', 
                color: '#ffcc00',
                marginBottom: isMobile ? '8px' : '16px'
              }}>
                10K+
              </div>
              <div style={{ color: '#f5f5f7', fontSize: isMobile ? '0.9rem' : '1.1rem', fontWeight: '500' }}>Étudiants formés</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <img 
                src="/icons/companies.png" 
                alt="Entreprises"
                style={{
                  width: '48px',
                  height: '48px',
                  marginBottom: '20px'
                }}
              />
              <div style={{ 
                fontSize: '3.5rem', 
                fontWeight: '900', 
                color: '#61bfac',
                marginBottom: '16px'
              }}>
                5K+
              </div>
              <div style={{ color: '#f5f5f7', fontSize: '1.1rem', fontWeight: '500' }}>Entreprises partenaires</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <img 
                src="/icons/coaches.png" 
                alt="Formateurs"
                style={{
                  width: '48px',
                  height: '48px',
                  marginBottom: '20px'
                }}
              />
              <div style={{ 
                fontSize: '3.5rem', 
                fontWeight: '900', 
                color: '#ffcc00',
                marginBottom: '16px'
              }}>
                50+
              </div>
              <div style={{ color: '#f5f5f7', fontSize: '1.1rem', fontWeight: '500' }}>Formateurs & Coaches</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <img 
                src="/icons/countries.png" 
                alt="Pays"
                style={{
                  width: '48px',
                  height: '48px',
                  marginBottom: '20px'
                }}
              />
              <div style={{ 
                fontSize: '3.5rem', 
                fontWeight: '900', 
                color: '#61bfac',
                marginBottom: '16px'
              }}>
                8
              </div>
              <div style={{ color: '#f5f5f7', fontSize: '1.1rem', fontWeight: '500' }}>Pays</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Aperçu des Talents */}
      <section style={{ 
        padding: isMobile ? '80px 16px' : '120px 24px',
        background: '#0a0a0a',
        maxWidth: '1214px',
        margin: '0 auto'
      }}>
        <div style={{ 
          textAlign: 'center',
          marginBottom: isMobile ? '60px' : '80px'
        }}>
          <h2 style={{ 
            color: '#ffcc00',
            fontSize: isMobile ? '2rem' : '3rem',
            fontWeight: '700',
            marginBottom: '16px'
          }}>
            1, 2, 3… jusqu'à 100 profils exceptionnels
          </h2>
          <p style={{ 
            color: '#f5f5f7',
            fontSize: isMobile ? '1.1rem' : '1.3rem',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Découvrez nos talents formés et validés par d'Edacy
          </p>
        </div>

        {/* Cartes talents dynamiques */}
        {loadingTalents ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 0',
            color: '#f5f5f7'
          }}>
            Chargement des talents...
          </div>
        ) : featuredTalents.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 0',
            color: '#f5f5f7'
          }}>
            Aucun talent mis en avant pour le moment.
          </div>
        ) : (
          <>
            {/* Première ligne - 2 cartes côte à côte */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '30px',
              marginBottom: '30px'
            }}>
              {featuredTalents.slice(0, 2).map((talent, index) => (
                <div key={talent.id} style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  height: '200px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
                }}
                >
                  {/* Section Photo - Gauche */}
                  <div style={{
                    width: '200px',
                    position: 'relative',
                    flexShrink: 0,
                    overflow: 'hidden'
                  }}>
                    <img 
                      src={talent.photoUrl || '/images/talents/talent1.jpg'} 
                      alt={talent.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.currentTarget.src = '/images/talents/talent1.jpg';
                      }}
                    />
                  </div>
                  
                  {/* Section Texte - Droite */}
                  <div style={{
                    background: '#2c2c2c',
                    padding: '24px',
                    position: 'relative',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <p style={{ 
                      color: '#ffffff',
                      fontSize: '1.1rem',
                      lineHeight: '1.6',
                      marginBottom: '16px',
                      fontStyle: 'italic'
                    }}>
                      "{talent.quote}"
                    </p>
                    <p style={{ 
                      color: '#cccccc',
                      fontSize: '0.9rem',
                      marginBottom: '0'
                    }}>
                      {talent.name}, {talent.role}
                    </p>
                    

                  </div>
                </div>
              ))}
            </div>

            {/* Troisième carte - centrée en dessous */}
            {featuredTalents.length > 2 && (
              <div style={{ 
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '30px'
              }}>
                {(() => {
                  const talent = featuredTalents[2];
                  return (
                    <div style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      position: 'relative',
                      display: 'flex',
                      height: '200px',
                      width: isMobile ? '100%' : '600px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
                    }}
                    >
                      {/* Section Photo - Gauche */}
                      <div style={{
                        width: '200px',
                        position: 'relative',
                        flexShrink: 0,
                        overflow: 'hidden'
                      }}>
                        <img 
                          src={talent.photoUrl || '/images/talents/talent3.jpg'} 
                          alt={talent.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.currentTarget.src = '/images/talents/talent3.jpg';
                          }}
                        />
                      </div>
                      
                      {/* Section Texte - Droite */}
                      <div style={{
                        background: '#2c2c2c',
                        padding: '24px',
                        position: 'relative',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <p style={{ 
                          color: '#ffffff',
                          fontSize: '1.1rem',
                          lineHeight: '1.6',
                          marginBottom: '16px',
                          fontStyle: 'italic'
                        }}>
                          "{talent.quote}"
                        </p>
                        <p style={{ 
                          color: '#cccccc',
                          fontSize: '0.9rem',
                          marginBottom: '0'
                        }}>
                          {talent.name}, {talent.role}
                        </p>
                        

                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </>
        )}

        <div style={{ 
          textAlign: 'center',
          marginTop: '40px'
        }}>
          <button 
            onClick={() => { handleModeChange('signup'); setRole('recruteur'); setOpen(true); }}
            style={{
              padding: '16px 32px',
              backgroundColor: '#ffcc00',
              color: '#000',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: '700',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 24px rgba(255, 204, 0, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 204, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 204, 0, 0.3)';
            }}
          >
            Voir plus de talents
          </button>
          <p style={{ 
            color: '#888',
            fontSize: '0.9rem',
            marginTop: '16px'
          }}>
            Inscrivez-vous en tant que recruteur pour accéder à tous nos profils
          </p>
        </div>
      </section>

      {/* Section des rôles */}
      <section style={{ 
        padding: isMobile ? '60px 16px' : '100px 24px',
        background: '#transparent',
        maxWidth: '1214px',
        margin: '0 auto'
      }}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: isMobile ? '40px' : '60px'
        }}>
          
          {/* Carte Talent */}
          <div style={{
            background: '#1a1a1a',
            padding: isMobile ? '30px' : '50px',
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.background = '#222';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = '#1a1a1a';
          }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: '#ffcc00',
              borderRadius: '0 16px 0 100px',
              opacity: '0.1'
            }} />
            
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{
                width: '70px',
                height: '70px',
                background: '#ffcc00',
                borderRadius: '12px',
                fontWeight: '800',
                color: '#303030',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '32px',
                fontSize: '22px'
              }}>
                Talent
              </div>
              
              <h3 style={{ 
                color: '#ffcc00', 
                marginTop: 0, 
                marginBottom: '24px',
                fontSize: '2rem',
                fontWeight: '700'
              }}>
                Un rêve qui prend vie
              </h3>
              <p style={{ 
                color: '#f5f5f7', 
                lineHeight: '1.6',
                marginBottom: '32px',
                fontSize: '1.1rem'
              }}>
                Le monde avance grâce à celles et ceux qui osent rêver.
Chez ProdTalent, nous croyons en ces rêveurs, en ces bâtisseurs d'avenir.
Nous ne voyons pas seulement des compétences, mais des possibles.
Et notre mission, c'est de transformer ces possibles en réalités.
              </p>
              
              <ul style={{ 
                color: '#f5f5f7', 
                paddingLeft: '20px',
                marginBottom: '40px'
              }}>
                <li style={{ marginBottom: '12px' }}>Diplômés certifiés Edacy, prêts à bâtir l'avenir.</li>
                <li style={{ marginBottom: '12px' }}>Un profil unique, qui révèle votre potentiel.</li>
                <li style={{ marginBottom: '12px' }}>Des recruteurs accessibles, sans détour.</li>
                <li style={{ marginBottom: '12px' }}>Un coaching dédié, à chaque étape.</li>
                <li style={{ marginBottom: '12px' }}>Des opportunités rares, pour aller plus loin.</li>
              </ul>
              
              <button
                onClick={() => { handleModeChange('signup'); setRole('talent'); setOpen(true); }}
                style={{
                  width: '100%',
                  padding: '18px 24px',
                  backgroundColor: '#ffcc00',
                  color: '#000',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Rejoindre comme Talent
              </button>
            </div>
          </div>

          {/* Carte Recruteur */}
          <div style={{
            background: '#1a1a1a',
            padding: '50px',
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.background = '#222';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = '#1a1a1a';
          }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: '#61bfac',
              borderRadius: '0 16px 0 100px',
              opacity: '0.1'
            }} />
            
            <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
                width: '70px',
                height: '70px',
                background: '#61bfac',
                borderRadius: '12px',
                fontWeight: '800',
                color: '#303030',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingLeft: '5px',
                marginBottom: '32px',
                fontSize: '22px'
              }}>
               Recr
               uteur
              </div>
              
              <h3 style={{ 
                color: '#61bfac', 
                marginTop: 0, 
                marginBottom: '24px',
                fontSize: '2rem',
                fontWeight: '700'
              }}>
                Un recrutement qui a du sens
              </h3>
              <p style={{ 
                color: '#f5f5f7', 
                lineHeight: '1.6',
                marginBottom: '32px',
                fontSize: '1.1rem'
              }}>
                Trouver le bon talent, ce n'est pas cocher des cases.
C'est découvrir une énergie, une vision, une personne qui fera grandir votre équipe.
Avec ProdTalent, chaque profil est plus qu'un CV : c'est un parcours validé, un potentiel révélé.
Nous simplifions vos recrutementspour vous permettre de vous concentrer sur l'essentiel : bâtir l'avenir avec les meilleurs..</p>
              
              <ul style={{ 
                color: '#f5f5f7', 
                paddingLeft: '20px',
                marginBottom: '40px'
              }}>
                <li style={{ marginBottom: '12px' }}>
  Des talents diplômés Edacy, prêts à relever vos défis.
</li>
<li style={{ marginBottom: '12px' }}>
  Une base de données fiable et qualifiée.
</li>
<li style={{ marginBottom: '12px' }}>
  Un système de matching IA, qui vous fait gagner du temps.
</li>
<li style={{ marginBottom: '12px' }}>
  Des profils détaillés et vérifiés, en toute confiance.
</li>
<li>
  Un processus optimisé, pensé pour l'efficacité.
</li>
              </ul>
              
              <button
                onClick={() => { handleModeChange('signup'); setRole('recruteur'); setOpen(true); }}
                style={{
                  width: '100%',
                  padding: '18px 24px',
                  backgroundColor: '#61bfac',
                  color: '#000',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Rejoindre comme Recruteur
              </button>
            </div>
          </div>
        </div>

        {/* Carte Coach - Clé de la réussite */}
        <div style={{
          background: '#1a1a1a',
          padding: '60px',
          borderRadius: '16px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          maxWidth: '600px',
          margin: '80px auto 0',
          textAlign: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.background = '#222';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.background = '#1a1a1a';
        }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '120px',
            height: '120px',
            background: '#ffcc00',
            borderRadius: '0 16px 0 120px',
            opacity: '0.1'
          }} />
          
          <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
                width: '70px',
                height: '70px',
                background: '#ffcc00',
                borderRadius: '12px',
                fontWeight: '800',
                color: '#303030',
                display: 'flex',
                alignItems: 'left',
                justifyContent: 'left',
                paddingLeft: '3px',
                marginBottom: '32px',
                fontSize: '22px'
              }}>
              Coach
            </div>
            
            <h3 style={{ 
              color: '#ffcc00', 
              marginTop: 0, 
              marginBottom: '24px',
              fontSize: '2.2rem',
              fontWeight: '700',
              textAlign: 'left'
              
            }}>
              La Coach, votre alliée pour aller plus loin
            </h3>
            <p style={{ 
              color: '#f5f5f7', 
              lineHeight: '1.6',
              marginBottom: '32px',
              fontSize: '1.2rem',
              textAlign: 'left'
            }}>
             Chez ProdTalent, la coach est bien plus qu’une accompagnatrice.
Elle est celle qui croit en vos capacités, même quand vous doutez.
Celle qui éclaire votre chemin, vous pousse à sortir de votre zone de confort
et transforme chaque étape en une opportunité de grandir. </p>
            
            <div style={{ 
              background: 'rgba(255, 204, 0, 0.1)',
              padding: '32px',
              borderRadius: '12px',
              marginBottom: '40px'
            }}>
              <p style={{ 
                color: '#ffcc00', 
                fontWeight: '600',
                margin: '0',
                fontSize: '1.1rem',
              
              }}>
               Avec elle, vos compétences ne sont pas seulement renforcées, elles prennent vie.
Vous découvrez votre potentiel, vous gagnez en confiance,
et vous avancez avec l’assurance que vous n’êtes jamais seule dans ce parcours. </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal d'authentification */}
      {open && (
        <div 
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#1a1a1a',
              padding: 32,
              borderRadius: 16,
              maxWidth: 400,
              width: '90%'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24
            }}>
              <h2 style={{ color: '#ffcc00', margin: 0 }}>
                {mode === 'login' ? 'Connexion' : 'Inscription'}
              </h2>
            </div>

            {error && (
              <div style={{
                padding: 12,
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                color: '#ff6b6b',
                borderRadius: 8,
                marginBottom: 16
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                padding: 12,
                backgroundColor: 'rgba(97, 191, 172, 0.1)',
                color: '#61bfac',
                borderRadius: 8,
                marginBottom: 16
              }}>
                {success}
              </div>
            )}

            <form onSubmit={onSubmit}>
              {mode === 'signup' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ color: '#f5f5f7', display: 'block', marginBottom: '8px' }}>
                    Rôle *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    required
                    style={{
                      width: '100%',
                      padding: 12,
                      backgroundColor: '#333',
                      color: '#f5f5f7',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: '14px'
                    }}
                  >
                    <option value="recruteur">Recruteur</option>
                  </select>
                  <p style={{ 
                    color: '#61bfac', 
                    fontSize: '12px', 
                    marginTop: '8px',
                    marginBottom: 0
                  }}>
                    💡 Les talents et coaches reçoivent un lien d'invitation personnalisé
                  </p>
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ color: '#f5f5f7', display: 'block', marginBottom: 8 }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: 12,
                    backgroundColor: '#333',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ color: '#f5f5f7', display: 'block', marginBottom: 8 }}>
                  Mot de passe *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: 12,
                    backgroundColor: '#333',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: '14px'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                style={{
                  width: '100%',
                  padding: 14,
                  backgroundColor: busy ? '#666' : '#ffcc00',
                  color: '#000',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: busy ? 'not-allowed' : 'pointer'
                }}
              >
                {busy ? 'Chargement...' : (mode === 'login' ? 'Se connecter' : 'S\'inscrire')}
              </button>
            </form>

            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <button
                onClick={() => handleModeChange(mode === 'login' ? 'signup' : 'login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffcc00',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {mode === 'login' ? 'Pas encore de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `
      }} />

    </main>
  );
}
