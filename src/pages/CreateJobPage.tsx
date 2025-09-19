import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';

interface JobFormData {
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  remote: boolean;
  salary: {
    min: string;
    max: string;
    currency: string;
  };
  description: string;
  requirements: string;
  benefits: string;
  contactEmail: string;
  contactPhone?: string;
}

export default function CreateJobPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    contactEmail: user?.email || '',
    contactPhone: ''
  });

  const handleInputChange = (field: keyof JobFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSalaryChange = (field: keyof JobFormData['salary'], value: string) => {
    setFormData(prev => ({
      ...prev,
      salary: {
        ...prev.salary,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      // Validation basique
      if (!formData.title || !formData.company || !formData.description) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      const jobData = {
        ...formData,
        recruiterId: user.id,
        recruiterName: user.displayName || user.email?.split('@')[0] || 'Recruteur',
        recruiterEmail: user.email,
        status: 'active',
        createdAt: new Date(),
        applications: [],
        views: 0
      };

      await FirestoreService.createJob(jobData);
      setSuccess('Annonce créée avec succès !');
      
      setTimeout(() => {
        navigate('/my-jobs');
      }, 2000);

    } catch (err: any) {
      console.error('Erreur lors de la création de l\'annonce:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

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
              onClick={() => navigate('/dashboard/recruteur')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#ffcc00',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ← Retour
            </button>
            <h1 style={{ margin: 0, color: '#ffcc00' }}>
              Créer une annonce
            </h1>
          </div>
        </header>

        {/* Formulaire */}
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: '#111',
          borderRadius: '4px',
          padding: '32px'
        }}>
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

          {success && (
            <div style={{
              padding: '12px',
              backgroundColor: 'rgba(97, 191, 172, 0.1)',
              color: '#61bfac',
              borderRadius: '4px',
              marginBottom: '16px'
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Informations de base */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ color: '#ffcc00', marginBottom: '16px' }}>Informations de base</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
                    Titre du poste *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#333',
                      color: '#f5f5f7',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="Ex: Développeur Full Stack React"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
                    Entreprise *
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#333',
                      color: '#f5f5f7',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="Nom de votre entreprise"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
                    Localisation
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#333',
                      color: '#f5f5f7',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="Paris, France"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
                    Type de contrat
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#333',
                      color: '#f5f5f7',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="full-time">Temps plein</option>
                    <option value="part-time">Temps partiel</option>
                    <option value="contract">Contrat</option>
                    <option value="internship">Stage</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.remote}
                      onChange={(e) => handleInputChange('remote', e.target.checked)}
                      style={{ marginRight: '8px' }}
                    />
                    <span style={{ color: '#f5f5f7' }}>Télétravail possible</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Salaire */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ color: '#ffcc00', marginBottom: '16px' }}>Rémunération</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
                    Salaire minimum
                  </label>
                  <input
                    type="number"
                    value={formData.salary.min}
                    onChange={(e) => handleSalaryChange('min', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#333',
                      color: '#f5f5f7',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="35000"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
                    Salaire maximum
                  </label>
                  <input
                    type="number"
                    value={formData.salary.max}
                    onChange={(e) => handleSalaryChange('max', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#333',
                      color: '#f5f5f7',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="55000"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
                    Devise
                  </label>
                  <select
                    value={formData.salary.currency}
                    onChange={(e) => handleSalaryChange('currency', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#333',
                      color: '#f5f5f7',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="XOF">FCFA (XOF)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ color: '#ffcc00', marginBottom: '16px' }}>Description du poste *</h3>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                rows={6}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
                placeholder="Décrivez le poste, les missions principales, l'environnement de travail..."
              />
            </div>

            {/* Prérequis */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ color: '#ffcc00', marginBottom: '16px' }}>Prérequis et compétences</h3>
              <textarea
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
                placeholder="Compétences techniques requises, expérience, formation..."
              />
            </div>

            {/* Avantages */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ color: '#ffcc00', marginBottom: '16px' }}>Avantages et bénéfices</h3>
              <textarea
                value={formData.benefits}
                onChange={(e) => handleInputChange('benefits', e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
                placeholder="Avantages sociaux, environnement de travail, opportunités..."
              />
            </div>

            {/* Contact */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ color: '#ffcc00', marginBottom: '16px' }}>Informations de contact</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
                    Email de contact *
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#333',
                      color: '#f5f5f7',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="contact@entreprise.com"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#f5f5f7' }}>
                    Téléphone (optionnel)
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#333',
                      color: '#f5f5f7',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => navigate('/dashboard/recruteur')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: '#f5f5f7',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: isLoading ? '#666' : '#ffcc00',
                  color: '#000',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {isLoading ? 'Création...' : 'Publier l\'annonce'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
