import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  talentId: string;
  talentName: string;
  talentEmail: string;
  coverLetter: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  talentProfile?: any;
}

export default function RecruiterApplicationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (!user || user.role !== 'recruteur') {
      navigate('/dashboard/recruteur');
      return;
    }

    loadAllApplications();
  }, [user, navigate]);

  const loadAllApplications = async () => {
    try {
      setIsLoading(true);
      
      // Charger toutes les annonces du recruteur
      const recruiterJobs = await FirestoreService.getRecruiterJobs(user!.id);
      
      // Charger toutes les candidatures pour ces annonces
      const allApplications: Application[] = [];
      
      for (const job of recruiterJobs) {
        try {
          const jobApplications = await FirestoreService.getJobApplications(job.id);
          
          // Enrichir avec les détails de l'annonce et du talent
          const enrichedApplications = await Promise.all(
            jobApplications.map(async (app) => {
              try {
                const talentProfile = await FirestoreService.getProfileById(app.talentId);
                return {
                  ...app,
                  jobTitle: job.title,
                  talentProfile
                };
              } catch (error) {
                console.error('Erreur lors du chargement du profil talent:', error);
                return {
                  ...app,
                  jobTitle: job.title
                };
              }
            })
          );
          
          allApplications.push(...enrichedApplications);
        } catch (error) {
          console.error(`Erreur lors du chargement des candidatures pour l'annonce ${job.id}:`, error);
        }
      }
      
      // Trier par date de candidature (plus récentes en premier)
      allApplications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setApplications(allApplications);
      
    } catch (error) {
      console.error('Erreur lors du chargement des candidatures:', error);
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

  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
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

  const filteredApplications = applications.filter(app => {
    if (filterStatus === 'all') return true;
    return app.status === filterStatus;
  });

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
            onClick={() => navigate('/dashboard/recruteur')}
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
          <h1 style={{ margin: 0, color: '#ffcc00' }}>Toutes mes candidatures</h1>
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

        {/* Statistiques */}
        <div style={{
          backgroundColor: '#111',
          padding: 20,
          borderRadius: 4,
          marginBottom: 24
        }}>
          <h3 style={{ color: '#ffcc00', marginTop: 0 }}>Vue d'ensemble</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
            <div>
              <p style={{ color: '#f5f5f7', margin: '4px 0' }}>
                <strong>Total:</strong> {applications.length}
              </p>
            </div>
            <div>
              <p style={{ color: '#f5f5f7', margin: '4px 0' }}>
                <strong>En attente:</strong> {applications.filter(app => app.status === 'pending').length}
              </p>
            </div>
            <div>
              <p style={{ color: '#f5f5f7', margin: '4px 0' }}>
                <strong>Acceptées:</strong> {applications.filter(app => app.status === 'accepted').length}
              </p>
            </div>
            <div>
              <p style={{ color: '#f5f5f7', margin: '4px 0' }}>
                <strong>Refusées:</strong> {applications.filter(app => app.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8, color: '#ffcc00' }}>
            Filtrer par statut:
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '8px 12px',
              backgroundColor: '#333',
              color: '#f5f5f7',
              border: '1px solid #555',
              borderRadius: 4,
              fontSize: 14
            }}
          >
            <option value="all">Toutes les candidatures</option>
            <option value="pending">En attente</option>
            <option value="accepted">Acceptées</option>
            <option value="rejected">Refusées</option>
          </select>
        </div>

        {filteredApplications.length === 0 ? (
          <div style={{
            backgroundColor: '#111',
            padding: 40,
            borderRadius: 4,
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#ffcc00', marginTop: 0 }}>
              {filterStatus === 'all' ? 'Aucune candidature' : `Aucune candidature ${getStatusText(filterStatus).toLowerCase()}`}
            </h3>
            <p style={{ color: '#f5f5f7' }}>
              {filterStatus === 'all' 
                ? 'Aucun talent n\'a encore postulé à vos annonces.'
                : `Aucune candidature ${getStatusText(filterStatus).toLowerCase()} trouvée.`
              }
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {filteredApplications.map((application) => (
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
                      <strong>Annonce:</strong> {application.jobTitle}
                    </p>
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
                      borderRadius: 4,
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
                      lineHeight: 1.5,
                      maxHeight: 100,
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      {application.coverLetter.length > 200 
                        ? `${application.coverLetter.substring(0, 200)}...`
                        : application.coverLetter
                      }
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleViewJob(application.jobId)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      color: '#61bfac',
                      border: '1px solid #61bfac',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 14
                    }}
                  >
                    Voir l'annonce
                  </button>
                  
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
