import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  remote: boolean;
  salary: {
    min: string;
    max: string;
    currency: string;
  };
  description: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
  applications: any[];
  views: number;
  recruiterId: string;
  recruiterName: string;
  recruiterEmail: string;
}

export default function MyJobsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 480);

  // Gérer le redimensionnement de l'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSmallMobile(window.innerWidth <= 480);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadJobs = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      try {
        setIsLoading(true);
        const userJobs = await FirestoreService.getRecruiterJobs(user.id);
        setJobs(userJobs);
      } catch (error) {
        console.error('Erreur lors du chargement des annonces:', error);
        setError('Erreur lors du chargement des annonces');
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, [user, navigate]);

  const handleToggleStatus = async (jobId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await FirestoreService.updateJobStatus(jobId, newStatus);
      
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, status: newStatus as 'active' | 'inactive' } : job
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      return;
    }

    try {
      await FirestoreService.deleteJob(jobId);
      setJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError('Erreur lors de la suppression de l\'annonce');
    }
  };

  const handleEditJob = (jobId: string) => {
    navigate(`/edit-job/${jobId}`);
  };

  const handleViewApplications = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#61bfac';
      case 'inactive': return '#ff6b6b';
      case 'draft': return '#ffcc00';
      default: return '#888';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'draft': return 'Brouillon';
      default: return status;
    }
  };

  const formatCurrency = (currency: string) => {
    switch (currency) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'XOF': return 'FCFA';
      default: return currency;
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
        Chargement de vos annonces...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#f5f5f7',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '1214px',
        maxWidth: '100%',
        padding: '24px'
      }}>
        {/* Header */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '16px' : '0',
          paddingBottom: 16,
          borderBottom: '1px solid #333',
          marginBottom: 24
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isSmallMobile ? '8px' : '16px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => navigate('/dashboard/recruteur')}
              style={{
                padding: isSmallMobile ? '6px 12px' : '8px 16px',
                backgroundColor: 'transparent',
                color: '#ffcc00',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: isSmallMobile ? '14px' : '16px'
              }}
            >
              ← Retour
            </button>
            <h1 style={{ 
              margin: 0, 
              color: '#ffcc00',
              fontSize: isSmallMobile ? '20px' : '24px'
            }}>
              Mes Annonces ({jobs.length})
            </h1>
          </div>
          <button
            onClick={() => navigate('/create-job')}
            style={{
              padding: isSmallMobile ? '8px 16px' : '10px 20px',
              backgroundColor: '#ffcc00',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: isSmallMobile ? '14px' : '16px',
              width: isSmallMobile ? '100%' : 'auto'
            }}
          >
            + Nouvelle annonce
          </button>
        </header>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            color: '#ff6b6b',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {/* Liste des annonces */}
        {jobs.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#111',
            borderRadius: '4px'
          }}>
            <h3 style={{ color: '#ffcc00', marginBottom: '16px' }}>
              Aucune annonce publiée
            </h3>
            <p style={{ color: '#888', marginBottom: '24px' }}>
              Commencez par créer votre première annonce pour attirer les talents
            </p>
            <button
              onClick={() => navigate('/create-job')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#ffcc00',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Créer ma première annonce
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            gap: '24px',
            flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
          }}>
            {/* Liste des annonces */}
            <div style={{ 
              flex: 1,
              minWidth: window.innerWidth <= 768 ? '100%' : 'auto'
            }}>
              <div style={{
                backgroundColor: '#111',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  padding: window.innerWidth <= 480 ? '16px' : '20px', 
                  borderBottom: '1px solid #333' 
                }}>
                  <h2 style={{ 
                    color: '#ffcc00', 
                    margin: 0,
                    fontSize: window.innerWidth <= 480 ? '18px' : '20px'
                  }}>
                    Vos annonces
                  </h2>
                </div>
                
                <div style={{ 
                  maxHeight: window.innerWidth <= 768 ? '400px' : '600px', 
                  overflow: 'auto' 
                }}>
                  {jobs.map(job => (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      style={{
                        padding: window.innerWidth <= 480 ? '16px' : '20px',
                        borderBottom: '1px solid #333',
                        cursor: 'pointer',
                        backgroundColor: selectedJob?.id === job.id ? '#222' : 'transparent',
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start', 
                        marginBottom: '12px',
                        flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
                        gap: window.innerWidth <= 480 ? '8px' : '0'
                      }}>
                        <h3 style={{ 
                          color: '#f5f5f7', 
                          margin: '0 0 8px 0',
                          fontSize: window.innerWidth <= 480 ? '16px' : '18px',
                          fontWeight: '600'
                        }}>
                          {job.title}
                        </h3>
                        <span style={{ 
                          color: getStatusColor(job.status), 
                          fontSize: '12px',
                          fontWeight: 'bold',
                          padding: '4px 8px',
                          backgroundColor: `${getStatusColor(job.status)}20`,
                          borderRadius: '4px',
                          alignSelf: window.innerWidth <= 480 ? 'flex-start' : 'auto'
                        }}>
                          {getStatusText(job.status)}
                        </span>
                      </div>
                      
                      <p style={{ 
                        color: '#888', 
                        margin: '0 0 8px 0', 
                        fontSize: window.innerWidth <= 480 ? '13px' : '14px'
                      }}>
                        {job.company} • {job.location}
                      </p>
                      
                      <div style={{ 
                        display: 'flex', 
                        gap: window.innerWidth <= 480 ? '8px' : '16px', 
                        fontSize: '12px', 
                        color: '#888',
                        flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
                        flexWrap: 'wrap'
                      }}>
                        <span>{formatDate(job.createdAt)}</span>
                        <span>{job.views} vues</span>
                        <span>{job.applications.length} candidatures</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Détails de l'annonce sélectionnée */}
            {selectedJob && (
              <div style={{ 
                flex: 1,
                minWidth: window.innerWidth <= 768 ? '100%' : 'auto'
              }}>
                <div style={{
                  backgroundColor: '#111',
                  borderRadius: '4px',
                  padding: window.innerWidth <= 480 ? '16px' : '24px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    marginBottom: '20px',
                    flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
                    gap: window.innerWidth <= 480 ? '12px' : '0'
                  }}>
                    <h2 style={{ 
                      color: '#ffcc00', 
                      margin: 0,
                      fontSize: window.innerWidth <= 480 ? '18px' : '20px'
                    }}>
                      {selectedJob.title}
                    </h2>
                    <span style={{ 
                      color: getStatusColor(selectedJob.status), 
                      fontSize: '12px',
                      fontWeight: 'bold',
                      padding: '4px 8px',
                      backgroundColor: `${getStatusColor(selectedJob.status)}20`,
                      borderRadius: '4px',
                      alignSelf: window.innerWidth <= 480 ? 'flex-start' : 'auto'
                    }}>
                      {getStatusText(selectedJob.status)}
                    </span>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ color: '#888', margin: '0 0 8px 0' }}>
                      <strong>Entreprise:</strong> {selectedJob.company}
                    </p>
                    <p style={{ color: '#888', margin: '0 0 8px 0' }}>
                      <strong>Localisation:</strong> {selectedJob.location}
                    </p>
                    <p style={{ color: '#888', margin: '0 0 8px 0' }}>
                      <strong>Type:</strong> {selectedJob.type} {selectedJob.remote && '(Télétravail possible)'}
                    </p>
                                         {selectedJob.salary.min && selectedJob.salary.max && (
                       <p style={{ color: '#888', margin: '0 0 8px 0' }}>
                         <strong>Salaire:</strong> {selectedJob.salary.min} - {selectedJob.salary.max} {formatCurrency(selectedJob.salary.currency)}
                       </p>
                     )}
                    <p style={{ color: '#888', margin: '0 0 8px 0' }}>
                      <strong>Publiée le:</strong> {formatDate(selectedJob.createdAt)}
                    </p>
                    <p style={{ color: '#888', margin: '0 0 8px 0' }}>
                      <strong>Vues:</strong> {selectedJob.views}
                    </p>
                    <p style={{ color: '#888', margin: 0 }}>
                      <strong>Candidatures:</strong> {selectedJob.applications.length}
                    </p>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: '#ffcc00', margin: '0 0 12px 0' }}>Description</h4>
                    <p style={{ color: '#f5f5f7', lineHeight: '1.6', margin: 0 }}>
                      {selectedJob.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ 
                    display: 'flex', 
                    gap: window.innerWidth <= 480 ? '8px' : '12px', 
                    flexWrap: 'wrap',
                    flexDirection: window.innerWidth <= 480 ? 'column' : 'row'
                  }}>
                    <button
                      onClick={() => handleViewApplications(selectedJob.id)}
                      style={{
                        padding: window.innerWidth <= 480 ? '10px 16px' : '8px 16px',
                        backgroundColor: '#61bfac',
                        color: '#000',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: window.innerWidth <= 480 ? '14px' : '16px',
                        width: window.innerWidth <= 480 ? '100%' : 'auto'
                      }}
                    >
                      Voir candidatures ({selectedJob.applications.length})
                    </button>
                    
                    <button
                      onClick={() => handleToggleStatus(selectedJob.id, selectedJob.status)}
                      style={{
                        padding: window.innerWidth <= 480 ? '10px 16px' : '8px 16px',
                        backgroundColor: selectedJob.status === 'active' ? '#ff6b6b' : '#61bfac',
                        color: '#000',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: window.innerWidth <= 480 ? '14px' : '16px',
                        width: window.innerWidth <= 480 ? '100%' : 'auto'
                      }}
                    >
                      {selectedJob.status === 'active' ? 'Désactiver' : 'Activer'}
                    </button>
                    
                    <button
                      onClick={() => handleEditJob(selectedJob.id)}
                      style={{
                        padding: window.innerWidth <= 480 ? '10px 16px' : '8px 16px',
                        backgroundColor: 'transparent',
                        color: '#ffcc00',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: window.innerWidth <= 480 ? '14px' : '16px',
                        width: window.innerWidth <= 480 ? '100%' : 'auto'
                      }}
                    >
                      Modifier
                    </button>
                    
                    <button
                      onClick={() => handleDeleteJob(selectedJob.id)}
                      style={{
                        padding: window.innerWidth <= 480 ? '10px 16px' : '8px 16px',
                        backgroundColor: 'transparent',
                        color: '#ff6b6b',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: window.innerWidth <= 480 ? '14px' : '16px',
                        width: window.innerWidth <= 480 ? '100%' : 'auto'
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
