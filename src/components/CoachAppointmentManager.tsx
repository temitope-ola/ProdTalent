import React, { useState, useEffect } from 'react';
import { AppointmentService } from '../services/appointmentService';
import { useNotifications } from './NotificationManager';
import useAuth from '../contexts/AuthContext';

interface CoachAppointmentManagerProps {
  onClose: () => void;
}

const CoachAppointmentManager: React.FC<CoachAppointmentManagerProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  console.log('🔍 CoachAppointmentManager - Rendu avec user:', user?.id);

  useEffect(() => {
    console.log('🔍 CoachAppointmentManager - useEffect avec user:', user?.id);
    if (user) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    if (!user) return;
    
    console.log('📅 Chargement des rendez-vous pour coach:', user.id);
    setLoading(true);
    try {
      const result = await AppointmentService.getCoachAppointments(user.id);
      console.log('📅 Résultat AppointmentService:', result);
      
      if (result.success && result.data) {
        console.log('✅ Rendez-vous chargés:', result.data.length);
        setAppointments(result.data);
      } else {
        console.log('⚠️ Aucun rendez-vous ou erreur:', result);
        setAppointments([]); // Vide au lieu d'erreur
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des rendez-vous:', error);
      setAppointments([]); // Vide au lieu d'erreur
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await AppointmentService.updateAppointmentStatus(appointmentId, 'confirmé');
      showNotification({
        type: 'success',
        title: 'Rendez-vous confirmé',
        message: 'Le talent a été notifié de la confirmation'
      });
      await loadAppointments(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de la confirmation:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de confirmer le rendez-vous'
      });
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await AppointmentService.cancelAppointment(appointmentId);
      showNotification({
        type: 'success',
        title: 'Rendez-vous annulé',
        message: 'Le talent a été notifié de l\'annulation'
      });
      await loadAppointments(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible d\'annuler le rendez-vous'
      });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
    const months = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente':
        return '#ffcc00';
      case 'confirmé':
        return '#61bfac';
      case 'annulé':
        return '#ff6b6b';
      default:
        return '#888';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'en_attente':
        return 'En attente';
      case 'confirmé':
        return 'Confirmé';
      case 'annulé':
        return 'Annulé';
      default:
        return status;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        padding: 24,
        borderRadius: 4,
        maxWidth: '1000px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          borderBottom: '1px solid #333',
          paddingBottom: 16
        }}>
          <h2 style={{ color: '#ffcc00', margin: 0 }}>Mes Rendez-vous</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#f5f5f7',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            Fermer
          </button>
        </div>

        {/* Statistiques */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 16,
          marginBottom: 24
        }}>
          <div style={{
            backgroundColor: '#2a2a2a',
            padding: 16,
            borderRadius: 4,
            textAlign: 'center'
          }}>
            <div style={{ color: '#ffcc00', fontSize: '24px', fontWeight: 'bold' }}>
              {appointments.filter(a => a.status === 'en_attente').length}
            </div>
            <div style={{ color: '#f5f5f7', fontSize: '14px' }}>En attente</div>
          </div>
          <div style={{
            backgroundColor: '#2a2a2a',
            padding: 16,
            borderRadius: 4,
            textAlign: 'center'
          }}>
            <div style={{ color: '#61bfac', fontSize: '24px', fontWeight: 'bold' }}>
              {appointments.filter(a => a.status === 'confirmé').length}
            </div>
            <div style={{ color: '#f5f5f7', fontSize: '14px' }}>Confirmés</div>
          </div>
          <div style={{
            backgroundColor: '#2a2a2a',
            padding: 16,
            borderRadius: 4,
            textAlign: 'center'
          }}>
            <div style={{ color: '#ff6b6b', fontSize: '24px', fontWeight: 'bold' }}>
              {appointments.filter(a => a.status === 'annulé').length}
            </div>
            <div style={{ color: '#f5f5f7', fontSize: '14px' }}>Annulés</div>
          </div>
        </div>

        {/* Liste des rendez-vous */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#ffcc00', padding: '40px' }}>
            Chargement des rendez-vous...
          </div>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
            Aucun rendez-vous pour le moment
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {appointments
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((appointment) => (
                <div
                  key={appointment.id}
                  style={{
                    backgroundColor: '#2a2a2a',
                    padding: 16,
                    borderRadius: 4
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 8
                  }}>
                    <div>
                      <h4 style={{ color: '#f5f5f7', margin: '0 0 4px 0' }}>
                        {appointment.talentName}
                      </h4>
                      <p style={{ color: '#888', margin: '0 0 4px 0' }}>
                        {appointment.talentEmail}
                      </p>
                      <p style={{ color: '#888', margin: 0 }}>
                        {formatDate(appointment.date)} à {appointment.time}
                      </p>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: 8
                    }}>
                      <span style={{
                        color: getStatusColor(appointment.status),
                        fontSize: '12px',
                        fontWeight: 'bold',
                        padding: '4px 8px',
                        backgroundColor: `${getStatusColor(appointment.status)}20`,
                        borderRadius: 4
                      }}>
                        {getStatusText(appointment.status)}
                      </span>
                      
                      {appointment.status === 'en_attente' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                                                     <button
                             onClick={() => handleConfirmAppointment(appointment.id)}
                             style={{
                               padding: '6px 12px',
                               backgroundColor: '#61bfac',
                               color: '#000',
                               border: 'none',
                               borderRadius: 4,
                               cursor: 'pointer',
                               fontSize: '12px',
                               fontWeight: 'bold'
                             }}
                           >
                             Confirmer
                           </button>
                                                     <button
                             onClick={() => handleCancelAppointment(appointment.id)}
                             style={{
                               padding: '6px 12px',
                               backgroundColor: '#ff6b6b',
                               color: '#fff',
                               border: 'none',
                               borderRadius: 4,
                               cursor: 'pointer',
                               fontSize: '12px',
                               fontWeight: 'bold'
                             }}
                           >
                             Annuler
                           </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {appointment.notes && (
                    <div style={{
                      marginTop: 8,
                      padding: 8,
                      backgroundColor: '#333',
                      borderRadius: 4,
                      fontSize: '14px',
                      color: '#f5f5f7'
                    }}>
                      <strong>Notes :</strong> {appointment.notes}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachAppointmentManager;
