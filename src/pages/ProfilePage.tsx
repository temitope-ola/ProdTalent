import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService, UserProfile } from '../services/firestoreService';
import { useNotifications } from '../components/NotificationManager';
import Avatar from '../components/Avatar';
import ProfileEditModal from '../components/ProfileEditModal';
import ContactModal from '../components/ContactModal';

// Helper function to format salary object
const formatSalary = (salary: any): string => {
  if (!salary) return 'Salaire non communiqué';
  if (typeof salary === 'string') return salary;
  if (typeof salary === 'object' && salary.min && salary.max && salary.currency) {
    return `${salary.min} - ${salary.max} ${salary.currency}`;
  }
  if (typeof salary === 'object' && salary.min && salary.currency) {
    return `À partir de ${salary.min} ${salary.currency}`;
  }
  if (typeof salary === 'object' && salary.max && salary.currency) {
    return `Jusqu'à ${salary.max} ${salary.currency}`;
  }
  return 'Salaire non communiqué';
};

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotifications();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      try {
        setIsLoading(true);
        let userProfile: UserProfile | null = null;

        if (userId && userId !== user.id) {
          // Charger le profil d'un autre utilisateur (version optimisée)
          userProfile = await FirestoreService.getUserProfileOptimized(userId);
          setIsOwnProfile(false);
        } else {
          // Charger son propre profil (version optimisée)
          const currentUserId = user.id;
          userProfile = await FirestoreService.getUserProfileOptimized(currentUserId);
          setIsOwnProfile(true);
        }

        setProfile(userProfile);
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, userId, navigate]);

  // Load jobs for recruiters
  useEffect(() => {
    const loadJobs = async () => {
      if (profile && profile.role === 'recruteur') {
        setLoadingJobs(true);
        try {
          const { FirestoreService } = await import('../services/firestoreService');
          const jobsResult = await FirestoreService.getAllActiveJobs();
          if (jobsResult.success && jobsResult.data) {
            // Filter jobs by recruiter
            const recruiterJobs = jobsResult.data.filter(job => 
              job.recruiterId === profile.id || 
              job.recruiterEmail === profile.email
            );
            setJobs(recruiterJobs);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des offres:', error);
        } finally {
          setLoadingJobs(false);
        }
      }
    };

    loadJobs();
  }, [profile]);

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    await FirestoreService.updateProfile(updatedProfile.id, updatedProfile.role, {
      displayName: updatedProfile.displayName,
      bio: updatedProfile.bio,
      skills: updatedProfile.skills,
      linkedinUrl: updatedProfile.linkedinUrl,
      githubUrl: updatedProfile.githubUrl,
      cvUrl: updatedProfile.cvUrl
    });
  };

  const handleViewCV = (cvUrl: string) => {
    try {
      console.log('🔍 Ouverture du CV:', cvUrl.substring(0, 50) + '...');
      
      // Vérifier que l'URL est valide
      if (!cvUrl || cvUrl.trim() === '') {
        showNotification({
          type: 'error',
          title: 'Erreur',
          message: 'URL du CV invalide'
        });
        return;
      }

      // Vérifier si c'est une data URL (PDF en base64)
      if (cvUrl.startsWith('data:application/pdf;base64,')) {
        console.log('📄 Détection d\'un PDF en base64, téléchargement forcé...');
        
        // Créer un blob à partir de la data URL
        const response = fetch(cvUrl);
        response.then(res => res.blob()).then(blob => {
          // Créer un URL temporaire pour le blob
          const blobUrl = URL.createObjectURL(blob);
          
          // Créer un lien de téléchargement
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = 'CV.pdf';
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          
          // Déclencher le téléchargement
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Nettoyer l'URL temporaire après un délai
          setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
          }, 1000);
          
          console.log('✅ PDF téléchargé avec succès');
        }).catch(error => {
          console.error('❌ Erreur lors du traitement du PDF:', error);
          // Fallback: essayer d'ouvrir quand même
          window.open(cvUrl, '_blank');
        });
      } else {
        // URL normale - utiliser la méthode standard
        console.log('🔗 URL normale détectée, ouverture dans nouvel onglet...');
        
        const link = document.createElement('a');
        link.href = cvUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ CV ouvert avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'ouverture du CV:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible d\'ouvrir le CV. Veuillez réessayer.'
      });
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

  const handleDeleteAccount = async () => {
    if (!user || !profile) return;

    // Demander confirmation à l'utilisateur
    const isConfirmed = window.confirm(
      '⚠️ ATTENTION : Cette action est irréversible !\n\n' +
      'Êtes-vous sûr de vouloir supprimer votre compte ?\n' +
      'Toutes vos données seront définitivement supprimées.'
    );

    if (!isConfirmed) return;

    try {
      // Afficher une notification de chargement
      showNotification({
        type: 'info',
        title: 'Suppression en cours',
        message: 'Votre compte est en cours de suppression...'
      });

      // Supprimer le profil de Firestore
      await FirestoreService.deleteProfile(profile.id, profile.role);

      // Supprimer le compte utilisateur de Firebase Auth
      await FirestoreService.deleteUserAccount();

      // Afficher une notification de succès
      showNotification({
        type: 'success',
        title: 'Compte supprimé',
        message: 'Votre compte a été supprimé avec succès.'
      });

      // Rediriger vers la page d'accueil
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Une erreur est survenue lors de la suppression de votre compte.'
      });
    }
  };

  const getBackLink = () => {
    // Récupérer le paramètre 'from' de l'URL
    const searchParams = new URLSearchParams(location.search);
    const from = searchParams.get('from');
    
    // Si l'utilisateur connecté est un coach
    if (user && user.role === 'coach') {
      if (from === 'coach-talents') {
        return '/coach/talents';
      }
      if (from === 'coach-recruteurs') {
        return '/coach/recruteurs';
      }
      // Sinon retourner au dashboard coach
      return '/dashboard/coach';
    }
    
    // Si l'utilisateur connecté est un recruteur
    if (user && user.role === 'recruteur') {
      if (from === 'recruiter-talents') {
        return '/talents';
      }
      // Sinon retourner au dashboard recruteur
      return '/dashboard/recruteur';
    }
    
    // Sinon retourner au dashboard approprié
    if (!profile) return '/';
    switch (profile.role) {
              case 'talent': return '/dashboard/talent';
              case 'recruteur': return '/dashboard/recruteur';
        case 'coach': return '/dashboard/coach';
      default: return '/';
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#f5f5f7'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '3px solid #333',
          borderTop: '3px solid #ffcc00',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }} />
        <h2 style={{ 
          color: '#ffcc00', 
          margin: '0 0 8px 0',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          ProdTalent
        </h2>
        <p style={{ 
          color: '#888', 
          margin: 0,
          fontSize: '14px'
        }}>
          Chargement du profil...
        </p>
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `
        }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#000', 
        color: '#f5f5f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        Profil non trouvé
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
              onClick={() => navigate(getBackLink())}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#ffcc00',
                border: '1px solid #ffcc00',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '12px'
              }}
            >
              Retour
            </button>
            <h1 style={{ margin: 0, color: '#ffcc00' }}>
              {isOwnProfile ? 'Mon Profil' : `Profil de ${profile.displayName || (profile.email ? profile.email.split('@')[0] : 'Utilisateur')}`}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
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
          </div>
        </header>

        {/* Profile Content */}
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Profile Card */}
          <div style={{
            backgroundColor: '#111',
            borderRadius: 4,
            border: 'transparent',
            overflow: 'hidden',
            marginBottom: 24
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              {/* Avatar */}
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
                  editable={isOwnProfile}
                  onImageChange={async (file) => {
                    try {
                      const avatarUrl = await FirestoreService.uploadAvatar(file);
                      await FirestoreService.updateProfile(profile.id, profile.role, { avatarUrl });
                      setProfile({ ...profile, avatarUrl });
                            } catch (error) {
          console.error('Erreur lors de l\'upload de l\'avatar:', error);
          showNotification({
            type: 'error',
            title: 'Erreur d\'upload',
            message: 'Erreur lors de l\'upload de l\'avatar'
          });
        }
                  }}
                />
              </div>

              {/* Profile Info */}
              <div style={{ flex: 1, padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h2 style={{ color: '#f5f5f7', margin: '0 0 8px 0', fontSize: '24px' }}>
                      {profile.displayName || (profile.email ? profile.email.split('@')[0] : 'Utilisateur')}
                    </h2>
                    <p style={{ color: '#888', margin: '0 0 4px 0' }}>
                      <strong>Rôle:</strong> {profile.role}
                    </p>
                    <p style={{ color: '#888', margin: '0' }}>
                      <strong>Membre depuis:</strong> {profile.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {isOwnProfile ? (
                      <button
                        onClick={handleEditProfile}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'transparent',
                          color: '#ffcc00',
                          border: '1px solid #ffcc00',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginTop: '12px'
                        }}
                      >
                        Modifier
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsContactModalOpen(true)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#ffcc00',
                          color: '#000',
                          border: '1px solid #ffcc00',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginTop: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        Contacter
                      </button>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ color: '#ffcc00', margin: '0 0 8px 0', fontSize: '16px' }}>Bio</h3>
                    <p style={{ color: '#f5f5f7', margin: 0, lineHeight: '1.5' }}>{profile.bio}</p>
                  </div>
                )}

                {/* Contact Info */}
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ color: '#ffcc00', margin: '0 0 8px 0', fontSize: '16px' }}>Contact</h3>
                  <p style={{ color: '#f5f5f7', margin: '0 0 4px 0' }}>
                    <strong>Email:</strong> {profile.email}
                  </p>
                </div>

                {/* Social Links */}
                {(profile.linkedinUrl || profile.githubUrl) && (
                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ color: '#ffcc00', margin: '0 0 8px 0', fontSize: '16px' }}>Liens</h3>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {profile.linkedinUrl && (
                        <a
                          href={profile.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#ffcc00',
                            textDecoration: 'none',
                            fontSize: '14px',
                            padding: '4px 8px',
                            border: '1px solid #ffcc00',
                            borderRadius: '4px'
                          }}
                        >
                          🔗 LinkedIn
                        </a>
                      )}
                      {profile.githubUrl && (
                        <a
                          href={profile.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#ffcc00',
                            textDecoration: 'none',
                            fontSize: '14px',
                            padding: '4px 8px',
                            border: '1px solid #ffcc00',
                            borderRadius: '4px'
                          }}
                        >
                          🐙 GitHub
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* CV */}
                {profile.cvUrl && (
                  <div>
                    <h3 style={{ color: '#ffcc00', margin: '0 0 8px 0', fontSize: '16px' }}>CV</h3>
                    <button
                      onClick={() => handleViewCV(profile.cvUrl!)}
                      style={{
                        color: '#ffcc00',
                        backgroundColor: 'transparent',
                        fontSize: '14px',
                        padding: '8px 12px',
                        border: '1px solid #ffcc00',
                        borderRadius: '4px',
                        display: 'inline-block',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffcc00';
                        e.currentTarget.style.color = '#000';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#ffcc00';
                      }}
                    >
                      📄 Voir le CV
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional sections based on role */}
          {profile.role === 'talent' && (
            <div style={{
              backgroundColor: '#111',
              borderRadius: 4,
              padding: '20px',
              marginBottom: 24
            }}>
              <h3 style={{ color: '#ffcc00', margin: '0 0 16px 0' }}>Compétences</h3>
              {profile.skills ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {Array.isArray(profile.skills) ? (
                    // Si c'est un tableau (nouveau format)
                    profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        style={{
                          backgroundColor: '#333',
                          color: '#ffcc00',
                          padding: '6px 12px',
                          borderRadius: '15px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          border: '1px solid #555'
                        }}
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    // Si c'est une chaîne (ancien format)
                    profile.skills.split(',').map((skill, index) => (
                      <span
                        key={index}
                        style={{
                          backgroundColor: '#333',
                          color: '#ffcc00',
                          padding: '6px 12px',
                          borderRadius: '15px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          border: '1px solid #555'
                        }}
                      >
                        {skill.trim()}
                      </span>
                    ))
                  )}
                </div>
              ) : (
                <p style={{ color: '#888', margin: 0, fontStyle: 'italic' }}>
                  Aucune compétence renseignée
                </p>
              )}
            </div>
          )}

          {profile.role === 'recruteur' && (
            <div style={{
              backgroundColor: '#111',
              borderRadius: 4,
              padding: '20px',
              marginBottom: 24
            }}>
              <h3 style={{ color: '#ffcc00', margin: '0 0 16px 0' }}>📋 Offres d'emploi ({jobs.length})</h3>
              
              {loadingJobs ? (
                <div style={{ color: '#f5f5f7', textAlign: 'center', padding: '20px' }}>
                  Chargement des offres...
                </div>
              ) : jobs.length === 0 ? (
                <p style={{ color: '#666', margin: 0, fontStyle: 'italic' }}>
                  Aucune offre d'emploi active
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {jobs.slice(0, 5).map(job => (
                    <div
                      key={job.id}
                      style={{
                        backgroundColor: '#0a0a0a',
                        padding: '16px',
                        borderRadius: '4px',
                        border: '1px solid #333',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s'
                      }}
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#ffcc00';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#333';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <h4 style={{ color: '#f5f5f7', margin: 0, fontSize: '16px' }}>
                          {job.title}
                        </h4>
                        <span style={{
                          backgroundColor: job.isActive ? '#61bfac' : '#ff6b6b',
                          color: '#000',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {job.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div style={{ color: '#888', fontSize: '14px', marginBottom: '4px' }}>
                        🏢 {job.company || 'Entreprise'} • 📍 {job.location || 'Non spécifié'}
                      </div>
                      <div style={{ color: '#ccc', fontSize: '13px' }}>
                        💰 {formatSalary(job.salary)}
                      </div>
                    </div>
                  ))}
                  {jobs.length > 5 && (
                    <div style={{ 
                      textAlign: 'center', 
                      color: '#666', 
                      fontSize: '14px',
                      fontStyle: 'italic',
                      marginTop: '8px'
                    }}>
                      ... et {jobs.length - 5} autre(s) offre(s)
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {profile.role === 'coach' && (
            <div style={{
              backgroundColor: '#111',
              borderRadius: 4,
              padding: '20px',
              marginBottom: 24
            }}>
              <h3 style={{ color: '#ffcc00', margin: '0 0 16px 0' }}>Services de Coaching</h3>
              <p style={{ color: '#f5f5f7', margin: 0 }}>
                Section pour afficher les services de coaching...
              </p>
            </div>
          )}

          {/* Section Sécurité - Visible seulement pour le propriétaire du profil */}
          {isOwnProfile && (
            <div style={{
              backgroundColor: '#1a1a1a',
              borderRadius: 4,
              padding: '20px',
              marginBottom: 24,
              border: '1px solid #333'
            }}>
              <h3 style={{ color: '#ffcc00', margin: '0 0 16px 0' }}>🔒 Sécurité du compte</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ color: '#f5f5f7', margin: 0, fontSize: '14px' }}>
                  Gérez la sécurité de votre compte et vos données personnelles.
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleDeleteAccount}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#ff0000',
                      color: '#ffffff',
                      border: '2px solid #ff0000',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#cc0000';
                      e.currentTarget.style.borderColor = '#cc0000';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ff0000';
                      e.currentTarget.style.borderColor = '#ff0000';
                    }}
                    title="Supprimer définitivement votre compte et toutes vos données"
                  >
                    ⚠️ Supprimer mon compte
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#333',
                      color: '#f5f5f7',
                      border: '1px solid #555',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Se déconnecter
                  </button>
                </div>
                <p style={{ color: '#888', margin: '8px 0 0 0', fontSize: '12px', fontStyle: 'italic' }}>
                  ⚠️ La suppression de compte est irréversible. Toutes vos données seront définitivement supprimées.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {isOwnProfile && profile && (
          <ProfileEditModal
            profile={profile}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveProfile}
          />
        )}

        {/* Modal de contact */}
        {profile && user && (
          <ContactModal
            isOpen={isContactModalOpen}
            onClose={() => setIsContactModalOpen(false)}
            talentName={profile.displayName || profile.email.split('@')[0]}
            talentEmail={profile.email}
            talentId={profile.id}
            fromUserProfile={user}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
