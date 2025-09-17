import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FirestoreService } from '../services/firestoreService';
import { AvailabilityService } from '../services/availabilityService';
import { useNotifications } from './NotificationManager';

interface CoachInfo {
  id: string;
  displayName: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
}

interface BookingForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const TimezoneBookingInterface: React.FC = () => {
  const { coachId } = useParams<{ coachId: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();

  const [coach, setCoach] = useState<CoachInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [userTimeZone, setUserTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [formData, setFormData] = useState<BookingForm>({
    name: '',
    email: '',
    subject: 'Session de coaching',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  console.log('🌍 TimezoneBookingInterface - Fuseau horaire talent détecté:', userTimeZone);

  // Charger les informations du coach
  useEffect(() => {
    if (coachId) {
      loadCoachInfo();
    }
  }, [coachId]);

  // Charger les créneaux disponibles quand une date est sélectionnée
  useEffect(() => {
    if (selectedDate && coachId) {
      loadAvailableSlots();
    }
  }, [selectedDate, coachId]);

  const loadCoachInfo = async () => {
    if (!coachId) return;
    
    setLoading(true);
    try {
      const coachProfile = await FirestoreService.getProfileById(coachId);
      if (coachProfile && coachProfile.role === 'coach') {
        setCoach({
          id: coachProfile.id,
          displayName: coachProfile.displayName || coachProfile.email.split('@')[0],
          email: coachProfile.email,
          bio: coachProfile.bio,
          avatarUrl: coachProfile.avatarUrl
        });
      } else {
        showNotification({
          type: 'error',
          title: 'Coach introuvable',
          message: 'Coach introuvable ou indisponible'
        });
        navigate('/');
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement du coach:', error);
      showNotification({
        type: 'error',
        title: 'Erreur de chargement',
        message: 'Impossible de charger les informations du coach'
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    if (!coachId || !selectedDate) return;
    
    try {
      console.log('📅 Chargement des créneaux disponibles pour', coachId, selectedDate);
      
      // Récupérer les disponibilités publiées par le coach
      const coachSlots = await AvailabilityService.getAvailability(coachId, selectedDate);
      
      if (coachSlots && coachSlots.length > 0) {
        // Vérifier les créneaux déjà réservés
        const { AppointmentService } = await import('../services/appointmentService');
        const result = await AppointmentService.getCoachAppointments(coachId);
        
        let bookedSlots: string[] = [];
        if (result.success && result.data) {
          bookedSlots = result.data
            .filter(appointment =>
              appointment.date === selectedDate &&
              (appointment.status === 'en_attente' || appointment.status === 'confirmé')
            )
            .map(appointment => appointment.time);

          console.log('🔍 Rendez-vous pour cette date:', result.data
            .filter(appointment => appointment.date === selectedDate)
            .map(apt => ({ time: apt.time, status: apt.status }))
          );
          console.log('❌ Créneaux réservés à exclure:', bookedSlots);
        }
        
        // Filtrer les créneaux disponibles (publiés par le coach - réservés)
        const availableSlots = coachSlots.filter(slot => !bookedSlots.includes(slot));
        setAvailableSlots(availableSlots);
        
        console.log('✅ Créneaux disponibles:', availableSlots);
        console.log('📊 Résumé du filtrage:');
        console.log('  - Créneaux publiés par le coach:', coachSlots);
        console.log('  - Créneaux réservés (à exclure):', bookedSlots);
        console.log('  - Créneaux finalement disponibles:', availableSlots);
      } else {
        console.log('⚠️ Aucun créneau publié par le coach pour cette date');
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des créneaux:', error);
      setAvailableSlots([]);
    }
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) { // Prochaines 2 semaines
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Exclure les weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  const formatDateInUserZone = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('fr-FR', {
      timeZone: userTimeZone,
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('fr-FR', {
      timeZone: userTimeZone,
      day: '2-digit',
      month: '2-digit'
    });
  };

  const formatTimeInUserZone = (time: string) => {
    // Créer une date avec l'heure dans le fuseau du coach, puis l'afficher dans le fuseau du talent
    const today = new Date().toISOString().split('T')[0];
    const dateTime = new Date(`${today}T${time}:00`);
    
    return dateTime.toLocaleTimeString('fr-FR', {
      timeZone: userTimeZone,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      showNotification({
        type: 'error',
        title: 'Champs manquants',
        message: 'Veuillez sélectionner une date et une heure'
      });
      return;
    }

    if (!formData.name.trim() || !formData.email.trim()) {
      showNotification({
        type: 'error',
        title: 'Formulaire incomplet',
        message: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    setSubmitting(true);
    try {
      console.log('📅 Création du rendez-vous:', {
        coachId,
        coachName: coach?.displayName,
        talentId: 'guest', // Pour les réservations publiques
        talentName: formData.name.trim(),
        talentEmail: formData.email.trim(),
        date: selectedDate,
        time: selectedTime,
        status: 'en_attente',
        notes: formData.message.trim(),
        talentTimeZone: userTimeZone,
        coachTimeZone: 'Europe/Paris' // À récupérer du profil coach si disponible
      });

      const { AppointmentService } = await import('../services/appointmentService');
      const result = await AppointmentService.createAppointment({
        coachId: coachId!,
        coachName: coach?.displayName || 'Coach',
        talentId: 'guest',
        talentName: formData.name.trim(),
        talentEmail: formData.email.trim(),
        date: selectedDate,
        time: selectedTime,
        status: 'en_attente',
        notes: formData.message.trim() || null,
        talentTimeZone: userTimeZone,
        coachTimeZone: 'Europe/Paris'
      });

      if (result.success) {
        showNotification({
          type: 'success',
          title: 'Demande envoyée !',
          message: 'Demande de rendez-vous envoyée avec succès ! Vous recevrez un email de confirmation une fois que le coach aura validé votre demande.'
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: 'Session de coaching',
          message: ''
        });
        setSelectedDate('');
        setSelectedTime('');
        setAvailableSlots([]);
        
        // Rediriger après quelques secondes
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        showNotification({
          type: 'error',
          title: 'Erreur de réservation',
          message: result.message || 'Erreur lors de la création du rendez-vous'
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors de la soumission:', error);
      showNotification({
        type: 'error',
        title: 'Erreur d\'envoi',
        message: 'Erreur lors de l\'envoi de votre demande'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#f5f5f7'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!coach) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#f5f5f7'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <p>Coach introuvable</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#f5f5f7',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '24px',
          borderRadius: '4px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            color: '#ffcc00', 
            margin: '0 0 16px 0',
            fontSize: '28px'
          }}>
            📅 Réserver une session
          </h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '16px'
          }}>
            {coach.avatarUrl && (
              <img
                src={coach.avatarUrl}
                alt={coach.displayName}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            )}
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ color: '#f5f5f7', margin: 0, fontSize: '20px' }}>
                👤 {coach.displayName}
              </h2>
              <p style={{ color: '#888', margin: '4px 0 0 0', fontSize: '14px' }}>
                {coach.email}
              </p>
            </div>
          </div>
          {coach.bio && (
            <p style={{ 
              color: '#ccc', 
              fontSize: '14px',
              fontStyle: 'italic',
              margin: 0
            }}>
              "{coach.bio}"
            </p>
          )}
        </div>

        {/* Fuseau horaire info */}
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '14px', color: '#ffcc00' }}>
            🕐 Créneaux affichés dans votre fuseau horaire : {userTimeZone}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '24px',
            borderRadius: '4px',
            marginBottom: '24px'
          }}>
            {/* Informations personnelles */}
            <h3 style={{ color: '#ffcc00', marginBottom: '16px' }}>
              📝 Vos informations
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px',
                color: '#f5f5f7'
              }}>
                Nom complet *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
                placeholder="Votre nom et prénom"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px',
                color: '#f5f5f7'
              }}>
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
                placeholder="votre@email.com"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px',
                color: '#f5f5f7'
              }}>
                Message (optionnel)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
                placeholder="Décrivez brièvement vos attentes ou objectifs..."
              />
            </div>
          </div>

          {/* Sélection date et heure */}
          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '24px',
            borderRadius: '4px',
            marginBottom: '24px'
          }}>
            <h3 style={{ color: '#ffcc00', marginBottom: '16px' }}>
              📅 Choisir un créneau
            </h3>

            {/* Sélection de date */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '12px', 
                fontSize: '16px',
                color: '#f5f5f7'
              }}>
                Date *
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '8px'
              }}>
                {getAvailableDates().map(date => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    style={{
                      padding: '12px 8px',
                      backgroundColor: selectedDate === date ? '#ffcc00' : '#333',
                      color: selectedDate === date ? '#000' : '#f5f5f7',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: selectedDate === date ? 'bold' : 'normal',
                      textAlign: 'center'
                    }}
                  >
                    <div>{formatShortDate(date)}</div>
                    <div style={{ fontSize: '10px', opacity: 0.8 }}>
                      {new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short' })}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sélection d'heure */}
            {selectedDate && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '12px', 
                  fontSize: '16px',
                  color: '#f5f5f7'
                }}>
                  Créneaux disponibles - {formatDateInUserZone(selectedDate)} *
                </label>
                
                {availableSlots.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#888'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                    <p>Aucun créneau disponible pour cette date</p>
                    <p style={{ fontSize: '14px' }}>
                      Le coach n'a pas encore publié ses disponibilités.
                    </p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                    gap: '8px'
                  }}>
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        style={{
                          padding: '12px 8px',
                          backgroundColor: selectedTime === slot ? '#ffcc00' : '#333',
                          color: selectedTime === slot ? '#000' : '#f5f5f7',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: selectedTime === slot ? 'bold' : 'normal'
                        }}
                      >
                        {formatTimeInUserZone(slot)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Résumé et soumission */}
          {selectedDate && selectedTime && (
            <div style={{
              backgroundColor: '#2a2a2a',
              padding: '20px',
              borderRadius: '4px',
              marginBottom: '24px',
              border: '1px solid #ffcc00'
            }}>
              <h4 style={{ color: '#ffcc00', margin: '0 0 12px 0' }}>
                ✅ Résumé de votre demande
              </h4>
              <div style={{ color: '#f5f5f7', fontSize: '14px' }}>
                <p><strong>Coach :</strong> {coach.displayName}</p>
                <p><strong>Date :</strong> {formatDateInUserZone(selectedDate)}</p>
                <p><strong>Heure :</strong> {formatTimeInUserZone(selectedTime)} (votre fuseau horaire)</p>
                <p><strong>Nom :</strong> {formData.name || '(À remplir)'}</p>
                <p><strong>Email :</strong> {formData.email || '(À remplir)'}</p>
              </div>
            </div>
          )}

          {/* Bouton de soumission */}
          <div style={{ textAlign: 'center' }}>
            <button
              type="submit"
              disabled={submitting || !selectedDate || !selectedTime || !formData.name.trim() || !formData.email.trim()}
              style={{
                padding: '16px 32px',
                backgroundColor: submitting || !selectedDate || !selectedTime || !formData.name.trim() || !formData.email.trim() 
                  ? '#666' 
                  : '#ffcc00',
                color: submitting || !selectedDate || !selectedTime || !formData.name.trim() || !formData.email.trim() 
                  ? '#ccc' 
                  : '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: submitting || !selectedDate || !selectedTime || !formData.name.trim() || !formData.email.trim() 
                  ? 'not-allowed' 
                  : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
            >
              {submitting ? '📤 Envoi en cours...' : '📅 Demander ce rendez-vous'}
            </button>
          </div>

          {selectedDate && selectedTime && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: '#2a2a2a',
              borderRadius: '4px',
              fontSize: '14px',
              color: '#f5f5f7'
            }}>
              <h4 style={{ color: '#ffcc00', margin: '0 0 8px 0' }}>ℹ️ Étapes suivantes :</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Votre demande sera envoyée au coach</li>
                <li>Vous recevrez un email de confirmation de votre demande</li>
                <li>Le coach confirmera ou proposera un autre créneau</li>
                <li>Une fois confirmé, vous recevrez les liens de connexion (Google Meet)</li>
                <li>L'événement sera ajouté à votre agenda Google automatiquement</li>
              </ul>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default TimezoneBookingInterface;