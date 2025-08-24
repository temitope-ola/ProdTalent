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

export default function TalentRecommendationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

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
      const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      
      const recommendationsRef = collection(db, 'recommendations');
      
      // Essayer d'abord avec l'ID utilisateur (sans orderBy pour éviter l'index)
      let q = query(
        recommendationsRef,
        where('talentId', '==', user.id)
      );
      
      let snapshot = await getDocs(q);
      
      // Si aucune recommandation trouvée, essayer avec l'email
      if (snapshot.docs.length === 0 && user.email) {
        q = query(
          recommendationsRef,
          where('talentEmail', '==', user.email)
        );
        snapshot = await getDocs(q);
      }
      const recommendationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Recommendation[];
      
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'acceptée': return '#61bfac';
      case 'refusée': return '#ff6b6b';
      case 'en_attente': return '#ffcc00';
      default: return '#f5f5f7';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'acceptée': return '✅ Acceptée par le recruteur';
      case 'refusée': return '❌ Refusée par le recruteur';
      case 'en_attente': return '⏳ En attente de réponse';
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
            <h1 style={{ color: '#ffcc00', margin: 0 }}>Mes Recommandations</h1>
            <p style={{ color: '#f5f5f7', margin: '8px 0 0 0' }}>
              Recommandations envoyées par vos coaches
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
            Retour au Dashboard
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
            border: 'transparent',
            textAlign: 'center'
          }}>
            <div style={{ color: '#ffcc00', fontSize: '24px', fontWeight: 'bold' }}>
              {recommendations.length}
            </div>
            <div style={{ color: '#f5f5f7', fontSize: '14px' }}>
              Total des recommandations
            </div>
          </div>
          <div style={{
            backgroundColor: '#111',
            padding: 20,
            borderRadius: 4,
            border: 'transparent',
            textAlign: 'center'
          }}>
            <div style={{ color: '#ffcc00', fontSize: '24px', fontWeight: 'bold' }}>
              {recommendations.filter(r => r.status === 'en_attente').length}
            </div>
            <div style={{ color: '#f5f5f7', fontSize: '14px' }}>
              En attente
            </div>
          </div>
          <div style={{
            backgroundColor: '#111',
            padding: 20,
            borderRadius: 4,
            border: 'transparent',
            textAlign: 'center'
          }}>
            <div style={{ color: '#61bfac', fontSize: '24px', fontWeight: 'bold' }}>
              {recommendations.filter(r => r.status === 'acceptée').length}
            </div>
            <div style={{ color: '#f5f5f7', fontSize: '14px' }}>
              Acceptées
            </div>
          </div>
          <div style={{
            backgroundColor: '#111',
            padding: 20,
            borderRadius: 4,
            border: 'transparent',
            textAlign: 'center'
          }}>
            <div style={{ color: '#ff6b6b', fontSize: '24px', fontWeight: 'bold' }}>
              {recommendations.filter(r => r.status === 'refusée').length}
            </div>
            <div style={{ color: '#f5f5f7', fontSize: '14px' }}>
              Refusées
            </div>
          </div>
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
            <div style={{ color: '#666', fontSize: '14px' }}>
              Vos coaches vous enverront des recommandations ici
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
                      Recommandé à {recommendation.recruiterName}
                    </div>
                    <div style={{ color: '#f5f5f7', fontSize: '14px', marginBottom: 4 }}>
                      Par <strong>{recommendation.coachName}</strong>
                    </div>
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      {formatDate(recommendation.createdAt)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{
                      padding: '6px 12px',
                      backgroundColor: getStatusColor(recommendation.status),
                      color: '#000',
                      borderRadius: 4,
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {getStatusText(recommendation.status)}
                    </span>
                  </div>
                </div>
                
                <div style={{ color: '#f5f5f7', fontSize: '14px', lineHeight: 1.6, marginBottom: 16 }}>
                  <strong>Message du coach :</strong><br />
                  {recommendation.message}
                </div>

                <div style={{
                  paddingTop: 16,
                  borderTop: '1px solid #333'
                }}>
                  <button
                    onClick={() => navigate(`/profile/${recommendation.recruiterId}`)}
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
                    Voir le profil du recruteur
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
