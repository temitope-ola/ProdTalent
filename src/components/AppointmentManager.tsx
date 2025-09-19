import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppointments } from '../hooks/useAppointments';

interface AppointmentManagerProps {
  onClose: () => void;
}

const AppointmentManager: React.FC<AppointmentManagerProps> = ({ onClose }) => {
  const { user } = useAuth();
  const {
    appointments,
    upcomingAppointments,
    pastAppointments,
    loading,
    error,
    updateAppointmentStatus,
    cancelAppointment
  } = useAppointments(user?.id, user?.role as 'coach' | 'talent');

  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    const success = await updateAppointmentStatus(appointmentId, newStatus);
    if (success) {
      setSelectedAppointment(null);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    const success = await cancelAppointment(appointmentId);
    if (success) {
      setSelectedAppointment(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmé': return '#4CAF50';
      case 'en_attente': return '#FF9800';
      case 'annulé': return '#F44336';
      default: return '#888';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmé': return 'Confirmé';
      case 'en_attente': return 'En attente';
      case 'annulé': return 'Annulé';
      default: return status;
    }
  };

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
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#0a0a0a',
        borderRadius: 4,
        padding: '32px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid #333'
        }}>
          <h2 style={{ color: '#ffcc00', margin: 0 }}>Gestion des Rendez-vous</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#f5f5f7',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            ✕
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', color: '#f5f5f7', padding: '20px' }}>
            Chargement des rendez-vous...
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            color: '#F44336',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {/* Rendez-vous à venir */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ color: '#ffcc00', marginBottom: '16px' }}>
            Rendez-vous à venir ({upcomingAppointments.length})
          </h3>
          
          {upcomingAppointments.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic' }}>
              Aucun rendez-vous à venir
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingAppointments.map(appointment => (
                <div key={appointment.id} style={{
                  backgroundColor: '#111',
                  padding: '16px',
                  borderRadius: '4px',
                  border: 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: '#f5f5f7', margin: '0 0 8px 0' }}>
                        {appointment.talentName} - {appointment.type}
                      </h4>
                      <p style={{ color: '#888', margin: '0 0 4px 0' }}>
                        📅 {formatDate(appointment.date)} à {appointment.time}
                      </p>
                      {appointment.notes && (
                        <p style={{ color: '#f5f5f7', margin: '8px 0 0 0', fontSize: '14px' }}>
                          📝 {appointment.notes}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                      <span style={{
                        backgroundColor: getStatusColor(appointment.status),
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {getStatusText(appointment.status)}
                      </span>
                      
                      {appointment.status === 'en_attente' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleStatusUpdate(appointment.id || '', 'confirmé')}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#4CAF50',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Confirmer
                          </button>
                          <button
                            onClick={() => handleCancel(appointment.id || ''  )}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#F44336',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Annuler
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rendez-vous passés */}
        <div>
          <h3 style={{ color: '#ffcc00', marginBottom: '16px' }}>
            Rendez-vous passés ({pastAppointments.length})
          </h3>
          
          {pastAppointments.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic' }}>
              Aucun rendez-vous passé
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pastAppointments.slice(0, 5).map(appointment => (
                <div key={appointment.id} style={{
                  backgroundColor: '#111',
                  padding: '16px',
                  borderRadius: '4px',
                  border: 'none',
                  opacity: 0.7
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: '#f5f5f7', margin: '0 0 8px 0' }}>
                        {appointment.talentName} - {appointment.type}
                      </h4>
                      <p style={{ color: '#888', margin: '0 0 4px 0' }}>
                        📅 {formatDate(appointment.date)} à {appointment.time}
                      </p>
                      {appointment.notes && (
                        <p style={{ color: '#f5f5f7', margin: '8px 0 0 0', fontSize: '14px' }}>
                          📝 {appointment.notes}
                        </p>
                      )}
                    </div>
                    <span style={{
                      backgroundColor: getStatusColor(appointment.status),
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                </div>
              ))}
              
              {pastAppointments.length > 5 && (
                <p style={{ color: '#888', textAlign: 'center', fontStyle: 'italic' }}>
                  ... et {pastAppointments.length - 5} autres rendez-vous passés
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #333',
          textAlign: 'center'
        }}>
          <button
            onClick={onClose}
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
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentManager;
