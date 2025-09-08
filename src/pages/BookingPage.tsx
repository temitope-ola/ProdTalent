import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FirestoreService } from '../services/firestoreService';
import { useNotifications } from '../components/NotificationManager';

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

const BookingPage: React.FC = () => {
  const { coachId } = useParams<{ coachId: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();

  const [coach, setCoach] = useState<CoachInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [formData, setFormData] = useState<BookingForm>({
    name: '',
    email: '',
    subject: 'Session de coaching',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Charger les informations du coach
  useEffect(() => {
    if (coachId) {
      loadCoachInfo();
    }
  }, [coachId]);

  // Charger les créneaux disponibles quand une date est sélectionnée
  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate]);

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
          message: 'Ce coach n\'existe pas ou n\'est plus disponible'
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du coach:', error);
      showNotification({
        type: 'error',
        title: 'Erreur',
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
      // Intégration avec l'API Google Calendar pour récupérer les créneaux disponibles
      const { googleCalendarGISService } = await import('../services/googleCalendarGISService.ts');
      
      // Vérifier si le service est authentifié
      if (!googleCalendarGISService.isUserAuthenticated()) {
        // Afficher les créneaux par défaut si pas authentifié
        const slots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
        setAvailableSlots(slots);
        return;
      }
      
      // Récupérer les événements du jour sélectionné
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const events = await googleCalendarGISService.getEvents(
        startOfDay.toISOString(),
        endOfDay.toISOString()
      );
      
      // Filtrer pour ne récupérer que les créneaux "DISPONIBLE"
      const availableEvents = events.filter(event => 
        event.summary && event.summary.toLowerCase().includes('disponible')
      );
      
      // Convertir en créneaux horaires
      const slots = availableEvents.map(event => {
        if (event.start?.dateTime) {
          const startTime = new Date(event.start.dateTime);
          return startTime.toTimeString().slice(0, 5);
        }
        return null;
      }).filter(Boolean).sort();
      
      // Si aucun créneau disponible trouvé, afficher les créneaux par défaut
      if (slots.length === 0) {
        const defaultSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
        setAvailableSlots(defaultSlots);
      } else {
        setAvailableSlots(slots);
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des créneaux:', error);
      // En cas d'erreur, afficher les créneaux par défaut
      const slots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
      setAvailableSlots(slots);
    }
  };

  const generateDateOptions = () => {
    const options = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Exclure les weekends pour cet exemple
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        options.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })
        });
      }
    }
    
    return options;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !selectedDate || !selectedTime) {
      showNotification({
        type: 'error',
        title: 'Formulaire incomplet',
        message: 'Veuillez remplir tous les champs requis'
      });
      return;
    }

    setSubmitting(true);

    try {
      // Intégration avec l'API Google Calendar
      const { googleCalendarGISService } = await import('../services/googleCalendarGISService.ts');
      
      // Convertir l'heure sélectionnée en format attendu
      const [hours, minutes] = selectedTime.split(':');
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + 60); // Session d'1 heure par défaut
      
      // Créer l'événement dans Google Calendar
      const eventId = await googleCalendarGISService.createCoachingSession(
        formData.name,
        formData.email,
        selectedDate,
        selectedTime,
        endDateTime.toTimeString().slice(0, 5),
        formData.message || formData.subject
      );
      
      if (eventId) {
        showNotification({
          type: 'success',
          title: 'Réservation confirmée !',
          message: `Votre rendez-vous avec ${coach?.displayName} le ${selectedDate} à ${selectedTime} est confirmé. Vous recevrez un email de confirmation.`
        });

        // Reset form
        setFormData({ name: '', email: '', subject: 'Session de coaching', message: '' });
        setSelectedDate('');
        setSelectedTime('');
      } else {
        throw new Error('Impossible de créer l\'événement dans Google Calendar');
      }
      
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      showNotification({
        type: 'error',
        title: 'Erreur de réservation',
        message: 'Une erreur est survenue lors de la création du rendez-vous. Veuillez réessayer.'
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
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ color: '#f5f5f7', fontSize: '18px' }}>
          Chargement...
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
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ color: '#ff6b6b', fontSize: '18px' }}>
          Coach introuvable
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
      {/* Header */}
      <div style={{
        backgroundColor: '#1a1a1a',
        padding: '20px 0',
        borderBottom: '1px solid #333'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 20px',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#ffcc00', margin: '0 0 10px 0', fontSize: '28px' }}>
            Réserver avec {coach.displayName}
          </h1>
          <p style={{ color: '#ccc', margin: 0, fontSize: '16px' }}>
            Choisissez votre créneau de coaching
          </p>
        </div>
      </div>

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Infos du coach */}
        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '30px',
          borderRadius: '8px',
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#ffcc00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#000'
          }}>
            {coach.displayName[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: '#f5f5f7', margin: '0 0 8px 0', fontSize: '24px' }}>
              {coach.displayName}
            </h2>
            <p style={{ color: '#61bfac', margin: '0 0 8px 0', fontSize: '16px' }}>
              Coach Professionnel
            </p>
            {coach.bio && (
              <p style={{ color: '#ccc', margin: 0, fontSize: '14px', lineHeight: '1.4' }}>
                {coach.bio}
              </p>
            )}
          </div>
        </div>

        {/* Formulaire de réservation */}
        <form onSubmit={handleSubmit} style={{
          backgroundColor: '#1a1a1a',
          padding: '30px',
          borderRadius: '8px'
        }}>
          <h3 style={{ color: '#ffcc00', margin: '0 0 30px 0', fontSize: '20px' }}>
            📅 Réserver votre créneau
          </h3>

          <div style={{ display: 'grid', gap: '20px', marginBottom: '30px' }}>
            {/* Sélection de date */}
            <div>
              <label style={{ 
                display: 'block', 
                color: '#f5f5f7', 
                marginBottom: '8px',
                fontWeight: 'bold'
              }}>
                Date *
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
                required
              >
                <option value="">Sélectionnez une date</option>
                {generateDateOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sélection d'heure */}
            {selectedDate && (
              <div>
                <label style={{ 
                  display: 'block', 
                  color: '#f5f5f7', 
                  marginBottom: '8px',
                  fontWeight: 'bold'
                }}>
                  Heure *
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                  gap: '10px'
                }}>
                  {availableSlots.map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      style={{
                        padding: '10px',
                        backgroundColor: selectedTime === time ? '#ffcc00' : '#333',
                        color: selectedTime === time ? '#000' : '#f5f5f7',
                        border: '1px solid #555',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: selectedTime === time ? 'bold' : 'normal'
                      }}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Informations personnelles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  color: '#f5f5f7', 
                  marginBottom: '8px',
                  fontWeight: 'bold'
                }}>
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#333',
                    color: '#f5f5f7',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  color: '#f5f5f7', 
                  marginBottom: '8px',
                  fontWeight: 'bold'
                }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#333',
                    color: '#f5f5f7',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>
            </div>

            {/* Sujet */}
            <div>
              <label style={{ 
                display: 'block', 
                color: '#f5f5f7', 
                marginBottom: '8px',
                fontWeight: 'bold'
              }}>
                Sujet
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#333',
                  color: '#f5f5f7',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
                placeholder="Ex: Préparation entretien, conseils CV..."
              />
            </div>

            {/* Message */}
            <div>
              <label style={{ 
                display: 'block', 
                color: '#f5f5f7', 
                marginBottom: '8px',
                fontWeight: 'bold'
              }}>
                Message (optionnel)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={4}
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
                placeholder="Décrivez brièvement ce sur quoi vous aimeriez travailler..."
              />
            </div>
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={submitting || !formData.name || !formData.email || !selectedDate || !selectedTime}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: submitting || !formData.name || !formData.email || !selectedDate || !selectedTime 
                ? '#666' 
                : '#61bfac',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: submitting || !formData.name || !formData.email || !selectedDate || !selectedTime 
                ? 'not-allowed' 
                : 'pointer'
            }}
          >
            {submitting ? '⏳ Réservation en cours...' : '🎯 Confirmer la réservation'}
          </button>
        </form>

        {/* Info */}
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#2a2a2a',
          borderRadius: '6px',
          borderLeft: '4px solid #61bfac'
        }}>
          <h4 style={{ color: '#61bfac', margin: '0 0 10px 0' }}>
            ℹ️ Après votre réservation
          </h4>
          <ul style={{ color: '#ccc', margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
            <li>L'événement sera automatiquement ajouté à l'agenda Google du coach</li>
            <li>Vous recevrez une invitation Google Calendar par email</li>
            <li>Le créneau "DISPONIBLE" sera transformé en "Coaching avec {formData.name || '[Votre nom]'}"</li>
            <li>Google Calendar enverra automatiquement les rappels configurés</li>
            <li>Vous pouvez gérer votre rendez-vous directement dans Google Calendar</li>
          </ul>
        </div>

        {/* Instructions pour le coach */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#1a1a1a',
          borderRadius: '6px',
          borderLeft: '4px solid #ffcc00'
        }}>
          <h5 style={{ color: '#ffcc00', margin: '0 0 8px 0', fontSize: '14px' }}>
            📝 Pour le coach
          </h5>
          <p style={{ color: '#ccc', margin: 0, fontSize: '12px', lineHeight: '1.4' }}>
            Assurez-vous d'avoir des créneaux "DISPONIBLE - Coaching" dans votre Google Calendar 
            pour que les talents puissent les réserver.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;