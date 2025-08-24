import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService, UserProfile } from '../services/firestoreService';
import { useNotifications } from '../components/NotificationManager';
import Avatar from '../components/Avatar';
import ProfileEditModal from '../components/ProfileEditModal';
import ContactModal from '../components/ContactModal';

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
          // Charger le profil d'un autre utilisateur
          userProfile = await FirestoreService.getProfileById(userId);
          setIsOwnProfile(false);
        } else {
          // Charger son propre profil en utilisant getProfileById
          const userId = user.id;
          userProfile = await FirestoreService.getProfileById(userId);
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

  const handleLogout = async () => {
    try {
      await FirestoreService.signOut();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
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
        backgroundColor: '#000', 
        color: '#f5f5f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        Chargement du profil...
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
                    <a
                      href={profile.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#ffcc00',
                        textDecoration: 'none',
                        fontSize: '14px',
                        padding: '4px 8px',
                        border: '1px solid #ffcc00',
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}
                    >
                      📄 Voir le CV
                    </a>
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
                <p style={{ color: '#f5f5f7', margin: 0, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {profile.skills}
                </p>
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
              <h3 style={{ color: '#ffcc00', margin: '0 0 16px 0' }}>Entreprise</h3>
              <p style={{ color: '#f5f5f7', margin: 0 }}>
                Section pour afficher les informations de l'entreprise...
              </p>
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
