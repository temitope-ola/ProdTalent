import React, { useState, useEffect } from 'react';
import useAuth from '../contexts/AuthContext';
import { useNotifications } from './NotificationManager';

interface Recommendation {
  id: string;
  jobId: string;
  jobTitle: string;
  talentId: string;
  talentName: string;
  talentEmail: string;
  recruiterId: string;
  recruiterName: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  company?: string;
}

interface RecommendationsHistoryProps {
  onClose: () => void;
}

const RecommendationsHistory: React.FC<RecommendationsHistoryProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('📋 Chargement des recommandations pour le coach:', user.id);
      
      const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      
      // Première tentative avec orderBy
      try {
        const q = query(
          collection(db, 'recommendations'),
          where('coachId', '==', user.id),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const recommendationsData: Recommendation[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          recommendationsData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())
          } as Recommendation);
        });
        
        setRecommendations(recommendationsData);
        console.log('✅ Recommandations chargées:', recommendationsData.length);
      } catch (orderError) {
        console.log('⚠️ Erreur avec orderBy, tentative sans tri:', orderError);
        
        // Fallback sans orderBy si l'index n'existe pas
        const q = query(
          collection(db, 'recommendations'),
          where('coachId', '==', user.id)
        );
        
        const querySnapshot = await getDocs(q);
        const recommendationsData: Recommendation[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          recommendationsData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())
          } as Recommendation);
        });
        
        // Trier manuellement par date
        recommendationsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        setRecommendations(recommendationsData);
        console.log('✅ Recommandations chargées (sans orderBy):', recommendationsData.length);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des recommandations:', error);
      console.log('🔍 Détails de l\'erreur:', error);
      
      // Si aucune recommandation n'existe, on affiche juste une liste vide
      setRecommendations([]);
      console.log('📋 Aucune recommandation trouvée ou collection vide');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (selectedFilter === 'all') return true;
    return rec.status === selectedFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffcc00';
      case 'accepted': return '#4caf50';
      case 'rejected': return '#f44336';
      default: return '#888';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Acceptée';
      case 'rejected': return 'Refusée';
      default: return status;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '1000px',
        height: '90vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          borderBottom: '1px solid #333'
        }}>
          <h2 style={{ margin: 0, color: '#ffcc00', fontSize: '20px' }}>
            📋 Historique des Recommandations
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              color: '#f5f5f7',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Filtres */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '20px',
          borderBottom: '1px solid #333'
        }}>
          {[
            { key: 'all', label: 'Toutes', count: recommendations.length },
            { key: 'pending', label: 'En attente', count: recommendations.filter(r => r.status === 'pending').length },
            { key: 'accepted', label: 'Acceptées', count: recommendations.filter(r => r.status === 'accepted').length },
            { key: 'rejected', label: 'Refusées', count: recommendations.filter(r => r.status === 'rejected').length }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key as any)}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedFilter === filter.key ? '#ffcc00' : '#333',
                color: selectedFilter === filter.key ? '#000' : '#f5f5f7',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: selectedFilter === filter.key ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div style={{ 
          flex: 1, 
          padding: '20px', 
          overflow: 'auto'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <p>Chargement des recommandations...</p>
            </div>
          ) : filteredRecommendations.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#888'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <h3 style={{ color: '#f5f5f7', marginBottom: '8px' }}>
                Aucune recommandation {selectedFilter !== 'all' ? getStatusText(selectedFilter).toLowerCase() : ''}
              </h3>
              <p>
                {selectedFilter === 'all' 
                  ? 'Vous n\'avez pas encore fait de recommandations'
                  : 'Aucune recommandation ne correspond à ce filtre'
                }
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredRecommendations.map((recommendation) => (
                <div
                  key={recommendation.id}
                  style={{
                    backgroundColor: '#2a2a2a',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #333'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        margin: '0 0 8px 0', 
                        color: '#ffcc00',
                        fontSize: '16px'
                      }}>
                        💼 {recommendation.jobTitle}
                      </h4>
                      {recommendation.company && (
                        <div style={{ color: '#61bfac', marginBottom: '4px', fontSize: '14px' }}>
                          🏢 {recommendation.company}
                        </div>
                      )}
                      <div style={{ color: '#f5f5f7', marginBottom: '4px' }}>
                        👤 Talent recommandé : {recommendation.talentName}
                      </div>
                      <div style={{ color: '#f5f5f7', marginBottom: '4px' }}>
                        📧 {recommendation.talentEmail}
                      </div>
                      <div style={{ color: '#f5f5f7', marginBottom: '8px' }}>
                        🏢 Recruteur : {recommendation.recruiterName}
                      </div>
                      <div style={{ color: '#888', fontSize: '12px' }}>
                        📅 {formatDate(recommendation.createdAt)}
                      </div>
                    </div>
                    
                    <span style={{
                      backgroundColor: getStatusColor(recommendation.status),
                      color: recommendation.status === 'pending' ? '#000' : 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {getStatusText(recommendation.status)}
                    </span>
                  </div>
                  
                  {recommendation.message && (
                    <div style={{ 
                      color: '#ccc', 
                      fontSize: '14px',
                      fontStyle: 'italic',
                      backgroundColor: '#1a1a1a',
                      padding: '12px',
                      borderRadius: '4px',
                      borderLeft: '3px solid #ffcc00'
                    }}>
                      💬 "{recommendation.message}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationsHistory;