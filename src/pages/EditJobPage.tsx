import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';

interface JobFormData {
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
  contactInfo: string;
}

export default function EditJobPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    company: '',
    location: '',
    type: 'full-time',
    remote: false,
    salary: {
      min: '',
      max: '',
      currency: 'EUR'
    },
    description: '',
    requirements: '',
    benefits: '',
    contactInfo: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'recruteur') {
      navigate('/dashboard/recruteur');
      return;
    }

    if (jobId) {
      loadJob();
    }
  }, [user, jobId, navigate]);

  const loadJob = async () => {
    try {
      setIsLoading(true);
      const job = await FirestoreService.getJobById(jobId!);
      
      // Vérifier que l'annonce appartient au recruteur connecté
      if (job.recruiterId !== user?.id) {
        setError('Vous n\'êtes pas autorisé à modifier cette annonce');
        return;
      }

      setFormData({
        title: job.title || '',
        company: job.company || '',
        location: job.location || '',
        type: job.type || 'full-time',
        remote: job.remote || false,
        salary: {
          min: job.salary?.min || '',
          max: job.salary?.max || '',
          currency: job.salary?.currency || 'EUR'
        },
        description: job.description || '',
        requirements: job.requirements || '',
        benefits: job.benefits || '',
        contactInfo: job.contactInfo || ''
      });
    } catch (error) {
      console.error('Erreur lors du chargement de l\'annonce:', error);
      setError('Erreur lors du chargement de l\'annonce');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof JobFormData] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobId) return;

    try {
      setIsSaving(true);
      setError(null);
      
      // Validation basique
      if (!formData.title.trim() || !formData.company.trim() || !formData.description.trim()) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Mettre à jour l'annonce
      await FirestoreService.updateJob(jobId, formData);
      
      setSuccess('Annonce mise à jour avec succès !');
      setTimeout(() => {
        navigate('/my-jobs');
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setError('Erreur lors de la mise à jour de l\'annonce');
    } finally {
      setIsSaving(false);
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
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: 16
            }}
          >
            ← Retour
          </button>
          <h1 style={{ margin: 0, color: '#ffcc00' }}>Modifier l'annonce</h1>
        </header>

        {error && (
          <div style={{
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            border: 'none',
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
            border: 'none',
            color: '#61bfac',
            padding: 16,
            borderRadius: 4,
            marginBottom: 24
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ maxWidth: 800 }}>
          <div style={{ display: 'grid', gap: 24 }}>
            {/* Informations de base */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#ffcc00' }}>
                  Titre du poste *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  style={{
                    width: '100%',
                    padding: 12,
                    backgroundColor: '#333',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 14
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#ffcc00' }}>
                  Entreprise *
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  style={{
                    width: '100%',
                    padding: 12,
                    backgroundColor: '#333',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 14
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#ffcc00' }}>
                  Localisation
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  style={{
                    width: '100%',
                    padding: 12,
                    backgroundColor: '#333',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 14
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#ffcc00' }}>
                  Type de contrat
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  style={{
                    width: '100%',
                    padding: 12,
                    backgroundColor: '#333',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 14
                  }}
                >
                  <option value="full-time">Temps plein</option>
                  <option value="part-time">Temps partiel</option>
                  <option value="contract">Contrat</option>
                  <option value="internship">Stage</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ffcc00' }}>
                <input
                  type="checkbox"
                  checked={formData.remote}
                  onChange={(e) => handleInputChange('remote', e.target.checked)}
                  style={{ margin: 0 }}
                />
                Télétravail possible
              </label>
            </div>

            {/* Salaire */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#ffcc00' }}>
                  Salaire minimum
                </label>
                <input
                  type="number"
                  value={formData.salary.min}
                  onChange={(e) => handleInputChange('salary.min', e.target.value)}
                  style={{
                    width: '100%',
                    padding: 12,
                    backgroundColor: '#333',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 14
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#ffcc00' }}>
                  Salaire maximum
                </label>
                <input
                  type="number"
                  value={formData.salary.max}
                  onChange={(e) => handleInputChange('salary.max', e.target.value)}
                  style={{
                    width: '100%',
                    padding: 12,
                    backgroundColor: '#333',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 14
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#ffcc00' }}>
                  Devise
                </label>
                <select
                  value={formData.salary.currency}
                  onChange={(e) => handleInputChange('salary.currency', e.target.value)}
                  style={{
                    width: '100%',
                    padding: 12,
                    backgroundColor: '#333',
                    color: '#f5f5f7',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 14
                  }}
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="XOF">FCFA (XOF)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, color: '#ffcc00' }}>
                Description du poste *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                style={{
                  width: '100%',
                  padding: 12,
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 14,
                  resize: 'vertical'
                }}
                required
              />
            </div>

            {/* Exigences */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, color: '#ffcc00' }}>
                Exigences et compétences
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: 12,
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 14,
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Avantages */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, color: '#ffcc00' }}>
                Avantages et bénéfices
              </label>
              <textarea
                value={formData.benefits}
                onChange={(e) => handleInputChange('benefits', e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: 12,
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 14,
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Contact */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, color: '#ffcc00' }}>
                Informations de contact
              </label>
              <textarea
                value={formData.contactInfo}
                onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                rows={3}
                placeholder="Email, téléphone, ou autres informations de contact..."
                style={{
                  width: '100%',
                  padding: 12,
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 14,
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Boutons */}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => navigate('/my-jobs')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: '#f5f5f7',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  padding: '12px 24px',
                  backgroundColor: isSaving ? '#555' : '#ffcc00',
                  color: isSaving ? '#888' : '#000',
                  border: 'none',
                  borderRadius: 4,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  fontWeight: 'bold'
                }}
              >
                {isSaving ? 'Mise à jour...' : 'Mettre à jour l\'annonce'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
