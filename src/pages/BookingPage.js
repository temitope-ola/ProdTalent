import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FirestoreService } from '../services/firestoreService';
import { useNotifications } from '../components/NotificationManager';
const BookingPage = () => {
    const { coachId } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotifications();
    const [coach, setCoach] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [formData, setFormData] = useState({
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
        if (!coachId)
            return;
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
            }
            else {
                showNotification({
                    type: 'error',
                    title: 'Coach introuvable',
                    message: 'Ce coach n\'existe pas ou n\'est plus disponible'
                });
                navigate('/');
            }
        }
        catch (error) {
            console.error('Erreur lors du chargement du coach:', error);
            showNotification({
                type: 'error',
                title: 'Erreur',
                message: 'Impossible de charger les informations du coach'
            });
            navigate('/');
        }
        finally {
            setLoading(false);
        }
    };
    const loadAvailableSlots = async () => {
        if (!coachId || !selectedDate)
            return;
        try {
            // Intégration avec l'API Google Calendar pour récupérer les créneaux disponibles
            const { googleCalendarGISService } = await import('../services/googleCalendarGISService');
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
            const events = await googleCalendarGISService.getEvents(startOfDay.toISOString(), endOfDay.toISOString());
            // Filtrer pour ne récupérer que les créneaux "DISPONIBLE"
            const availableEvents = events.filter(event => event.summary && event.summary.toLowerCase().includes('disponible'));
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
            }
            else {
                setAvailableSlots(slots);
            }
        }
        catch (error) {
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
    const handleSubmit = async (e) => {
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
            const { googleCalendarGISService } = await import('../services/googleCalendarGISService');
            // Convertir l'heure sélectionnée en format attendu
            const [hours, minutes] = selectedTime.split(':');
            const startDateTime = new Date(selectedDate);
            startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            const endDateTime = new Date(startDateTime);
            endDateTime.setMinutes(endDateTime.getMinutes() + 60); // Session d'1 heure par défaut
            // Créer l'événement dans Google Calendar
            const eventId = await googleCalendarGISService.createCoachingSession(formData.name, formData.email, selectedDate, selectedTime, endDateTime.toTimeString().slice(0, 5), formData.message || formData.subject);
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
            }
            else {
                throw new Error('Impossible de créer l\'événement dans Google Calendar');
            }
        }
        catch (error) {
            console.error('Erreur lors de la réservation:', error);
            showNotification({
                type: 'error',
                title: 'Erreur de réservation',
                message: 'Une erreur est survenue lors de la création du rendez-vous. Veuillez réessayer.'
            });
        }
        finally {
            setSubmitting(false);
        }
    };
    if (loading) {
        return (_jsx("div", { style: {
                minHeight: '100vh',
                backgroundColor: '#0a0a0a',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }, children: _jsx("div", { style: { color: '#f5f5f7', fontSize: '18px' }, children: "Chargement..." }) }));
    }
    if (!coach) {
        return (_jsx("div", { style: {
                minHeight: '100vh',
                backgroundColor: '#0a0a0a',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }, children: _jsx("div", { style: { color: '#ff6b6b', fontSize: '18px' }, children: "Coach introuvable" }) }));
    }
    return (_jsxs("div", { style: {
            minHeight: '100vh',
            backgroundColor: '#0a0a0a',
            color: '#f5f5f7'
        }, children: [_jsx("div", { style: {
                    backgroundColor: '#1a1a1a',
                    padding: '20px 0',
                    borderBottom: '1px solid #333'
                }, children: _jsxs("div", { style: {
                        maxWidth: '800px',
                        margin: '0 auto',
                        padding: '0 20px',
                        textAlign: 'center'
                    }, children: [_jsxs("h1", { style: { color: '#ffcc00', margin: '0 0 10px 0', fontSize: '28px' }, children: ["R\u00E9server avec ", coach.displayName] }), _jsx("p", { style: { color: '#ccc', margin: 0, fontSize: '16px' }, children: "Choisissez votre cr\u00E9neau de coaching" })] }) }), _jsxs("div", { style: {
                    maxWidth: '800px',
                    margin: '0 auto',
                    padding: '40px 20px'
                }, children: [_jsxs("div", { style: {
                            backgroundColor: '#1a1a1a',
                            padding: '30px',
                            borderRadius: '4px',
                            marginBottom: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px'
                        }, children: [_jsx("div", { style: {
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
                                }, children: coach.displayName[0].toUpperCase() }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("h2", { style: { color: '#f5f5f7', margin: '0 0 8px 0', fontSize: '24px' }, children: coach.displayName }), _jsx("p", { style: { color: '#61bfac', margin: '0 0 8px 0', fontSize: '16px' }, children: "Coach Professionnel" }), coach.bio && (_jsx("p", { style: { color: '#ccc', margin: 0, fontSize: '14px', lineHeight: '1.4' }, children: coach.bio }))] })] }), _jsxs("form", { onSubmit: handleSubmit, style: {
                            backgroundColor: '#1a1a1a',
                            padding: '30px',
                            borderRadius: '4px'
                        }, children: [_jsx("h3", { style: { color: '#ffcc00', margin: '0 0 30px 0', fontSize: '20px' }, children: "\uD83D\uDCC5 R\u00E9server votre cr\u00E9neau" }), _jsxs("div", { style: { display: 'grid', gap: '20px', marginBottom: '30px' }, children: [_jsxs("div", { children: [_jsx("label", { style: {
                                                    display: 'block',
                                                    color: '#f5f5f7',
                                                    marginBottom: '8px',
                                                    fontWeight: 'bold'
                                                }, children: "Date *" }), _jsxs("select", { value: selectedDate, onChange: (e) => setSelectedDate(e.target.value), style: {
                                                    width: '100%',
                                                    padding: '12px',
                                                    backgroundColor: '#333',
                                                    color: '#f5f5f7',
                                                    border: '1px solid #555',
                                                    borderRadius: '4px',
                                                    fontSize: '14px'
                                                }, required: true, children: [_jsx("option", { value: "", children: "S\u00E9lectionnez une date" }), generateDateOptions().map(option => (_jsx("option", { value: option.value, children: option.label }, option.value)))] })] }), selectedDate && (_jsxs("div", { children: [_jsx("label", { style: {
                                                    display: 'block',
                                                    color: '#f5f5f7',
                                                    marginBottom: '8px',
                                                    fontWeight: 'bold'
                                                }, children: "Heure *" }), _jsx("div", { style: {
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                                                    gap: '10px'
                                                }, children: availableSlots.map(time => (_jsx("button", { type: "button", onClick: () => setSelectedTime(time), style: {
                                                        padding: '10px',
                                                        backgroundColor: selectedTime === time ? '#ffcc00' : '#333',
                                                        color: selectedTime === time ? '#000' : '#f5f5f7',
                                                        border: '1px solid #555',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontWeight: selectedTime === time ? 'bold' : 'normal'
                                                    }, children: time }, time))) })] })), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }, children: [_jsxs("div", { children: [_jsx("label", { style: {
                                                            display: 'block',
                                                            color: '#f5f5f7',
                                                            marginBottom: '8px',
                                                            fontWeight: 'bold'
                                                        }, children: "Nom *" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), style: {
                                                            width: '100%',
                                                            padding: '12px',
                                                            backgroundColor: '#333',
                                                            color: '#f5f5f7',
                                                            border: '1px solid #555',
                                                            borderRadius: '4px',
                                                            fontSize: '14px'
                                                        }, required: true })] }), _jsxs("div", { children: [_jsx("label", { style: {
                                                            display: 'block',
                                                            color: '#f5f5f7',
                                                            marginBottom: '8px',
                                                            fontWeight: 'bold'
                                                        }, children: "Email *" }), _jsx("input", { type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), style: {
                                                            width: '100%',
                                                            padding: '12px',
                                                            backgroundColor: '#333',
                                                            color: '#f5f5f7',
                                                            border: '1px solid #555',
                                                            borderRadius: '4px',
                                                            fontSize: '14px'
                                                        }, required: true })] })] }), _jsxs("div", { children: [_jsx("label", { style: {
                                                    display: 'block',
                                                    color: '#f5f5f7',
                                                    marginBottom: '8px',
                                                    fontWeight: 'bold'
                                                }, children: "Sujet" }), _jsx("input", { type: "text", value: formData.subject, onChange: (e) => setFormData({ ...formData, subject: e.target.value }), style: {
                                                    width: '100%',
                                                    padding: '12px',
                                                    backgroundColor: '#333',
                                                    color: '#f5f5f7',
                                                    border: '1px solid #555',
                                                    borderRadius: '4px',
                                                    fontSize: '14px'
                                                }, placeholder: "Ex: Pr\u00E9paration entretien, conseils CV..." })] }), _jsxs("div", { children: [_jsx("label", { style: {
                                                    display: 'block',
                                                    color: '#f5f5f7',
                                                    marginBottom: '8px',
                                                    fontWeight: 'bold'
                                                }, children: "Message (optionnel)" }), _jsx("textarea", { value: formData.message, onChange: (e) => setFormData({ ...formData, message: e.target.value }), rows: 4, style: {
                                                    width: '100%',
                                                    padding: '12px',
                                                    backgroundColor: '#333',
                                                    color: '#f5f5f7',
                                                    border: '1px solid #555',
                                                    borderRadius: '4px',
                                                    fontSize: '14px',
                                                    resize: 'vertical'
                                                }, placeholder: "D\u00E9crivez bri\u00E8vement ce sur quoi vous aimeriez travailler..." })] })] }), _jsx("button", { type: "submit", disabled: submitting || !formData.name || !formData.email || !selectedDate || !selectedTime, style: {
                                    width: '100%',
                                    padding: '15px',
                                    backgroundColor: submitting || !formData.name || !formData.email || !selectedDate || !selectedTime
                                        ? '#666'
                                        : '#61bfac',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: submitting || !formData.name || !formData.email || !selectedDate || !selectedTime
                                        ? 'not-allowed'
                                        : 'pointer'
                                }, children: submitting ? '⏳ Réservation en cours...' : '🎯 Confirmer la réservation' })] }), _jsxs("div", { style: {
                            marginTop: '30px',
                            padding: '20px',
                            backgroundColor: '#2a2a2a',
                            borderRadius: '4px',
                            borderLeft: '4px solid #61bfac'
                        }, children: [_jsx("h4", { style: { color: '#61bfac', margin: '0 0 10px 0' }, children: "\u2139\uFE0F Apr\u00E8s votre r\u00E9servation" }), _jsxs("ul", { style: { color: '#ccc', margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }, children: [_jsx("li", { children: "L'\u00E9v\u00E9nement sera automatiquement ajout\u00E9 \u00E0 l'agenda Google du coach" }), _jsx("li", { children: "Vous recevrez une invitation Google Calendar par email" }), _jsxs("li", { children: ["Le cr\u00E9neau \"DISPONIBLE\" sera transform\u00E9 en \"Coaching avec ", formData.name || '[Votre nom]', "\""] }), _jsx("li", { children: "Google Calendar enverra automatiquement les rappels configur\u00E9s" }), _jsx("li", { children: "Vous pouvez g\u00E9rer votre rendez-vous directement dans Google Calendar" })] })] }), _jsxs("div", { style: {
                            marginTop: '20px',
                            padding: '15px',
                            backgroundColor: '#1a1a1a',
                            borderRadius: '4px',
                            borderLeft: '4px solid #ffcc00'
                        }, children: [_jsx("h5", { style: { color: '#ffcc00', margin: '0 0 8px 0', fontSize: '14px' }, children: "\uD83D\uDCDD Pour le coach" }), _jsx("p", { style: { color: '#ccc', margin: 0, fontSize: '12px', lineHeight: '1.4' }, children: "Assurez-vous d'avoir des cr\u00E9neaux \"DISPONIBLE - Coaching\" dans votre Google Calendar pour que les talents puissent les r\u00E9server." })] })] })] }));
};
export default BookingPage;
