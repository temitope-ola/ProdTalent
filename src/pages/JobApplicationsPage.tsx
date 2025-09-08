import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import { JobService } from '../services/jobService';

interface Application {
  id: string;
  jobId: string;
  talentId: string;
  talentName: string;
  talentEmail: string;
  coverLetter: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  talentProfile?: any;
}

export default function JobApplicationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  
  console.log('🔥 JobApplicationsPage - Rendu avec:', { user: user?.email, role: user?.role, jobId });
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    // Rediriger selon le rôle si pas de jobId
    if (!jobId) {
      if (user.role === 'recruteur') {
        navigate('/dashboard/recruteur');
      } else if (user.role === 'coach') {
        navigate('/dashboard/coach');
      }
      return;
    }

    if (jobId) {
      loadJobAndApplications();
    }
  }, [user, jobId, navigate]);

  const loadJobAndApplications = async () => {
    try {
      setIsLoading(true);
      
      // Charger l'annonce
      const jobResult = await JobService.getJobById(jobId!);
      
      if (!jobResult.success || !jobResult.data) {
        setError('Impossible de charger l\'offre d\'emploi');
        return;
      }
      
      const jobData = jobResult.data;
      
      // Vérifier les permissions selon le rôle
      if (user?.role === 'recruteur') {
        // Pour les recruteurs, vérifier que l'annonce leur appartient
        if (jobData.recruiterId !== user.id) {
          setError('Vous n\'êtes pas autorisé à voir les candidatures de cette annonce');
          return;
        }
      }
      // Pour les coachs, pas de vérification - ils peuvent voir toutes les offres
      
      setJob(jobData);
      
      // Charger les candidatures (seulement pour les recruteurs)
      let applicationsData = [];
      if (user?.role === 'recruteur') {
        const applicationsResult = await JobService.getJobApplications(jobId!);
        if (applicationsResult.success && applicationsResult.data) {
          applicationsData = applicationsResult.data;
        }
      }
      
      // Enrichir avec les profils des talents
      const enrichedApplications = await Promise.all(
        applicationsData.map(async (app) => {
          try {
            const talentProfile = await FirestoreService.getProfileById(app.talentId);
            return {
              ...app,
              talentProfile
            };
          } catch (error) {
            console.error('Erreur lors du chargement du profil talent:', error);
            return app;
          }
        })
      );
      
      setApplications(enrichedApplications);
      
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setError('Erreur lors du chargement des candidatures');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      await FirestoreService.updateApplicationStatus(applicationId, newStatus);
      
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      );
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  const handleViewTalentProfile = (talentId: string) => {
    navigate(`/profile/${talentId}`);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#61bfac';
      case 'rejected': return '#ff6b6b';
      case 'pending': return '#ffcc00';
      default: return '#888';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Acceptée';
      case 'rejected': return 'Refusée';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#f5f5f7',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ width: '1214px', maxWidth: '100%', padding: '24px' }}>
          Chargement...
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
      <div style={{ width: '1214px', maxWidth: '100%', padding: '24px', margin: '0 auto' }}>
        <header style={{ 
          display: 'flex', 
          alignItems: 'center',
          marginBottom: 32,
          paddingBottom: 16,
          borderBottom: '1px solid #333'
        }}>
          <button
            onClick={() => navigate('/my-jobs')}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#ffcc00',
              border: '1px solid #ffcc00',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: 16
            }}
          >
            ← Retour
          </button>
          <h1 style={{ margin: 0, color: '#ffcc00' }}>Candidatures</h1>
        </header>

        {error && (
          <div style={{
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid #ff6b6b',
            color: '#ff6b6b',
            padding: 16,
            borderRadius: 4,
            marginBottom: 24
          }}>
            {error}
          </div>
        )}

        {job && (
          <div style={{
            backgroundColor: '#111',
            padding: 20,
            borderRadius: 4,
            marginBottom: 24
          }}>
            <h2 style={{ color: '#ffcc00', marginTop: 0 }}>{job.title}</h2>
            <p style={{ color: '#f5f5f7', margin: '8px 0' }}>
              <strong>Entreprise:</strong> {job.company}
            </p>
            <p style={{ color: '#f5f5f7', margin: '8px 0' }}>
              <strong>Localisation:</strong> {job.location}
            </p>
            <p style={{ color: '#f5f5f7', margin: '8px 0' }}>
              <strong>Candidatures:</strong> {applications.length}
            </p>
          </div>
        )}

        {applications.length === 0 ? (
          <div style={{
            backgroundColor: '#111',
            padding: 40,
            borderRadius: 4,
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#ffcc00', marginTop: 0 }}>Aucune candidature</h3>
            <p style={{ color: '#f5f5f7' }}>
              Aucun talent n'a encore postulé à cette annonce.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {applications.map((application) => (
              <div
                key={application.id}
                style={{
                  backgroundColor: '#111',
                  padding: 20,
                  borderRadius: 4,
                  border: '1px solid #333'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ color: '#ffcc00', marginTop: 0, marginBottom: 8 }}>
                      {application.talentName}
                    </h3>
                    <p style={{ color: '#f5f5f7', margin: '4px 0' }}>
                      <strong>Email:</strong> {application.talentEmail}
                    </p>
                    <p style={{ color: '#f5f5f7', margin: '4px 0' }}>
                      <strong>Date de candidature:</strong> {formatDate(application.createdAt)}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{
                      padding: '4px 12px',
                      backgroundColor: getStatusColor(application.status),
                      color: '#000',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 'bold'
                    }}>
                      {getStatusText(application.status)}
                    </span>
                  </div>
                </div>

                {application.talentProfile && (
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ color: '#f5f5f7', margin: '4px 0' }}>
                      <strong>Compétences:</strong> {application.talentProfile.skills || 'Non renseignées'}
                    </p>
                    {application.talentProfile.bio && (
                      <p style={{ color: '#f5f5f7', margin: '4px 0' }}>
                        <strong>Bio:</strong> {application.talentProfile.bio}
                      </p>
                    )}
                  </div>
                )}

                {application.coverLetter && (
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ color: '#ffcc00', marginBottom: 8 }}>Lettre de motivation</h4>
                    <div style={{
                      backgroundColor: '#222',
                      padding: 12,
                      borderRadius: 4,
                      color: '#f5f5f7',
                      fontSize: 14,
                      lineHeight: 1.5
                    }}>
                      {application.coverLetter}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleViewTalentProfile(application.talentId)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      color: '#ffcc00',
                      border: '1px solid #ffcc00',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 14
                    }}
                  >
                    Voir le profil
                  </button>
                  
                  {application.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(application.id, 'accepted')}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#61bfac',
                          color: '#000',
                          border: '1px solid #61bfac',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: 14,
                          fontWeight: 'bold'
                        }}
                      >
                        Accepter
                      </button>
                      <button
                        onClick={() => handleStatusChange(application.id, 'rejected')}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#ff6b6b',
                          color: '#fff',
                          border: '1px solid #ff6b6b',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: 14,
                          fontWeight: 'bold'
                        }}
                      >
                        Refuser
                      </button>
                    </>
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
