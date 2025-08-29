import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import { useNotifications } from '../components/NotificationManager';

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
  requirements: string;
  benefits: string;
  status: string;
  createdAt: Date;
  views: number;
  recruiterId: string;
  recruiterName: string;
  recruiterEmail: string;
}

export default function JobsListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRemote, setFilterRemote] = useState(false);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setIsLoading(true);
        const activeJobs = await FirestoreService.getAllActiveJobs();
        setJobs(activeJobs);
      } catch (error) {
        console.error('Erreur lors du chargement des annonces:', error);
        setError('Erreur lors du chargement des annonces');
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, []);

  const handleJobClick = async (job: Job) => {
    setSelectedJob(job);
    // Incrémenter les vues
    await FirestoreService.incrementJobViews(job.id);
  };

  const handleApply = (jobId: string) => {
    if (!user) {
      navigate('/');
      return;
    }
    if (user.role !== 'talent') {
      showNotification({
        type: 'error',
        title: 'Accès refusé',
        message: 'Seuls les talents peuvent postuler aux offres d\'emploi'
      });
      return;
    }
    navigate(`/jobs/${jobId}/apply`);
  };

  const handleContactRecruiter = (job: Job) => {
    navigate(`/profile/${job.recruiterId}`);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'full-time': return 'Temps plein';
      case 'part-time': return 'Temps partiel';
      case 'contract': return 'Contrat';
      case 'internship': return 'Stage';
      default: return type;
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

  // Filtrer les annonces
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || job.type === filterType;
    const matchesRemote = !filterRemote || job.remote;

    return matchesSearch && matchesType && matchesRemote;
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
        Chargement des annonces...
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
          alignItems: 'center',
          paddingBottom: 16,
          borderBottom: '1px solid #333',
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => navigate('/dashboard/talent')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#ffcc00',
                border: '1px solid #ffcc00',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ← Retour
            </button>
            <h1 style={{ margin: 0, color: '#ffcc00' }}>
              Offres d'emploi ({filteredJobs.length})
            </h1>
          </div>
        </header>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            color: '#ff6b6b',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {/* Filtres */}
        <div style={{
          backgroundColor: '#111',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <input
                type="text"
                placeholder="Rechercher par titre, entreprise, localisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: '10px 12px',
                backgroundColor: '#333',
                color: '#f5f5f7',
                border: '1px solid #555',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="all">Tous les types</option>
              <option value="full-time">Temps plein</option>
              <option value="part-time">Temps partiel</option>
              <option value="contract">Contrat</option>
              <option value="internship">Stage</option>
            </select>

            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={filterRemote}
                onChange={(e) => setFilterRemote(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <span style={{ color: '#f5f5f7', fontSize: '14px' }}>Télétravail uniquement</span>
            </label>
          </div>
        </div>

        {/* Liste des annonces */}
        {filteredJobs.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#111',
            borderRadius: '8px'
          }}>
            <h3 style={{ color: '#ffcc00', marginBottom: '16px' }}>
              Aucune annonce trouvée
            </h3>
            <p style={{ color: '#888' }}>
              {searchTerm || filterType !== 'all' || filterRemote 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Aucune offre d\'emploi disponible pour le moment'
              }
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '24px' }}>
            {/* Liste des annonces */}
            <div style={{ flex: 1 }}>
              <div style={{
                backgroundColor: '#111',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #333' }}>
                  <h2 style={{ color: '#ffcc00', margin: 0 }}>Annonces disponibles</h2>
                </div>
                
                <div style={{ maxHeight: '600px', overflow: 'auto' }}>
                  {filteredJobs.map(job => (
                    <div
                      key={job.id}
                      onClick={() => handleJobClick(job)}
                      style={{
                        padding: '20px',
                        borderBottom: '1px solid #333',
                        cursor: 'pointer',
                        backgroundColor: selectedJob?.id === job.id ? '#222' : 'transparent',
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <h3 style={{ 
                          color: '#f5f5f7', 
                          margin: '0 0 8px 0',
                          fontSize: '18px',
                          fontWeight: '600'
                        }}>
                          {job.title}
                        </h3>
                        <span style={{ 
                          color: '#61bfac', 
                          fontSize: '12px',
                          fontWeight: 'bold',
                          padding: '4px 8px',
                          backgroundColor: 'rgba(97, 191, 172, 0.2)',
                          borderRadius: '4px'
                        }}>
                          {getTypeText(job.type)}
                        </span>
                      </div>
                      
                      <p style={{ color: '#888', margin: '0 0 8px 0', fontSize: '14px' }}>
                        {job.company} • {job.location} {job.remote && '• 🌐 Télétravail'}
                      </p>
                      
                                             {job.salary.min && job.salary.max && (
                         <p style={{ color: '#ffcc00', margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500' }}>
                           💰 {job.salary.min} - {job.salary.max} {formatCurrency(job.salary.currency)}
                         </p>
                       )}
                      
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#888' }}>
                        <span>📅 {formatDate(job.createdAt)}</span>
                        <span>👁️ {job.views} vues</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Détails de l'annonce sélectionnée */}
            {selectedJob && (
              <div style={{ flex: 1 }}>
                <div style={{
                  backgroundColor: '#111',
                  borderRadius: '8px',
                  padding: '24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <h2 style={{ color: '#ffcc00', margin: 0 }}>{selectedJob.title}</h2>
                    <span style={{ 
                      color: '#61bfac', 
                      fontSize: '12px',
                      fontWeight: 'bold',
                      padding: '4px 8px',
                      backgroundColor: 'rgba(97, 191, 172, 0.2)',
                      borderRadius: '4px'
                    }}>
                      {getTypeText(selectedJob.type)}
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
                      <strong>Type:</strong> {getTypeText(selectedJob.type)} {selectedJob.remote && '(Télétravail possible)'}
                    </p>
                                         {selectedJob.salary.min && selectedJob.salary.max && (
                       <p style={{ color: '#ffcc00', margin: '0 0 8px 0', fontWeight: '500' }}>
                         <strong>Salaire:</strong> {selectedJob.salary.min} - {selectedJob.salary.max} {formatCurrency(selectedJob.salary.currency)}
                       </p>
                     )}
                    <p style={{ color: '#888', margin: '0 0 8px 0' }}>
                      <strong>Publiée le:</strong> {formatDate(selectedJob.createdAt)}
                    </p>
                    <p style={{ color: '#888', margin: 0 }}>
                      <strong>Vues:</strong> {selectedJob.views}
                    </p>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: '#ffcc00', margin: '0 0 12px 0' }}>Description</h4>
                    <p style={{ color: '#f5f5f7', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                      {selectedJob.description}
                    </p>
                  </div>

                  {selectedJob.requirements && (
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ color: '#ffcc00', margin: '0 0 12px 0' }}>Prérequis</h4>
                      <p style={{ color: '#f5f5f7', lineHeight: '1.6', margin: 0 }}>
                        {selectedJob.requirements}
                      </p>
                    </div>
                  )}

                  {selectedJob.benefits && (
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ color: '#ffcc00', margin: '0 0 12px 0' }}>Avantages</h4>
                      <p style={{ color: '#f5f5f7', lineHeight: '1.6', margin: 0 }}>
                        {selectedJob.benefits}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleApply(selectedJob.id)}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#ffcc00',
                        color: '#000',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}
                    >
                      📝 Postuler
                    </button>
                    
                    <button
                      onClick={() => handleContactRecruiter(selectedJob)}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: 'transparent',
                        color: '#61bfac',
                        border: '1px solid #61bfac',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      💬 Contacter le recruteur
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
