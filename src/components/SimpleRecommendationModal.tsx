import React, { useState, useEffect } from 'react';
import { useNotifications } from './NotificationManager';
import useAuth from '../contexts/AuthContext';

interface SimpleRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any;
}

export default function SimpleRecommendationModal({ isOpen, onClose, job }: SimpleRecommendationModalProps) {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [talents, setTalents] = useState<any[]>([]);
  const [selectedTalentId, setSelectedTalentId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (isOpen && job) {
      loadTalents();
      setMessage(`Je recommande ce talent pour le poste "${job?.title || 'ce poste'}" chez ${job?.company || 'cette entreprise'}.`);
    }
  }, [isOpen, job]);

  const loadTalents = async () => {
    try {
      setLoading(true);
      
      // Utiliser FirestoreService comme dans les autres parties du code
      const { FirestoreService } = await import('../services/firestoreService');
      const talentsData = await FirestoreService.getUsersByRole('talent');
      
      setTalents(talentsData);
    } catch (error) {
      console.error('❌ Erreur chargement talents:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger les talents: ' + (error as Error).message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendRecommendation = async () => {
    if (!user || !job || !selectedTalentId || !message.trim()) {
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Veuillez sélectionner un talent et saisir un message'
      });
      return;
    }

    // Validation CRITIQUE : job.id doit exister
    if (!job.id) {
      console.error('❌ ERREUR CRITIQUE: job.id manquant!', job);
      showNotification({
        type: 'error',
        title: 'Erreur critique',
        message: 'ID de l\'offre manquant - impossible de créer la recommandation'
      });
      return;
    }

    try {
      setLoading(true);
      
      const selectedTalent = talents.find(t => t.id === selectedTalentId);
      if (!selectedTalent) {
        throw new Error('Talent non trouvé');
      }

      // Structure de données SIMPLE et CLAIRE
      const recommendation = {
        // === IDs OBLIGATOIRES ===
        jobId: job.id,                    // OBLIGATOIRE pour le lien vers l'offre
        coachId: user.id,                 
        talentId: selectedTalent.id,      
        recruiterId: job.recruiterId,     
        
        // === INFORMATIONS D'AFFICHAGE ===
        jobTitle: job.title,
        jobCompany: job.company || 'Entreprise',
        coachName: user.displayName || user.email?.split('@')[0] || 'Coach',
        talentName: selectedTalent.displayName || 
                   (selectedTalent.firstName && selectedTalent.lastName ? 
                    `${selectedTalent.firstName} ${selectedTalent.lastName}` : 
                    selectedTalent.email?.split('@')[0] || 'Talent'),
        recruiterName: job.recruiterName || job.recruiterEmail?.split('@')[0] || 'Recruteur',
        
        // === CONTENU ===
        message: message.trim(),
        status: 'pending',
        
        // === MÉTADONNÉES ===
        createdAt: new Date(),
        type: 'job_recommendation'  // Pour différencier des autres types
      };


      // Sauvegarde directe dans Firestore
      const { collection, addDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      
      const docRef = await addDoc(collection(db, 'recommendations'), recommendation);
      
      
      // Envoyer notifications Gmail API (avec fallback SendGrid)
      try {
        const { googleIntegratedService } = await import('../services/googleIntegratedService');
        
        // Notification au talent recommandé - Gmail API
        const gmailSentToTalent = await googleIntegratedService.sendMessageNotification({
          recipientEmail: selectedTalent.email,
          recipientName: recommendation.talentName,
          senderName: recommendation.coachName,
          senderRole: 'Coach',
          subject: `Recommandation emploi pour ${job?.title || 'un poste'} - ProdTalent`,
          messagePreview: `Recommandation pour le poste "${job?.title || 'un poste'}" chez ${job?.company || 'une entreprise'}: ${recommendation.message.substring(0, 100)}...`
        });
        
        if (!gmailSentToTalent) {
          // Fallback Firebase Functions avec template professionnel
          const { BackendEmailService } = await import('../services/backendEmailService');
          await BackendEmailService.sendRecommendationToTalent({
            recipientEmail: selectedTalent.email,
            recipientName: recommendation.talentName,
            coachName: recommendation.coachName,
            jobTitle: job?.title,
            companyName: job?.company,
            message: recommendation.message
          });
        }
        
        // Notification au recruteur (si email disponible) - Gmail API
        if (job.recruiterEmail) {
          const gmailSentToRecruiter = await googleIntegratedService.sendMessageNotification({
            recipientEmail: job.recruiterEmail,
            recipientName: recommendation.recruiterName,
            senderName: recommendation.coachName,
            senderRole: 'Coach',
            subject: `Nouveau talent recommande pour ${job?.title || 'un poste'} - ProdTalent`,
            messagePreview: `Recommandation de talent pour "${job?.title || 'un poste'}": ${recommendation.talentName} - ${recommendation.message.substring(0, 100)}...`
          });

          if (!gmailSentToRecruiter) {
            // Fallback Firebase Functions avec template professionnel
            const { BackendEmailService } = await import('../services/backendEmailService');
            await BackendEmailService.sendTalentRecommendation({
              recipientEmail: job.recruiterEmail,
              recipientName: recommendation.recruiterName,
              talentName: recommendation.talentName,
              coachName: recommendation.coachName,
              jobTitle: job?.title,
              companyName: job?.company,
              message: recommendation.message
            });
          }
        }
        
        
      } catch (emailError) {
        console.error('❌ Erreur notifications recommandations:', emailError);
        // Ne pas bloquer le processus si les emails échouent
      }
      
      showNotification({
        type: 'success',
        title: '🎉 Recommandation envoyée!',
        message: `Recommandation créée pour ${selectedTalent.displayName || selectedTalent.email} avec notifications email`
      });

      // Reset et fermeture
      setSelectedTalentId('');
      setMessage('');
      onClose();

    } catch (error) {
      console.error('❌ ERREUR création recommandation:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de créer la recommandation: ' + (error as Error).message
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !job) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        borderRadius: '4px',
        padding: '30px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: '#ffcc00', margin: 0 }}>Recommander un talent</h2>
            <button 
              onClick={onClose}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: '#fff', 
                fontSize: '24px', 
                cursor: 'pointer' 
              }}
            >
              ×
            </button>
          </div>
          
          {/* Job info */}
          <div style={{
            marginTop: '16px',
            padding: '16px',
            backgroundColor: '#0a0a0a',
            borderRadius: '4px',
            border: 'none'
          }}>
            <h3 style={{ color: '#f5f5f7', margin: '0 0 8px 0' }}>{job.title}</h3>
            <p style={{ color: '#888', margin: 0 }}>
              {job.company} • {job.location} • ID: {job.id}
            </p>
          </div>
        </div>

        {/* Talent selection */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            color: '#f5f5f7', 
            marginBottom: '12px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            Sélectionner un talent :
          </label>
          {loading ? (
            <div style={{ color: '#ffcc00', padding: '20px', textAlign: 'center' }}>
              Chargement des talents...
            </div>
          ) : (
            <select
              value={selectedTalentId}
              onChange={(e) => setSelectedTalentId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#0a0a0a',
                color: '#f5f5f7',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="">-- Choisir un talent --</option>
              {talents.map(talent => (
                <option key={talent.id} value={talent.id}>
                  {talent.displayName || 
                   (talent.firstName && talent.lastName ? 
                    `${talent.firstName} ${talent.lastName}` : 
                    talent.email)} 
                  {talent.skills && ` (${Array.isArray(talent.skills) ? talent.skills.join(', ') : talent.skills})`}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Message */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            color: '#f5f5f7', 
            marginBottom: '12px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            Message de recommandation :
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Expliquez pourquoi vous recommandez ce talent..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              backgroundColor: '#0a0a0a',
              color: '#f5f5f7',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              backgroundColor: '#333',
              color: '#f5f5f7',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleSendRecommendation}
            disabled={loading || !selectedTalentId || !message.trim()}
            style={{
              padding: '12px 24px',
              backgroundColor: loading || !selectedTalentId || !message.trim() ? '#666' : '#ffcc00',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: loading || !selectedTalentId || !message.trim() ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Envoi...' : 'Envoyer la recommandation'}
          </button>
        </div>
      </div>
    </div>
  );
}