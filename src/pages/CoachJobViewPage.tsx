import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService, UserProfile } from '../services/firestoreService';
// JobService methods are now in FirestoreService
import { useNotifications } from '../components/NotificationManager';

export default function CoachJobViewPage() {
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

  console.log('🔥 CoachJobViewPage - Rendu avec:', { user: user?.email, role: user?.role, jobId });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    if (user.role !== 'coach') {
      navigate(`/dashboard/${user.role}`);
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
      console.log('🔥 Chargement offre:', jobId);
      
      const jobResult = await FirestoreService.getJobById(jobId!);
      
      if (jobResult.success && jobResult.data) {
        console.log('✅ Offre chargée:', jobResult.data);
        setJob(jobResult.data);
      } else {
        console.error('❌ Erreur chargement offre:', jobResult);
        setError('Impossible de charger les détails de l\'offre d\'emploi');
      }
    } catch (error) {
      console.error('❌ Exception chargement offre:', error);
      setError('Impossible de charger les détails de l\'offre d\'emploi');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTalents = async () => {
    try {
      console.log('🔥 Chargement talents...');
      const talentsData = await FirestoreService.getUsersByRole('talent');
      console.log('✅ Talents chargés:', talentsData.length);
      setTalents(talentsData);
    } catch (error) {
      console.error('❌ Erreur chargement talents:', error);
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
      for (const talentId of selectedTalents) {
        const talent = talents.find(t => t.id === talentId);
        if (!talent) continue;

        const recommendation = {
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
      }

      showNotification({
        type: 'success',
        title: 'Recommandation créée',
        message: `Recommandation envoyée pour ${selectedTalents.length} talent(s)`
      });

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
        color: '#ffcc00',
        fontSize: '18px'
      }}>
        Chargement de l'offre d'emploi...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#ff6b6b',
        padding: '20px'
      }}>
        <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Erreur</h1>
        <p style={{ fontSize: '16px', marginBottom: '20px', textAlign: 'center' }}>{error}</p>
        <button
          onClick={() => navigate('/dashboard/coach')}
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
          Retour au dashboard
        </button>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#888',
        padding: '20px'
      }}>
        <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Offre non trouvée</h1>
        <p style={{ fontSize: '16px', marginBottom: '20px' }}>L'offre d'emploi demandée n'existe pas ou a été supprimée.</p>
        <button
          onClick={() => navigate('/dashboard/coach')}
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
          Retour au dashboard
        </button>
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
                Sélectionner les talents à recommander ({talents.length} disponibles) :
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '12px',
                marginBottom: '20px',
                maxHeight: '300px',
                overflowY: 'auto'
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
                      {talent.skills && talent.skills.length > 0 ? 
                        `Compétences: ${talent.skills.slice(0, 3).join(', ')}` : 
                        'Aucune compétence renseignée'
                      }
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