import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../contexts/AuthContext';
import { useNotifications } from '../components/NotificationManager';

interface Recommendation {
  id: string;
  coachId: string;
  coachName: string;
  talentId: string;
  talentName: string;
  recruiterId: string;
  recruiterName: string;
  jobId: string;           // OBLIGATOIRE - pour le bouton "Voir l'offre"
  jobTitle: string;
  jobCompany?: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export default function TalentRecommendationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  console.log('🎯 NOUVELLE PAGE TALENT RECOMMENDATIONS');

  useEffect(() => {
    if (user && user.role === 'talent') {
      loadRecommendations();
    } else {
      navigate('/dashboard/talent');
    }
  }, [user, navigate]);

  const loadRecommendations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      console.log('🔍 CHARGEMENT RECOMMANDATIONS pour talent:', user.id);
      
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      
      const recommendationsRef = collection(db, 'recommendations');
      const q = query(
        recommendationsRef,
        where('talentId', '==', user.id)
      );
      
      const snapshot = await getDocs(q);
      console.log('🔍 TROUVÉ', snapshot.docs.length, 'recommandations');
      
      const recommendationsData = snapshot.docs.map(doc => {
        const data = {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        };
        
        console.log('🔍 RECOMMANDATION:', {
          id: data.id,
          jobId: data.jobId,
          jobTitle: data.jobTitle,
          hasJobId: !!data.jobId ? '✅ OUI' : '❌ NON'
        });
        
        return data;
      }) as Recommendation[];
      
