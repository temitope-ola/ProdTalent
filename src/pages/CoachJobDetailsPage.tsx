import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService, UserProfile } from '../services/firestoreService';
import { JobService } from '../services/jobService';
import { useNotifications } from '../components/NotificationManager';
import sendGridTemplateService from '../services/sendGridTemplateService';

interface Recommendation {
  id?: string;
  coachId: string;
  coachName: string;
  talentId: string;
  talentName: string;
  recruiterId: string;
  recruiterName: string;
  jobId: string;
  jobTitle: string;
  message: string;
  status: 'en_attente' | 'acceptée' | 'refusée';
  createdAt: Date;
  updatedAt?: Date;
}

export default function CoachJobDetailsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const { showNotification } = useNotifications();
  
  const [job, setJob] = useState<any>(null);
  const [talents, setTalents] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRecommendationForm, setShowRecommendationForm] = useState(false);
  const [selectedTalents, setSelectedTalents] = useState<string[]>([]);
  const [recommendationMessage, setRecommendationMessage] = useState('');
  const [isCreatingRecommendation, setIsCreatingRecommendation] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'coach') {
      navigate('/dashboard/coach');
      return;
    }

    if (jobId) {
      loadJobDetails();
      loadTalents();
    }
  }, [user, jobId, navigate]);

  const loadJobDetails = async () => {
    try {
      setIsLoading(true);
      const jobResult = await JobService.getJobById(jobId!);
      if (jobResult.success && jobResult.data) {
        setJob(jobResult.data);
      } else {
        setError('Impossible de charger les détails de l\'offre d\'emploi');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'offre:', error);
      setError('Impossible de charger les détails de l\'offre d\'emploi');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTalents = async () => {
    try {
      const talentsData = await FirestoreService.getUsersByRole('talent');
      setTalents(talentsData);
    } catch (error) {
      console.error('Erreur lors du chargement des talents:', error);
    }
  };

  const handleCreateRecommendation = async () => {
    if (!user || selectedTalents.length === 0 || !recommendationMessage.trim()) {
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Veuillez sélectionner au moins un talent et saisir un message'
      });
      return;
    }

    setIsCreatingRecommendation(true);
    
    try {
      // Créer une recommandation pour chaque talent sélectionné
      for (const talentId of selectedTalents) {
        const talent = talents.find(t => t.id === talentId);
        if (!talent) continue;

        const recommendation: Recommendation = {
          coachId: user.id,
          coachName: user.email?.split('@')[0] || 'Coach',
          talentId: talent.id,
          talentName: talent.firstName && talent.lastName ? 
            `${talent.firstName} ${talent.lastName}` : talent.email?.split('@')[0] || 'Talent',
          recruiterId: job.recruiterId,
          recruiterName: job.recruiterName || 'Recruteur',
          jobId: job.id,
          jobTitle: job.title,
          message: recommendationMessage,
          status: 'en_attente',
          createdAt: new Date()
        };

        await FirestoreService.addDocument('recommendations', recommendation);
        
        // Envoyer notification SendGrid template au recruteur
        try {
          const { default: sendGridTemplateService } = await import('../services/sendGridTemplateService');
          await sendGridTemplateService.sendMessageNotification({
            recipientEmail: job.recruiterEmail || '',
            recipientName: job.recruiterName || 'Recruteur',
            senderName: recommendation.coachName,
            senderRole: 'Coach',
            messagePreview: `Recommandation de talent pour "${job.title}": ${recommendation.talentName} - ${recommendationMessage.substring(0, 100)}...`
          });
        } catch (emailError) {
          console.error('Erreur lors de l\'envoi de l\'email SendGrid:', emailError);
        }
      }

      showNotification({
        type: 'success',
        title: 'Recommandation créée',
        message: `Recommandation envoyée pour ${selectedTalents.length} talent(s)`
      });

      // Reset form
      setSelectedTalents([]);
      setRecommendationMessage('');
      setShowRecommendationForm(false);

    } catch (error) {
      console.error('Erreur lors de la création de la recommandation:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de créer la recommandation'
      });
    } finally {
      setIsCreatingRecommendation(false);
    }
  };

  const toggleTalentSelection = (talentId: string) => {
    setSelectedTalents(prev => 
      prev.includes(talentId) 
        ? prev.filter(id => id !== talentId)
        : [...prev, talentId]
    );
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#ffcc00'
      }}>
        Chargement...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#ff6b6b'
      }}>
        {error}
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#888'
      }}>
        Offre d'emploi non trouvée
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#f5f5f7',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <button
            onClick={() => navigate('/dashboard/coach')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#333',
              color: '#f5f5f7',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Retour au dashboard
          </button>
          
          <button
            onClick={() => setShowRecommendationForm(!showRecommendationForm)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ffcc00',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            📋 Recommander des talents
          </button>
        </div>

        {/* Job Details */}
        <div style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '4px',
          padding: '30px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '20px'
          }}>
            <div>
              <h1 style={{
                margin: '0 0 8px 0',
                color: '#ffcc00',
                fontSize: '28px',
                fontWeight: '600'
              }}>
                {String(job.title || 'Titre non spécifié')}
              </h1>
              <p style={{
                margin: '0 0 4px 0',
                color: '#f5f5f7',
                fontSize: '18px'
              }}>
                {String(job.company || 'Entreprise non spécifiée')}
              </p>
              <p style={{
                margin: 0,
                color: '#888',
                fontSize: '16px'
              }}>
                📍 {String(job.location || 'Localisation non spécifiée')} • 
                💼 {String(job.contractType || 'Type de contrat non spécifié')} • 
                💰 {String(job.salary || 'Salaire non spécifié')}
              </p>
            </div>
            <div style={{
              padding: '6px 12px',
              backgroundColor: '#61bfac',
              borderRadius: '4px',
              fontSize: '14px',
              color: '#000',
              fontWeight: 'bold'
            }}>
              Actif
            </div>
          </div>

          <div style={{
            borderTop: '1px solid #333',
            paddingTop: '20px'
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
              {String(job.description || 'Aucune description disponible')}
            </p>
          </div>

          {job.requirements && (
            <div style={{
              borderTop: '1px solid #333',
              paddingTop: '20px',
              marginTop: '20px'
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
                {String(job.requirements)}
              </p>
            </div>
          )}
        </div>

        {/* Recommendation Form */}
        {showRecommendationForm && (
          <div style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '4px',
            padding: '30px'
          }}>
            <h2 style={{
              margin: '0 0 20px 0',
              color: '#ffcc00',
              fontSize: '20px'
            }}>
              Recommander des talents pour cette offre
            </h2>

            {/* Talent Selection */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                margin: '0 0 12px 0',
                color: '#f5f5f7',
                fontSize: '16px'
              }}>
                Sélectionner les talents à recommander :
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '12px',
                marginBottom: '20px'
              }}>
                {talents.map((talent) => (
                  <div
                    key={talent.id}
                    onClick={() => toggleTalentSelection(talent.id)}
                    style={{
                      padding: '12px',
                      backgroundColor: selectedTalents.includes(talent.id) ? '#333' : '#0a0a0a',
                      border: selectedTalents.includes(talent.id) ? '2px solid #ffcc00' : '1px solid #333',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      fontSize: '14px',
                      color: '#f5f5f7',
                      fontWeight: '500',
                      marginBottom: '4px'
                    }}>
                      {talent.firstName && talent.lastName ? 
                        `${talent.firstName} ${talent.lastName}` : 
                        talent.email?.split('@')[0] || 'Talent'}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#888'
                    }}>
                      {talent.skills ? `Compétences: ${talent.skills.slice(0, 3).join(', ')}` : 'Aucune compétence renseignée'}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#888'
              }}>
                {selectedTalents.length} talent(s) sélectionné(s)
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                color: '#f5f5f7',
                fontSize: '16px',
                marginBottom: '8px'
              }}>
                Message de recommandation :
              </label>
              <textarea
                value={recommendationMessage}
                onChange={(e) => setRecommendationMessage(e.target.value)}
                placeholder="Expliquez pourquoi vous recommandez ce(s) talent(s) pour cette offre..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '12px',
                  backgroundColor: '#0a0a0a',
                  color: '#f5f5f7',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowRecommendationForm(false)}
                disabled={isCreatingRecommendation}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleCreateRecommendation}
                disabled={isCreatingRecommendation || selectedTalents.length === 0 || !recommendationMessage.trim()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: isCreatingRecommendation || selectedTalents.length === 0 || !recommendationMessage.trim() 
                    ? '#666' : '#ffcc00',
                  color: '#000',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isCreatingRecommendation || selectedTalents.length === 0 || !recommendationMessage.trim() 
                    ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {isCreatingRecommendation ? 'Envoi en cours...' : 'Envoyer la recommandation'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}