import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AvailabilityService } from '../services/availabilityService';
import { AppointmentService } from '../services/appointmentService';
import { useNotifications } from './NotificationManager';
const TalentAgendaView = ({ onClose }) => {
    const { user } = useAuth();
    const { showNotification } = useNotifications();
    const [coaches, setCoaches] = useState([]);
    const [selectedCoach, setSelectedCoach] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [reason, setReason] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [showReasonModal, setShowReasonModal] = useState(false);
    // Créneaux horaires disponibles
    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
        '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
        '21:00', '21:30', '22:00', '22:30', '23:00', '23:30',
        '00:00', '00:30', '01:00', '01:30', '02:00', '02:30',
        '03:00', '03:30', '04:00', '04:30', '05:00', '05:30',
        '06:00', '06:30', '07:00', '07:30', '08:00', '08:30'
    ];
    // Charger les coachs disponibles au montage
    useEffect(() => {
        loadCoaches();
    }, []);
    // Générer les dates disponibles (prochaines 4 semaines)
    const getAvailableDates = () => {
        const dates = [];
        const today = new Date();
        for (let i = 1; i <= 28; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            // Exclure les weekends
            if (date.getDay() !== 0 && date.getDay() !== 6) {
                dates.push(date.toISOString().split('T')[0]);
            }
        }
        return dates;
    };
    const loadCoaches = async () => {
        try {
            console.log('🔄 Chargement des coachs...');
            const coachesData = await AvailabilityService.getAllCoachesWithAvailability();
            console.log('📊 Données coachs reçues:', coachesData);
            setCoaches(coachesData);
            // Sélectionner automatiquement le premier coach avec des disponibilités
            if (coachesData.length > 0 && coachesData[0].availabilityCount > 0) {
                setSelectedCoach(coachesData[0].id);
                console.log('✅ Coach auto-sélectionné:', coachesData[0].name);
            }
            console.log(`✅ ${coachesData.length} coachs chargés`);
        }
        catch (error) {
            console.error('❌ Erreur lors du chargement des coachs:', error);
            showNotification({
                type: 'error',
                title: 'Erreur',
                message: `Impossible de charger les coachs: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    };
    // Charger les disponibilités quand une date est sélectionnée
    useEffect(() => {
        if (selectedDate && selectedCoach) {
            loadCoachAvailabilities();
        }
    }, [selectedDate, selectedCoach]);
    const loadCoachAvailabilities = async () => {
        setIsLoading(true);
        try {
            // Charger les vraies disponibilités depuis le service
            const availableSlots = await AvailabilityService.getAvailableSlots(selectedCoach, selectedDate);
            setAvailableSlots(availableSlots);
        }
        catch (error) {
            console.error('Erreur lors du chargement des disponibilités:', error);
            setAvailableSlots([]);
        }
        finally {
            setIsLoading(false);
        }
    };
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const days = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
        const months = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
        return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
    };
    const handleSlotClick = async (slot) => {
        if (!user) {
            showNotification({
                type: 'error',
                title: 'Connexion requise',
                message: 'Vous devez être connecté pour réserver un créneau'
            });
            return;
        }
        // Vérifier si le créneau est encore disponible
        const isAvailable = await AvailabilityService.isSlotAvailable(selectedCoach, selectedDate, slot);
        if (!isAvailable) {
            showNotification({
                type: 'error',
                title: 'Créneau non disponible',
                message: 'Ce créneau a déjà été réservé par quelqu\'un d\'autre'
            });
            // Recharger les disponibilités pour mettre à jour l'affichage
            await loadCoachAvailabilities();
            return;
        }
        // Ouvrir le modal pour saisir la raison
        setSelectedSlot(slot);
        setShowReasonModal(true);
    };
    const handleCreateAppointment = async () => {
        if (!user || !reason.trim()) {
            showNotification({
                type: 'error',
                title: 'Raison requise',
                message: 'Veuillez indiquer la raison de votre demande de rendez-vous'
            });
            return;
        }
        try {
            // Trouver les informations du coach sélectionné
            const selectedCoachData = coaches.find(c => c.id === selectedCoach);
            if (!selectedCoachData) {
                showNotification({
                    type: 'error',
                    title: 'Erreur',
                    message: 'Coach non trouvé'
                });
                return;
            }
            // Créer le rendez-vous
            const appointmentData = {
                coachId: selectedCoach,
                coachName: selectedCoachData.name,
                talentId: user.id,
                talentName: user.displayName || user.email?.split('@')[0] || 'Talent',
                talentEmail: user.email || '',
                date: selectedDate,
                time: selectedSlot,
                duration: 30, // 30 minutes par défaut
                type: 'Autre', // Type par défaut pour coaching
                status: 'en_attente',
                notes: reason.trim()
            };
            const result = await AppointmentService.createAppointment(appointmentData);
            if (result.success) {
                showNotification({
                    type: 'success',
                    title: 'Réservation confirmée',
                    message: `Réservation du créneau ${selectedSlot} avec ${selectedCoachData.name} le ${formatDate(selectedDate)}`
                });
                // Réinitialiser les états
                setReason('');
                setSelectedSlot('');
                setShowReasonModal(false);
                // Recharger les disponibilités pour masquer le créneau réservé
                await loadCoachAvailabilities();
                // Fermer l'agenda après réservation réussie
                setTimeout(() => {
                    onClose();
                }, 2000);
            }
            else {
                showNotification({
                    type: 'error',
                    title: 'Erreur de réservation',
                    message: result.error || 'Erreur lors de la réservation'
                });
            }
        }
        catch (error) {
            console.error('Erreur lors de la réservation:', error);
            showNotification({
                type: 'error',
                title: 'Erreur',
                message: 'Erreur lors de la réservation du créneau'
            });
        }
    };
    return (_jsxs("div", { style: {
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
        }, children: [_jsxs("div", { style: {
                    backgroundColor: '#111',
                    borderRadius: 4,
                    padding: 24,
                    width: '90%',
                    maxWidth: '800px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    position: 'relative'
                }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 20,
                            paddingBottom: 16,
                            borderBottom: 'none'
                        }, children: [_jsx("h2", { style: { color: '#ffcc00', margin: 0 }, children: "Agenda de Coaching" }), _jsx("button", { onClick: onClose, style: {
                                    backgroundColor: 'transparent',
                                    color: '#f5f5f7',
                                    border: 'none',
                                    borderRadius: 4,
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }, children: "Fermer" })] }), _jsxs("div", { style: { marginBottom: 20 }, children: [_jsx("label", { style: { color: '#f5f5f7', display: 'block', marginBottom: 8 }, children: "Coach *" }), coaches.length === 0 ? (_jsx("div", { style: {
                                    padding: 12,
                                    backgroundColor: '#333',
                                    color: '#888',
                                    border: 'none',
                                    borderRadius: 4,
                                    fontSize: '14px'
                                }, children: "Chargement des coachs..." })) : (_jsxs("select", { value: selectedCoach, onChange: (e) => {
                                    setSelectedCoach(e.target.value);
                                    setSelectedDate(''); // Reset date when changing coach
                                    setAvailableSlots([]);
                                }, style: {
                                    width: '100%',
                                    padding: 12,
                                    backgroundColor: '#333',
                                    color: '#f5f5f7',
                                    border: 'none',
                                    borderRadius: 4,
                                    fontSize: '14px'
                                }, children: [_jsx("option", { value: "", children: "S\u00E9lectionnez un coach" }), coaches.map(coach => (_jsxs("option", { value: coach.id, children: [coach.name, " (", coach.availabilityCount, " cr\u00E9neaux disponibles)"] }, coach.id)))] }))] }), selectedCoach && (_jsxs("div", { style: { marginBottom: 20 }, children: [_jsx("label", { style: { color: '#f5f5f7', display: 'block', marginBottom: 8 }, children: "Date *" }), _jsxs("select", { value: selectedDate, onChange: (e) => setSelectedDate(e.target.value), style: {
                                    width: '100%',
                                    padding: 12,
                                    backgroundColor: '#333',
                                    color: '#f5f5f7',
                                    border: 'none',
                                    borderRadius: 4,
                                    fontSize: '14px'
                                }, children: [_jsx("option", { value: "", children: "S\u00E9lectionnez une date" }), getAvailableDates().map(date => (_jsx("option", { value: date, children: formatDate(date) }, date)))] })] })), selectedDate && (_jsxs("div", { style: { marginBottom: 20 }, children: [_jsx("h3", { style: { color: '#ffcc00', marginBottom: 16 }, children: "Cr\u00E9neaux disponibles *" }), isLoading ? (_jsx("div", { style: { color: '#f5f5f7', textAlign: 'center', padding: 20 }, children: "Chargement des cr\u00E9neaux..." })) : (_jsx("div", { style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                    gap: 8
                                }, children: timeSlots.map(slot => {
                                    const isAvailable = availableSlots.includes(slot);
                                    return (_jsx("button", { onClick: () => isAvailable && handleSlotClick(slot), disabled: !isAvailable, style: {
                                            padding: '12px 8px',
                                            backgroundColor: isAvailable ? '#ffcc00' : '#333',
                                            color: isAvailable ? '#000' : '#666',
                                            border: 'none',
                                            borderRadius: 4,
                                            cursor: isAvailable ? 'pointer' : 'not-allowed',
                                            fontSize: '12px',
                                            fontWeight: isAvailable ? 'bold' : 'normal',
                                            transition: 'all 0.2s ease'
                                        }, onMouseEnter: (e) => {
                                            if (isAvailable) {
                                                e.currentTarget.style.backgroundColor = '#e6b800';
                                            }
                                        }, onMouseLeave: (e) => {
                                            if (isAvailable) {
                                                e.currentTarget.style.backgroundColor = '#ffcc00';
                                            }
                                        }, children: slot }, slot));
                                }) }))] })), _jsxs("div", { style: {
                            backgroundColor: '#1a1a1a',
                            padding: 16,
                            borderRadius: 4,
                            border: 'none'
                        }, children: [_jsx("h4", { style: { color: '#ffcc00', margin: '0 0 8px 0' }, children: "Instructions :" }), _jsxs("ul", { style: { color: '#f5f5f7', margin: 0, paddingLeft: 20 }, children: [_jsx("li", { children: "S\u00E9lectionnez d'abord un coach disponible" }), _jsx("li", { children: "Choisissez ensuite une date disponible" }), _jsx("li", { children: "Cliquez sur un cr\u00E9neau jaune pour r\u00E9server" }), _jsx("li", { children: "Les cr\u00E9neaux gris ne sont pas disponibles" }), _jsx("li", { children: "Vous devrez indiquer la raison de votre demande" })] })] })] }), showReasonModal && (_jsx("div", { style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 10001
                }, children: _jsxs("div", { style: {
                        backgroundColor: '#111',
                        borderRadius: 4,
                        padding: 24,
                        width: '90%',
                        maxWidth: '500px',
                        border: 'none'
                    }, children: [_jsx("h3", { style: { color: '#ffcc00', margin: '0 0 16px 0' }, children: "Raison de votre demande" }), _jsxs("p", { style: { color: '#f5f5f7', marginBottom: 16, fontSize: '14px' }, children: ["Cr\u00E9neau s\u00E9lectionn\u00E9 : ", selectedSlot, " le ", formatDate(selectedDate)] }), _jsxs("div", { style: { marginBottom: 20 }, children: [_jsx("label", { style: { color: '#f5f5f7', display: 'block', marginBottom: 8 }, children: "Pourquoi souhaitez-vous ce rendez-vous ? *" }), _jsx("textarea", { value: reason, onChange: (e) => setReason(e.target.value), placeholder: "Ex: Pr\u00E9paration d'entretien, conseils de carri\u00E8re, d\u00E9veloppement de comp\u00E9tences...", style: {
                                        width: '100%',
                                        minHeight: 100,
                                        padding: 12,
                                        backgroundColor: '#333',
                                        color: '#f5f5f7',
                                        border: 'none',
                                        borderRadius: 4,
                                        fontSize: '14px',
                                        resize: 'vertical'
                                    } })] }), _jsxs("div", { style: { display: 'flex', gap: 12, justifyContent: 'flex-end' }, children: [_jsx("button", { onClick: () => {
                                        setShowReasonModal(false);
                                        setReason('');
                                        setSelectedSlot('');
                                    }, style: {
                                        padding: '10px 20px',
                                        backgroundColor: 'transparent',
                                        color: '#f5f5f7',
                                        border: '1px solid #333',
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }, children: "Annuler" }), _jsx("button", { onClick: handleCreateAppointment, disabled: !reason.trim(), style: {
                                        padding: '10px 20px',
                                        backgroundColor: reason.trim() ? '#ffcc00' : '#666',
                                        color: reason.trim() ? '#000' : '#999',
                                        border: 'none',
                                        borderRadius: 4,
                                        cursor: reason.trim() ? 'pointer' : 'not-allowed',
                                        fontSize: '14px',
                                        fontWeight: 'bold'
                                    }, children: "Confirmer la r\u00E9servation" })] })] }) }))] }));
};
export default TalentAgendaView;
