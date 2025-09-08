import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';

interface ApplicationFormData {
  coverLetter: string;
}

export default function ApplyJobPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  
  const [job, setJob] = useState<any>(null);
  const [formData, setFormData] = useState<ApplicationFormData>({
    coverLetter: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    if (!user || user.role !== 'talent') {
      navigate('/dashboard/talent');
      return;
    }

    if (jobId) {
      loadJob();
    }
  }, [user, jobId, navigate]);

  // Gérer le redimensionnement de la fenêtre pour mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadJob = async () => {
    try {
      setIsLoading(true);
      const jobData = await FirestoreService.getJobById(jobId!);
      setJob(jobData);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'annonce:', error);
      setError('Erreur lors du chargement de l\'annonce');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobId || !user) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      // Validation basique
      if (!formData.coverLetter.trim()) {
        setError('Veuillez rédiger une lettre de motivation');
        return;
      }

      // Vérifier si l'utilisateur a déjà postulé
      const existingApplications = await FirestoreService.getUserApplications(user.id);
      const alreadyApplied = existingApplications.some(app => app.jobId === jobId);
      
      if (alreadyApplied) {
        setError('Vous avez déjà postulé à cette annonce');
        return;
      }

      // Créer la candidature
      const applicationData = {
        talentId: user.id,
        talentName: user.displayName || user.email?.split('@')[0] || 'Talent',
        talentEmail: user.email,
        coverLetter: formData.coverLetter.trim()
      };

      await FirestoreService.applyToJob(jobId, user.id, applicationData);
      
      // Envoyer notification SendGrid au recruteur
      if (job && job.recruiterId) {
        try {
          const recruiterProfile = await FirestoreService.getCurrentProfile(job.recruiterId, 'recruteur');
          if (recruiterProfile && recruiterProfile.email) {
            const { default: sendGridTemplateService } = await import('../services/sendGridTemplateService');
            await sendGridTemplateService.sendApplicationNotification({
              recipientEmail: recruiterProfile.email,
              recipientName: recruiterProfile.displayName || recruiterProfile.firstName || 'Recruteur',
              applicantName: applicationData.talentName,
              jobTitle: job.title,
              companyName: job.company || recruiterProfile.companyName || 'Non spécifiée',
              applicationDate: new Date().toLocaleDateString('fr-FR')
            });
            console.log('📧 Notification de candidature SendGrid envoyée avec succès');
          }
        } catch (emailError) {
          console.error('❌ Erreur envoi notification candidature:', emailError);
          // Ne pas faire échouer la candidature si l'email échoue
        }
      }

      // Envoyer notification de confirmation SendGrid au talent
      try {
        const { default: sendGridTemplateService } = await import('../services/sendGridTemplateService');
        await sendGridTemplateService.sendApplicationSentConfirmation({
          recipientEmail: user.email,
          recipientName: applicationData.talentName,
          jobTitle: job.title,
          companyName: job.company || 'Non spécifiée',
          applicationDate: new Date().toLocaleDateString('fr-FR')
        });
        console.log('📧 Notification de confirmation de candidature SendGrid envoyée au talent');
      } catch (emailError) {
        console.error('❌ Erreur envoi notification confirmation candidature:', emailError);
        // Ne pas faire échouer la candidature si l'email échoue
      }
      
      setSuccess('Candidature envoyée avec succès !');
      setTimeout(() => {
        navigate('/jobs');
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de la candidature:', error);
      setError('Erreur lors de l\'envoi de la candidature');
    } finally {
      setIsSubmitting(false);
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

  const getTypeText = (type: string) => {
    switch (type) {
      case 'full-time': return 'Temps plein';
      case 'part-time': return 'Temps partiel';
      case 'contract': return 'Contrat';
      case 'internship': return 'Stage';
      default: return type;
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

  if (!job) {
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
          Annonce non trouvée
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
      <div style={{ width: '1214px', maxWidth: '100%', padding: isMobile ? '16px' : '24px', margin: '0 auto' }}>
        <header style={{ 
          display: 'flex', 
          alignItems: 'center',
          marginBottom: isMobile ? 24 : 32,
          paddingBottom: 16,
          borderBottom: '1px solid #333',
          flexWrap: 'wrap',
          gap: isMobile ? '12px' : '0'
        }}>
          <button
            onClick={() => navigate('/jobs')}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#ffcc00',
              border: '1px solid #ffcc00',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: isMobile ? 0 : 16,
              fontSize: isMobile ? '14px' : '16px'
            }}
          >
            ← Retour
          </button>
          <h1 style={{ 
            margin: 0, 
            color: '#ffcc00',
            fontSize: isMobile ? '24px' : '32px'
          }}>Postuler à l'offre</h1>
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

        {success && (
          <div style={{
            backgroundColor: 'rgba(97, 191, 172, 0.1)',
            border: '1px solid #61bfac',
            color: '#61bfac',
            padding: 16,
            borderRadius: 4,
            marginBottom: 24
          }}>
            {success}
          </div>
        )}

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
          gap: isMobile ? 24 : 32 
        }}>
          {/* Détails de l'annonce */}
          <div>
            <h2 style={{ 
              color: '#ffcc00', 
              marginTop: 0,
              fontSize: isMobile ? '20px' : '24px'
            }}>Détails de l'offre</h2>
            
            <div style={{
              backgroundColor: '#111',
              padding: isMobile ? 16 : 20,
              borderRadius: 4,
              marginBottom: 24
            }}>
              <h3 style={{ 
                color: '#ffcc00', 
                marginTop: 0,
                fontSize: isMobile ? '18px' : '20px'
              }}>{job.title}</h3>
              <p style={{ 
                color: '#f5f5f7', 
                margin: '8px 0',
                fontSize: isMobile ? '14px' : '16px'
              }}>
                <strong>Entreprise:</strong> {job.company}
              </p>
              <p style={{ 
                color: '#f5f5f7', 
                margin: '8px 0',
                fontSize: isMobile ? '14px' : '16px'
              }}>
                <strong>Localisation:</strong> {job.location}
              </p>
              <p style={{ 
                color: '#f5f5f7', 
                margin: '8px 0',
                fontSize: isMobile ? '14px' : '16px'
              }}>
                <strong>Type:</strong> {getTypeText(job.type)} {job.remote && '(Télétravail possible)'}
              </p>
              {job.salary?.min && job.salary?.max && (
                <p style={{ 
                  color: '#ffcc00', 
                  margin: '8px 0', 
                  fontWeight: 'bold',
                  fontSize: isMobile ? '14px' : '16px'
                }}>
                  <strong>Salaire:</strong> {job.salary.min} - {job.salary.max} {formatCurrency(job.salary.currency)}
                </p>
              )}
            </div>

            <div style={{
              backgroundColor: '#111',
              padding: isMobile ? 16 : 20,
              borderRadius: 4,
              marginBottom: 24
            }}>
              <h4 style={{ 
                color: '#ffcc00', 
                marginTop: 0,
                fontSize: isMobile ? '16px' : '18px'
              }}>Description</h4>
              <p style={{ 
                color: '#f5f5f7', 
                lineHeight: 1.6,
                fontSize: isMobile ? '14px' : '16px'
              }}>
                {job.description}
              </p>
            </div>

            {job.requirements && (
              <div style={{
                backgroundColor: '#111',
                padding: isMobile ? 16 : 20,
                borderRadius: 4,
                marginBottom: 24
              }}>
                <h4 style={{ 
                  color: '#ffcc00', 
                  marginTop: 0,
                  fontSize: isMobile ? '16px' : '18px'
                }}>Exigences</h4>
                <p style={{ 
                  color: '#f5f5f7', 
                  lineHeight: 1.6,
                  fontSize: isMobile ? '14px' : '16px'
                }}>
                  {job.requirements}
                </p>
              </div>
            )}

            {job.benefits && (
              <div style={{
                backgroundColor: '#111',
                padding: isMobile ? 16 : 20,
                borderRadius: 4
              }}>
                <h4 style={{ 
                  color: '#ffcc00', 
                  marginTop: 0,
                  fontSize: isMobile ? '16px' : '18px'
                }}>Avantages</h4>
                <p style={{ 
                  color: '#f5f5f7', 
                  lineHeight: 1.6,
                  fontSize: isMobile ? '14px' : '16px'
                }}>
                  {job.benefits}
                </p>
              </div>
            )}
          </div>

          {/* Formulaire de candidature */}
          <div>
            <h2 style={{ 
              color: '#ffcc00', 
              marginTop: 0,
              fontSize: isMobile ? '20px' : '24px'
            }}>Votre candidature</h2>
            
            <form onSubmit={handleSubmit} style={{
              backgroundColor: '#111',
              padding: isMobile ? 16 : 20,
              borderRadius: 4
            }}>
              <div style={{ marginBottom: 24 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  color: '#ffcc00',
                  fontSize: isMobile ? '14px' : '16px'
                }}>
                  Lettre de motivation *
                </label>
                <textarea
                  value={formData.coverLetter}
                  onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
                  rows={isMobile ? 8 : 12}
                  placeholder="Présentez-vous, expliquez pourquoi vous êtes intéressé par ce poste et pourquoi vous seriez un bon candidat..."
                  style={{
                    width: '100%',
                    padding: isMobile ? 10 : 12,
                    backgroundColor: '#333',
                    color: '#f5f5f7',
                    border: '1px solid #555',
                    borderRadius: 4,
                    fontSize: isMobile ? 14 : 16,
                    resize: 'vertical',
                    lineHeight: 1.5,
                    boxSizing: 'border-box'
                  }}
                  required
                />
                <p style={{ 
                  color: '#888', 
                  fontSize: isMobile ? 11 : 12, 
                  marginTop: 8 
                }}>
                  Minimum 100 caractères recommandé
                </p>
              </div>

              <div style={{ 
                display: 'flex', 
                gap: isMobile ? 12 : 16, 
                justifyContent: isMobile ? 'stretch' : 'flex-end',
                flexDirection: isMobile ? 'column-reverse' : 'row'
              }}>
                <button
                  type="button"
                  onClick={() => navigate('/jobs')}
                  style={{
                    padding: isMobile ? '14px 20px' : '12px 24px',
                    backgroundColor: 'transparent',
                    color: '#f5f5f7',
                    border: '1px solid #555',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: isMobile ? 16 : 14,
                    flex: isMobile ? '1' : 'none'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: isMobile ? '14px 20px' : '12px 24px',
                    backgroundColor: isSubmitting ? '#555' : '#ffcc00',
                    color: isSubmitting ? '#888' : '#000',
                    border: '1px solid #ffcc00',
                    borderRadius: 4,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontSize: isMobile ? 16 : 14,
                    fontWeight: 'bold',
                    flex: isMobile ? '1' : 'none'
                  }}
                >
                  {isSubmitting ? 'Envoi...' : 'Envoyer ma candidature'}
                </button>
              </div>
            </form>

            <div style={{
              backgroundColor: '#222',
              padding: isMobile ? 14 : 16,
              borderRadius: 4,
              marginTop: 16
            }}>
              <h4 style={{ 
                color: '#ffcc00', 
                marginTop: 0, 
                marginBottom: 8,
                fontSize: isMobile ? '16px' : '18px'
              }}>Conseils</h4>
              <ul style={{ 
                color: '#f5f5f7', 
                fontSize: isMobile ? 13 : 14, 
                lineHeight: 1.5, 
                margin: 0, 
                paddingLeft: isMobile ? 16 : 20 
              }}>
                <li>Personnalisez votre lettre pour cette entreprise</li>
                <li>Mettez en avant vos compétences pertinentes</li>
                <li>Expliquez votre motivation pour ce poste</li>
                <li>Relisez votre texte avant l'envoi</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
