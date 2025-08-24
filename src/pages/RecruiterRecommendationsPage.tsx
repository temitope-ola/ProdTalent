import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../contexts/AuthContext';
import { useNotifications } from '../components/NotificationManager';

interface Recommendation {
  id?: string;
  coachId: string;
  coachName: string;
  talentId: string;
  talentName: string;
  recruiterId: string;
  recruiterName: string;
  message: string;
  status: 'en_attente' | 'acceptée' | 'refusée';
  createdAt: Date;
  updatedAt?: Date;
}

export default function RecruiterRecommendationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.role === 'recruteur') {
      loadRecommendations();
    } else {
      navigate('/dashboard/recruteur');
    }
  }, [user, navigate]);

  const loadRecommendations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      
      const recommendationsRef = collection(db, 'recommendations');
      
      // Recherche simple - toutes les recommandations (sans orderBy pour éviter l'index)
      const q = query(recommendationsRef);
      
      const snapshot = await getDocs(q);
      
      // Filtrer manuellement par nom de recruteur
      const filteredDocs = snapshot.docs.filter(doc => {
        const data = doc.data();
        const recruiterName = data.recruiterName?.toLowerCase() || '';
        const userDisplayName = (user.displayName || user.email?.split('@')[0] || '').toLowerCase();
        return recruiterName.includes(userDisplayName) || userDisplayName.includes(recruiterName);
      });
      
      const recommendationsData = filteredDocs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate()
        };
      }) as Recommendation[];
      
      // Tri côté client par date de création (plus récent en premier)
      recommendationsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error('Erreur lors du chargement des recommandations:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les recommandations'
      });
    } finally {
      setLoading(false);
    }
  };



  if (!user || user.role !== 'recruteur') {
    return null;
  }

  // Vérification de sécurité pour TypeScript
  const userInfo = {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    emailPrefix: user.email?.split('@')[0]
  };

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
            <h1 style={{ color: '#ffcc00', margin: 0 }}>Recommandations Reçues</h1>
            <p style={{ color: '#f5f5f7', margin: '8px 0 0 0' }}>
              Recommandations de talents par les coaches
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/recruteur')}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#ffcc00',
              border: '0.5px solid #ffcc00',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retour au Dashboard
          </button>
        </div>



        {/* Liste des recommandations */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#f5f5f7', padding: 40 }}>
            Chargement des recommandations...
          </div>
        ) : recommendations.length === 0 ? (
          <div style={{
            backgroundColor: '#111',
            padding: 40,
            borderRadius: 4,
            border: 'transparent',
            textAlign: 'center'
          }}>
            <div style={{ color: '#f5f5f7', fontSize: '18px', marginBottom: 8 }}>
              Aucune recommandation reçue
            </div>
            <div style={{ color: '#666', fontSize: '14px', marginBottom: 16 }}>
              Les coaches vous enverront des recommandations de talents ici
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {recommendations.map(recommendation => (
              <div
                key={recommendation.id}
                style={{
                  backgroundColor: '#111',
                  padding: 24,
                  borderRadius: 4,
                  border: 'transparent'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ color: '#ffcc00', fontSize: '18px', fontWeight: 'bold', marginBottom: 8 }}>
                      {recommendation.talentName}
                    </div>
                    <div style={{ color: '#f5f5f7', fontSize: '14px', marginBottom: 4 }}>
                      Recommandé par <strong>{recommendation.coachName}</strong>
                    </div>
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      {recommendation.createdAt.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{
                      padding: '6px 12px',
                      backgroundColor: recommendation.status === 'acceptée' ? '#61bfac' : 
                                     recommendation.status === 'refusée' ? '#ff6b6b' : '#ffcc00',
                      color: '#000',
                      borderRadius: 4,
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {recommendation.status}
                    </span>
                  </div>
                </div>
                
                <div style={{ color: '#f5f5f7', fontSize: '14px', lineHeight: 1.6, marginBottom: 16 }}>
                  {recommendation.message}
                </div>

                <div style={{
                  paddingTop: 16,
                  borderTop: '1px solid #333'
                }}>
                  <button
                    onClick={() => navigate(`/profile/${recommendation.talentId}`)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      color: '#ffcc00',
                      border: '0.5px solid #ffcc00',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Voir le profil du talent
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
