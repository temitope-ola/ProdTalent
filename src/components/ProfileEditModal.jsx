import React, { useState } from 'react';
import { FirestoreService } from '../services/firestoreService';
import { useNotifications } from './NotificationManager';
import useAuth from '../contexts/AuthContext';

// Compétences disponibles organisées par catégories
const AVAILABLE_SKILLS = {
  'Frontend': [
    'React', 'Vue.js', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Sass', 'Less',
    'Next.js', 'Nuxt.js', 'Tailwind CSS', 'Bootstrap', 'Material-UI', 'Ant Design'
  ],
  'Backend': [
    'Node.js', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Scala', 'Kotlin',
    'Express.js', 'Django', 'Flask', 'Spring Boot', '.NET', 'Laravel', 'Ruby on Rails'
  ],
  'Base de données': [
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server',
    'Firebase', 'Supabase', 'DynamoDB', 'Cassandra'
  ],
  'DevOps & Cloud': [
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'Jenkins', 'GitLab CI',
    'Terraform', 'Ansible', 'Nginx', 'Apache', 'Linux'
  ],
  'Mobile': [
    'React Native', 'Flutter', 'Swift', 'Kotlin', 'Xamarin', 'Ionic', 'Cordova'
  ],
  'AI & Data': [
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn',
    'Pandas', 'NumPy', 'Data Analysis', 'Data Science', 'NLP', 'Computer Vision'
  ],
  'Product': [
    'Product Management', 'UX/UI Design', 'Figma', 'Sketch', 'Adobe XD',
    'User Research', 'A/B Testing', 'Analytics', 'Growth Hacking'
  ],
  'Entrepreneuriat': [
    'Business Development', 'Startup', 'Venture Capital', 'Pitch Deck',
    'Market Research', 'Strategy', 'Leadership', 'Project Management'
  ]
};

