import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService, UserProfile } from '../services/firestoreService';
import { useNotifications } from '../components/NotificationManager';
import Avatar from '../components/Avatar';

const TalentCoachProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { coachId } = useParams();
  const { showNotification } = useNotifications();
  
  const [coach, setCoach] = useState<UserProfile | null>(location.state?.coach || null);
  const [isLoading, setIsLoading] = useState(!coach);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadCoachProfile = async () => {
      if (!coach && coachId) {
        try {
          setIsLoading(true);
          const coachProfile = await FirestoreService.getCurrentProfile(coachId, 'coach');
          if (coachProfile) {
            setCoach(coachProfile);
          } else {
            showNotification({
              type: 'error',
              title: 'Erreur',
              message: 'Coach non trouvé'
            });
            navigate('/talent/coaches');
          }
        } catch (error) {
          console.error('Erreur lors du chargement du profil coach:', error);
          showNotification({
            type: 'error',
            title: 'Erreur',
            message: 'Impossible de charger le profil du coach'
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadCoachProfile();
  }, [coachId, coach, navigate, showNotification]);

  const handleSendMessage = async () => {
    if (!user || !coach || !message.trim()) return;

    try {
      setIsSending(true);
      console.log('📤 Envoi message au coach:', coach.displayName);

      const currentProfile = await FirestoreService.getCurrentProfile(user.id, user.role);
      await FirestoreService.sendMessage(
        user.id, 
        coach.id, 
        `Message depuis le profil`, 
        message.trim(), 
        currentProfile
      );

      // Notification email au coach
      try {
        const { BackendEmailService } = await import('../services/backendEmailService');
        
        const senderName = currentProfile.displayName || currentProfile.firstName || user.email.split('@')[0];
        const coachName = coach.displayName || coach.firstName || 'Coach';

        if (coach.email) {
          await BackendEmailService.sendMessageNotification({
            recipientEmail: coach.email,
            recipientName: coachName,
            senderName: senderName,
            senderRole: 'Talent',
            messagePreview: message.trim().substring(0, 100) + (message.trim().length > 100 ? '...' : '')
          });
        }
      } catch (emailError) {
        console.error('❌ Erreur envoi notification:', emailError);
      }

      showNotification({
        type: 'success',
        title: 'Message envoyé',
        message: `Votre message a été envoyé à ${coach.displayName || 'ce coach'}`
      });

      setMessage('');
      
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible d\'envoyer le message'
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!user || user.role !== 'talent') {
    navigate('/dashboard/talent');
    return null;
  }

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#f5f5f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div>Chargement du profil...</div>
        </div>
      </div>
    );
  }

  if (!coach) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#f5f5f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <div>Coach non trouvé</div>
        </div>
      </div>
    );
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
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <button
            onClick={() => navigate('/talent/coaches')}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffcc00',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ← Retour aux profils
          </button>
          <h1 style={{
            margin: 0,
            fontSize: screenWidth <= 768 ? '20px' : '24px',
            color: '#ffcc00'
          }}>
            Profil Coach
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: screenWidth <= 768 ? '16px' : '24px'
      }}>
        {/* Profile Section */}
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: screenWidth <= 768 ? '20px' : '32px',
          marginBottom: '24px'
        }}>
          {/* Profile Header */}
          <div style={{
            display: 'flex',
            flexDirection: screenWidth <= 768 ? 'column' : 'row',
            alignItems: screenWidth <= 768 ? 'center' : 'flex-start',
            gap: '24px',
            marginBottom: '32px'
          }}>
            <Avatar
              src={coach.avatarUrl}
              alt={coach.displayName || 'Coach'}
              size="large"
            />
            <div style={{ 
              flex: 1,
              textAlign: screenWidth <= 768 ? 'center' : 'left'
            }}>
              <h2 style={{
                margin: '0 0 8px 0',
                color: '#ffcc00',
                fontSize: '28px'
              }}>
                {coach.displayName || 'Coach'}
              </h2>
              {coach.position && (
                <p style={{
                  margin: '0 0 16px 0',
                  color: '#888',
                  fontSize: '18px'
                }}>
                  {coach.position}
                </p>
              )}
              {coach.email && (
                <p style={{
                  margin: '0 0 8px 0',
                  color: '#f5f5f7',
                  fontSize: '14px'
                }}>
                  📧 {coach.email}
                </p>
              )}
              {coach.phone && (
                <p style={{
                  margin: '0',
                  color: '#f5f5f7',
                  fontSize: '14px'
                }}>
                  📱 {coach.phone}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          {coach.bio && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                color: '#ffcc00',
                fontSize: '18px',
                marginBottom: '12px'
              }}>
                À propos
              </h3>
              <p style={{
                color: '#f5f5f7',
                fontSize: '16px',
                lineHeight: '1.6',
                margin: 0
              }}>
                {coach.bio}
              </p>
            </div>
          )}

          {/* Skills */}
          {coach.skills && coach.skills.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                color: '#ffcc00',
                fontSize: '18px',
                marginBottom: '12px'
              }}>
                Compétences
              </h3>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {coach.skills.map((skill, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: '#333',
                      color: '#f5f5f7',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {coach.experience && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                color: '#ffcc00',
                fontSize: '18px',
                marginBottom: '12px'
              }}>
                Expérience
              </h3>
              <p style={{
                color: '#f5f5f7',
                fontSize: '16px',
                lineHeight: '1.6',
                margin: 0
              }}>
                {coach.experience}
              </p>
            </div>
          )}
        </div>

        {/* Message Section */}
        <div style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: screenWidth <= 768 ? '20px' : '32px'
        }}>
          <h3 style={{
            color: '#ffcc00',
            fontSize: '20px',
            marginBottom: '16px'
          }}>
            Envoyer un message
          </h3>
          
          <div style={{ marginBottom: '16px' }}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Écrivez votre message à ${coach.displayName || 'ce coach'}...`}
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '12px',
                backgroundColor: '#333',
                color: '#f5f5f7',
                border: '1px solid #555',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || isSending}
              style={{
                padding: '12px 24px',
                backgroundColor: message.trim() && !isSending ? '#ffcc00' : '#555',
                color: message.trim() && !isSending ? '#0a0a0a' : '#888',
                border: 'none',
                borderRadius: '8px',
                cursor: message.trim() && !isSending ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {isSending ? 'Envoi...' : 'Envoyer le message'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentCoachProfilePage;