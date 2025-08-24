import React, { useState } from 'react';
import { FirestoreService } from '../services/firestoreService';
import { UserProfile } from '../types';
import { useNotifications } from './NotificationManager';

interface ProfileEditModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProfile: UserProfile) => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSave
}) => {
  const { showNotification } = useNotifications();
  const [formData, setFormData] = useState({
    displayName: profile.displayName || '',
    bio: profile.bio || '',
    skills: profile.skills || '',
    linkedinUrl: profile.linkedinUrl || '',
    githubUrl: profile.githubUrl || '',
    cvUrl: profile.cvUrl || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (limite à 3MB pour permettre les CV avec photos)
      const maxSize = 3 * 1024 * 1024; // 3MB
      if (file.size > maxSize) {
        showNotification({
          type: 'error',
          title: 'Fichier trop volumineux',
          message: 'Le fichier CV est trop volumineux. Veuillez choisir un fichier de moins de 3MB.'
        });
        e.target.value = '';
        return;
      }
      
      // Vérifier le type de fichier
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let cvUrl = formData.cvUrl;
      
      // Upload CV if a new file is selected
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
            <textarea
              name="skills"
              value={formData.skills}
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
              placeholder="Listez vos compétences techniques, langages de programmation, outils..."
            />
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

          {/* Boutons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
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