const ProfileEditModal = ({ profile, isOpen, onClose, onSave }) => {
  const { showNotification } = useNotifications();
  const { logout } = useAuth();
  
  // Convertir les compétences existantes en tableau si c'est une chaîne
  const existingSkills = typeof profile.skills === 'string' 
    ? profile.skills.split(',').map(s => s.trim()).filter(s => s)
    : Array.isArray(profile.skills) ? profile.skills : [];
  
  const [formData, setFormData] = useState({
    displayName: profile.displayName || '',
    bio: profile.bio || '',
    skills: existingSkills,
    linkedinUrl: profile.linkedinUrl || '',
    githubUrl: profile.githubUrl || '',
    cvUrl: profile.cvUrl || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gestion des compétences
  const addSkill = (skill) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
    setNewSkill('');
    setShowSkillSuggestions(false);
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSkillInputChange = (e) => {
    const value = e.target.value;
    setNewSkill(value);
    setShowSkillSuggestions(value.length > 0);
  };

  const handleSkillInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(newSkill);
    }
  };

  // Filtrer les suggestions basées sur l'input
  const getSkillSuggestions = () => {
    if (!newSkill) return [];
    
    const allSkills = Object.values(AVAILABLE_SKILLS).flat();
    return allSkills.filter(skill => 
      skill.toLowerCase().includes(newSkill.toLowerCase()) &&
      !formData.skills.includes(skill)
    ).slice(0, 10);
  };

  const handleCvUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 3 * 1024 * 1024;
      if (file.size > maxSize) {
        showNotification({
          type: 'error',
          title: 'Fichier trop volumineux',
          message: 'Le fichier CV est trop volumineux. Veuillez choisir un fichier de moins de 3MB.'
        });
        e.target.value = '';
        return;
      }
      
      if (file.type !== 'application/pdf') {
        showNotification({
          type: 'error',
          title: 'Type de fichier invalide',
          message: 'Veuillez sélectionner un fichier PDF.'
        });
        e.target.value = '';
        return;
      }
      
      setCvFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let cvUrl = formData.cvUrl;
      
      if (cvFile) {
        try {
          cvUrl = await FirestoreService.uploadCV(cvFile);
        } catch (error) {
          console.error('Erreur lors de l\'upload du CV:', error);
          showNotification({
            type: 'error',
            title: 'Erreur d\'upload',
            message: error instanceof Error ? error.message : 'Erreur lors de l\'upload du CV'
          });
          setIsLoading(false);
          return;
        }
      }

      const updatedData = {
        displayName: formData.displayName,
        bio: formData.bio,
        skills: formData.skills,
        linkedinUrl: formData.linkedinUrl,
        githubUrl: formData.githubUrl,
        cvUrl: cvUrl
      };

      await FirestoreService.updateProfile(profile.id, profile.role, updatedData);
      
      const updatedProfile = {
        ...profile,
        ...updatedData
      };
      
      onSave(updatedProfile);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showNotification({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: 'Erreur lors de la sauvegarde du profil'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsLoading(true);
    
    try {
      await FirestoreService.deleteProfile(profile.id, profile.role);
      
      showNotification({
        type: 'success',
        title: 'Compte supprimé',
        message: 'Votre compte a été supprimé avec succès'
      });
      
      // Déconnecter l'utilisateur et fermer la modal
      await logout();
      onClose();
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showNotification({
        type: 'error',
        title: 'Erreur de suppression',
        message: 'Une erreur est survenue lors de la suppression du compte'
      });
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#111',
        padding: '32px',
        borderRadius: '4px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ color: '#ffcc00', margin: 0 }}>Éditer le Profil</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            Fermer
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Nom d'affichage */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              color: '#f5f5f7', 
              marginBottom: '8px',
              fontWeight: 'bold'
            }}>
              Nom d'affichage
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#222',
                border: 'none',
                borderRadius: '4px',
                color: '#f5f5f7',
                fontSize: '14px'
              }}
              placeholder="Votre nom d'affichage"
            />
          </div>

          {/* Bio */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              color: '#f5f5f7', 
              marginBottom: '8px',
              fontWeight: 'bold'
            }}>
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#222',
                border: 'none',
                borderRadius: '4px',
                color: '#f5f5f7',
                fontSize: '14px',
                resize: 'vertical'
              }}
              placeholder="Parlez-nous de vous..."
            />
          </div>

          {/* Compétences */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              color: '#f5f5f7', 
              marginBottom: '8px',
              fontWeight: 'bold'
            }}>
              Compétences
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: '#333',
                    color: '#ffcc00',
                    padding: '6px 12px',
                    borderRadius: '15px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ffcc00',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={newSkill}
                onChange={handleSkillInputChange}
                onKeyDown={handleSkillInputKeyDown}
                onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 100)}
                placeholder="Ajouter une compétence (ex: React, Node.js)"
                style={{
                  flex: '1',
                  padding: '12px',
                  backgroundColor: '#222',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#f5f5f7',
                  fontSize: '14px'
                }}
              />
              {showSkillSuggestions && (
                <div style={{
                  position: 'absolute',
                  backgroundColor: '#222',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 1001,
                  width: '100%'
                }}>
                  {getSkillSuggestions().map((skill, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        color: '#f5f5f7',
                        backgroundColor: '#333',
                        borderBottom: '1px solid #444'
                      }}
                      onClick={() => addSkill(skill)}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Compétences disponibles par catégorie */}
            <div style={{ marginTop: '16px' }}>
              <p style={{ color: '#888', fontSize: '12px', marginBottom: '12px' }}>
                Compétences populaires (cliquez pour ajouter) :
              </p>
              {Object.entries(AVAILABLE_SKILLS).map(([category, skills]) => (
                <div key={category} style={{ marginBottom: '16px' }}>
                  <h4 style={{ 
                    color: '#ffcc00', 
                    fontSize: '14px', 
                    margin: '0 0 8px 0',
                    fontWeight: 'bold'
                  }}>
                    {category}
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {skills.slice(0, 8).map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => addSkill(skill)}
                        disabled={formData.skills.includes(skill)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: formData.skills.includes(skill) ? '#444' : '#333',
                          color: formData.skills.includes(skill) ? '#666' : '#f5f5f7',
                          border: '1px solid #555',
                          borderRadius: '12px',
                          fontSize: '11px',
                          cursor: formData.skills.includes(skill) ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!formData.skills.includes(skill)) {
                            e.target.style.backgroundColor = '#444';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!formData.skills.includes(skill)) {
                            e.target.style.backgroundColor = '#333';
                          }
                        }}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LinkedIn */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              color: '#f5f5f7', 
              marginBottom: '8px',
              fontWeight: 'bold'
            }}>
              LinkedIn
            </label>
            <input
              type="url"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#222',
                border: 'none',
                borderRadius: '4px',
                color: '#f5f5f7',
                fontSize: '14px'
              }}
              placeholder="https://linkedin.com/in/votre-profil"
            />
          </div>

          {/* GitHub */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              color: '#f5f5f7', 
              marginBottom: '8px',
              fontWeight: 'bold'
            }}>
              GitHub
            </label>
            <input
              type="url"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#222',
                border: 'none',
                borderRadius: '4px',
                color: '#f5f5f7',
                fontSize: '14px'
              }}
              placeholder="https://github.com/votre-username"
            />
          </div>

          {/* CV Upload */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              color: '#f5f5f7', 
              marginBottom: '8px',
              fontWeight: 'bold'
            }}>
              CV (PDF - max 3MB)
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleCvUpload}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#222',
                border: 'none',
                borderRadius: '4px',
                color: '#f5f5f7',
                fontSize: '14px'
              }}
            />
            {formData.cvUrl && (
              <p style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>
                CV actuel: {formData.cvUrl}
              </p>
            )}
          </div>

          {/* Zone de suppression de compte */}
          <div style={{
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #333'
          }}>
            <h3 style={{ 
              color: '#ff6b6b', 
              margin: '0 0 16px 0', 
              fontSize: '16px' 
            }}>
              ⚠️ Zone dangereuse
            </h3>
            <p style={{ 
              color: '#ccc', 
              fontSize: '14px', 
              marginBottom: '16px' 
            }}>
              Supprimer définitivement votre compte. Cette action est irréversible.
            </p>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                backgroundColor: showDeleteConfirm ? '#ff4444' : '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading 
                ? 'Suppression...' 
                : showDeleteConfirm 
                  ? 'Confirmer la suppression' 
                  : 'Supprimer mon compte'
              }
            </button>
            {showDeleteConfirm && (
              <div style={{ 
                marginTop: '12px', 
                padding: '12px', 
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                borderRadius: '4px',
                border: '1px solid #ff6b6b'
              }}>
                <p style={{ 
                  color: '#ff6b6b', 
                  fontSize: '13px', 
                  margin: '0',
                  fontWeight: 'bold'
                }}>
                  ⚠️ Êtes-vous sûr ? Cette action supprimera définitivement votre compte et toutes vos données.
                </p>
              </div>
            )}
          </div>

          {/* Boutons principaux */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            marginTop: '24px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#888',
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
                backgroundColor: '#ffcc00',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;