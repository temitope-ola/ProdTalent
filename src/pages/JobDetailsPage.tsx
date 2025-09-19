import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../contexts/AuthContext';
import { useNotifications } from '../components/NotificationManager';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string | { min?: number; max?: number; currency?: string };
  description: string;
  requirements?: string;
  benefits?: string;
  contractType?: string;
  experience?: string;
  recruiterId: string;
  recruiterName?: string;
  recruiterEmail?: string;
  createdAt: Date;
  status: string;
}

export default function JobDetailsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('🔍 PAGE DETAILS OFFRE - JobId:', jobId);

  useEffect(() => {
    if (jobId) {
      loadJobDetails();
    } else {
      navigate('/jobs');
    }
  }, [jobId]);

  const loadJobDetails = async () => {
    if (!jobId) return;
    
    try {
      setLoading(true);
      console.log('🔍 Chargement des détails pour jobId:', jobId);

      const { FirestoreService } = await import('../services/firestoreService');
      
      const jobResult = await FirestoreService.getJobById(jobId);
      
      if (jobResult.success && jobResult.data) {
        console.log('✅ Offre trouvée:', jobResult.data.title, jobResult.data.company);
        setJob(jobResult.data);
      } else {
        console.error('❌ Offre non trouvée pour ID:', jobId);
        showNotification({
          type: 'error',
          title: 'Erreur',
          message: 'Cette offre d\'emploi n\'existe pas ou n\'est plus disponible'
        });
        navigate('/jobs');
      }
    } catch (error) {
      console.error('❌ Erreur chargement offre:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les détails de l\'offre'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ color: '#ffcc00', fontSize: '18px' }}>
          ⏳ Chargement de l'offre...
        </div>
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
        alignItems: 'center'
      }}>
        <div style={{ color: '#f5f5f7', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '16px', color: '#ff6b6b' }}>Erreur</div>
          <div style={{ fontSize: '20px', marginBottom: '16px' }}>Offre non trouvée</div>
          <button 
            onClick={() => navigate('/jobs')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ffcc00',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← Retour aux offres
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#f5f5f7',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {/* Header avec bouton retour */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          paddingBottom: '16px',
          borderBottom: '1px solid #333'
        }}>
          <h1 style={{ color: '#ffcc00', margin: 0 }}>Détails de l'offre</h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#ffcc00',
                border: '0.5px solid #ffcc00',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ← Retour
            </button>
            <button
              onClick={() => navigate('/jobs')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ffcc00',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Toutes les offres
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        <div style={{
          backgroundColor: '#111',
          padding: '32px',
          borderRadius: '4px',
          border: 'none'
        }}>
          {/* Titre et entreprise */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ 
              color: '#ffcc00', 
              fontSize: '32px', 
              margin: '0 0 16px 0' 
            }}>
              {job.title}
            </h1>
            <div style={{ 
              display: 'flex', 
              gap: '24px', 
              flexWrap: 'wrap',
              fontSize: '16px'
            }}>
              <div style={{ color: '#61bfac' }}>
                <strong>{job.company}</strong>
              </div>
              <div style={{ color: '#f5f5f7' }}>
                {job.location}
              </div>
              {job.salary && (
                <div style={{ color: '#f5f5f7' }}>
                  {typeof job.salary === 'object' 
                    ? `${job.salary.min || 0}-${job.salary.max || 0} ${job.salary.currency || 'EUR'}`
                    : job.salary}
                </div>
              )}
              <div style={{ color: '#888' }}>
                Publié le {formatDate(job.createdAt)}
              </div>
            </div>
          </div>

          {/* Informations complémentaires */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            {job.contractType && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#0a0a0a',
                borderRadius: '4px'
              }}>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>
                  TYPE DE CONTRAT
                </div>
                <div style={{ color: '#f5f5f7', fontWeight: 'bold' }}>
                  {job.contractType}
                </div>
              </div>
            )}
            {job.experience && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#0a0a0a',
                borderRadius: '4px'
              }}>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>
                  EXPÉRIENCE
                </div>
                <div style={{ color: '#f5f5f7', fontWeight: 'bold' }}>
                  {job.experience}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#ffcc00', fontSize: '24px', marginBottom: '16px' }}>
              Description du poste
            </h2>
            <div style={{
              color: '#f5f5f7',
              fontSize: '16px',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap'
            }}>
              {job.description}
            </div>
          </div>

          {/* Exigences */}
          {job.requirements && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ color: '#ffcc00', fontSize: '24px', marginBottom: '16px' }}>
                Exigences
              </h2>
              <div style={{
                color: '#f5f5f7',
                fontSize: '16px',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap'
              }}>
                {job.requirements}
              </div>
            </div>
          )}

          {/* Avantages */}
          {job.benefits && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ color: '#ffcc00', fontSize: '24px', marginBottom: '16px' }}>
                Avantages
              </h2>
              <div style={{
                color: '#f5f5f7',
                fontSize: '16px',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap'
              }}>
                {job.benefits}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{
            paddingTop: '24px',
            borderTop: '1px solid #333',
            display: 'flex',
            gap: '16px',
            justifyContent: 'center'
          }}>
            {user?.role === 'talent' && (
              <button
                onClick={() => navigate(`/jobs/${job.id}/apply`)}
                style={{
                  padding: '16px 32px',
                  backgroundColor: '#ffcc00',
                  color: '#000',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Postuler à cette offre
              </button>
            )}
            <button
              onClick={() => navigate(`/profile/${job.recruiterId}`)}
              style={{
                padding: '16px 32px',
                backgroundColor: 'transparent',
                color: '#ffcc00',
                border: '2px solid #ffcc00',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Voir le recruteur
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}