      // Tri côté client (plus récent en premier)
      recommendationsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des recommandations:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les recommandations'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#61bfac';
      case 'rejected': return '#ff6b6b';
      case 'pending': return '#ffcc00';
      default: return '#f5f5f7';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return '✅ Acceptée';
      case 'rejected': return '❌ Refusée';
      case 'pending': return '⏳ En attente';
      default: return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!user || user.role !== 'talent') {
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#f5f5f7',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32,
          paddingBottom: 16,
          borderBottom: '1px solid #333'
        }}>
          <div>
            <h1 style={{ color: '#ffcc00', margin: 0 }}>🎯 Mes Recommandations</h1>
            <p style={{ color: '#f5f5f7', margin: '8px 0 0 0' }}>
              Recommandations reçues de vos coaches
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/talent')}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#ffcc00',
              border: '0.5px solid #ffcc00',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← Retour au Dashboard
          </button>
        </div>

        {/* Statistiques */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32
        }}>
          <div style={{
            backgroundColor: '#111',
            padding: 20,
            borderRadius: 4,
            textAlign: 'center'
          }}>
            <div style={{ color: '#ffcc00', fontSize: '28px', fontWeight: 'bold' }}>
              {recommendations.length}
            </div>
            <div style={{ color: '#f5f5f7', fontSize: '14px' }}>
              Total
            </div>
          </div>
          <div style={{
            backgroundColor: '#111',
            padding: 20,
            borderRadius: 4,
            textAlign: 'center'
          }}>
            <div style={{ color: '#ffcc00', fontSize: '28px', fontWeight: 'bold' }}>
              {recommendations.filter(r => r.status === 'pending').length}
            </div>
            <div style={{ color: '#f5f5f7', fontSize: '14px' }}>
              En attente
            </div>
          </div>
          <div style={{
            backgroundColor: '#111',
            padding: 20,
            borderRadius: 4,
            textAlign: 'center'
          }}>
            <div style={{ color: '#61bfac', fontSize: '28px', fontWeight: 'bold' }}>
              {recommendations.filter(r => r.status === 'accepted').length}
            </div>
            <div style={{ color: '#f5f5f7', fontSize: '14px' }}>
              Acceptées
            </div>
          </div>
          <div style={{
            backgroundColor: '#111',
            padding: 20,
            borderRadius: 4,
            textAlign: 'center'
          }}>
            <div style={{ color: '#ff6b6b', fontSize: '28px', fontWeight: 'bold' }}>
              {recommendations.filter(r => r.status === 'rejected').length}
            </div>
            <div style={{ color: '#f5f5f7', fontSize: '14px' }}>
              Refusées
            </div>
          </div>
        </div>

        {/* Liste des recommandations */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#ffcc00', padding: 40, fontSize: '18px' }}>
            ⏳ Chargement de vos recommandations...
          </div>
        ) : recommendations.length === 0 ? (
          <div style={{
            backgroundColor: '#111',
            padding: 40,
            borderRadius: 4,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: 16 }}>📭</div>
            <div style={{ color: '#f5f5f7', fontSize: '20px', marginBottom: 8 }}>
              Aucune recommandation reçue
            </div>
            <div style={{ color: '#666', fontSize: '16px' }}>
              Vos coaches vous enverront des recommandations ici
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 20 }}>
            {recommendations.map(recommendation => (
              <div
                key={recommendation.id}
                style={{
                  backgroundColor: '#111',
                  padding: 24,
                  borderRadius: 4,
                  border: '1px solid #333'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start', 
                  marginBottom: 16 
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      color: '#ffcc00', 
                      fontSize: '20px', 
                      fontWeight: 'bold', 
                      marginBottom: 12 
                    }}>
                      📋 {typeof recommendation.jobTitle === 'string' ? recommendation.jobTitle : 'Poste'}
                    </div>
                    <div style={{ 
                      color: '#61bfac', 
                      fontSize: '16px', 
                      marginBottom: 8,
                      padding: '6px 12px',
                      backgroundColor: '#0a2a24',
                      borderRadius: '4px',
                      display: 'inline-block'
                    }}>
                      🏢 {typeof recommendation.jobCompany === 'string' ? recommendation.jobCompany : 'Entreprise'} 
                      • 👤 Recommandé à {typeof recommendation.recruiterName === 'string' ? recommendation.recruiterName : 'Recruteur'}
                    </div>
                    <div style={{ color: '#f5f5f7', fontSize: '14px', marginBottom: 4, marginTop: 12 }}>
                      👨‍💼 Par <strong>{typeof recommendation.coachName === 'string' ? recommendation.coachName : 'Coach'}</strong>
                    </div>
                    <div style={{ color: '#888', fontSize: '12px' }}>
                      📅 {formatDate(recommendation.createdAt)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{
                      padding: '8px 16px',
                      backgroundColor: getStatusColor(recommendation.status),
                      color: '#000',
                      borderRadius: 4,
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {getStatusText(recommendation.status)}
                    </span>
                  </div>
                </div>
                
                <div style={{ 
                  color: '#f5f5f7', 
                  fontSize: '15px', 
                  lineHeight: 1.6, 
                  marginBottom: 20,
                  padding: '16px',
                  backgroundColor: '#0a0a0a',
                  borderRadius: '4px',
                  border: '1px solid #222'
                }}>
                  <strong>💬 Message du coach :</strong><br />
                  <span style={{ fontStyle: 'italic' }}>"{typeof recommendation.message === 'string' ? recommendation.message : 'Message'}"</span>
                </div>

                {/* BOUTON PRINCIPAL - VOIR L'OFFRE */}
                <div style={{
                  paddingTop: 16,
                  borderTop: '1px solid #333',
                  textAlign: 'center'
                }}>
                  {recommendation.jobId ? (
                    <button
                      onClick={(e) => {
                        console.log('🔗 NAVIGATION vers offre:', recommendation.jobId, recommendation.jobTitle);
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/jobs/${recommendation.jobId}`);
                      }}
                      style={{
                        padding: '14px 28px',
                        backgroundColor: '#ffcc00',
                        color: '#000',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(255, 204, 0, 0.3)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(255, 204, 0, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(255, 204, 0, 0.3)';
                      }}
                    >
                      📋 Voir l'offre d'emploi
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/profile/${recommendation.recruiterId}`)}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: 'transparent',
                        color: '#ffcc00',
                        border: '2px solid #ffcc00',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      👤 Voir le profil du recruteur
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}