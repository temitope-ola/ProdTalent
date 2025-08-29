import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AvailabilityService } from '../services/availabilityService';
const CoachAvailabilityManager = ({ onClose }) => {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    // Créneaux horaires disponibles
    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ];
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
    // Charger les disponibilités existantes quand une date est sélectionnée
    useEffect(() => {
        if (selectedDate && user) {
            loadExistingAvailabilities();
        }
    }, [selectedDate, user]);
    const loadExistingAvailabilities = async () => {
        if (!user)
            return;
        setLoading(true);
        try {
            // Charger les vraies disponibilités depuis Firestore
            const existingSlots = await AvailabilityService.getAvailability(user.id, selectedDate);
            setAvailableSlots(existingSlots);
            console.log('Disponibilités chargées:', existingSlots);
        }
        catch (error) {
            console.error('Erreur lors du chargement des disponibilités:', error);
            setAvailableSlots([]);
        }
        finally {
            setLoading(false);
        }
    };
    const toggleSlot = (slot) => {
        setAvailableSlots(prev => {
            if (prev.includes(slot)) {
                return prev.filter(s => s !== slot);
            }
            else {
                return [...prev, slot];
            }
        });
    };
    const saveAvailabilities = async () => {
        if (!user || !selectedDate)
            return;
        setLoading(true);
        try {
            // Sauvegarder les vraies disponibilités dans Firestore
            const success = await AvailabilityService.saveAvailability(user.id, selectedDate, availableSlots);
            if (success) {
                console.log('Disponibilités sauvegardées:', {
                    coachId: user.id,
                    date: selectedDate,
                    slots: availableSlots
                });
                setMessage({ type: 'success', text: 'Disponibilités sauvegardées avec succès !' });
            }
            else {
                setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
            }
            setTimeout(() => setMessage(null), 3000);
        }
        catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
        }
        finally {
            setLoading(false);
        }
    };
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const days = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
        const months = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
        return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
    };
    return (_jsx("div", { style: {
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
        }, children: _jsxs("div", { style: {
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
                        borderBottom: '1px solid #333'
                    }, children: [_jsx("h2", { style: { color: '#ffcc00', margin: 0 }, children: "Gestion des Disponibilit\u00E9s" }), _jsx("button", { onClick: onClose, style: {
                                backgroundColor: 'transparent',
                                color: '#f5f5f7',
                                border: 'none',
                                borderRadius: 4,
                                padding: '8px 16px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }, children: "\u2715 Fermer" })] }), _jsxs("div", { style: {
                        backgroundColor: '#1a1a1a',
                        padding: 16,
                        borderRadius: 4,
                        marginBottom: 20
                    }, children: [_jsx("h4", { style: { color: '#ffcc00', margin: '0 0 8px 0' }, children: "Instructions :" }), _jsxs("ul", { style: { color: '#f5f5f7', margin: 0, paddingLeft: 20 }, children: [_jsx("li", { children: "S\u00E9lectionnez une date dans le calendrier" }), _jsx("li", { children: "Cliquez sur les cr\u00E9neaux horaires pour les activer/d\u00E9sactiver" }), _jsx("li", { children: "Cliquez sur \"Sauvegarder\" pour enregistrer vos disponibilit\u00E9s" })] })] }), _jsxs("div", { style: { marginBottom: 20 }, children: [_jsx("label", { style: { color: '#f5f5f7', display: 'block', marginBottom: 8 }, children: "S\u00E9lectionner une date *" }), _jsx("div", { style: {
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                gap: 8
                            }, children: getAvailableDates().map(date => (_jsx("button", { onClick: () => setSelectedDate(date), style: {
                                    padding: '12px 8px',
                                    backgroundColor: selectedDate === date ? '#ffcc00' : '#333',
                                    color: selectedDate === date ? '#000' : '#f5f5f7',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: selectedDate === date ? 'bold' : 'normal',
                                    transition: 'all 0.2s ease'
                                }, onMouseEnter: (e) => {
                                    if (selectedDate !== date) {
                                        e.currentTarget.style.backgroundColor = '#444';
                                    }
                                }, onMouseLeave: (e) => {
                                    if (selectedDate !== date) {
                                        e.currentTarget.style.backgroundColor = '#333';
                                    }
                                }, children: formatDate(date) }, date))) })] }), selectedDate && (_jsxs("div", { style: { marginBottom: 20 }, children: [_jsxs("div", { style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 16
                            }, children: [_jsxs("h3", { style: { color: '#ffcc00', margin: 0 }, children: ["Cr\u00E9neaux disponibles - ", formatDate(selectedDate)] }), _jsx("button", { onClick: saveAvailabilities, disabled: loading, style: {
                                        padding: '8px 16px',
                                        backgroundColor: '#ffcc00',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: 4,
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        opacity: loading ? 0.6 : 1
                                    }, children: loading ? 'Sauvegarde...' : 'Sauvegarder' })] }), loading ? (_jsx("div", { style: { color: '#f5f5f7', textAlign: 'center', padding: 20 }, children: "Chargement des cr\u00E9neaux..." })) : (_jsx("div", { style: {
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                gap: 8
                            }, children: timeSlots.map(slot => {
                                const isSelected = availableSlots.includes(slot);
                                return (_jsx("button", { onClick: () => toggleSlot(slot), style: {
                                        padding: '12px 8px',
                                        backgroundColor: isSelected ? '#ffcc00' : '#333',
                                        color: isSelected ? '#000' : '#f5f5f7',
                                        border: 'none',
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: isSelected ? 'bold' : 'normal',
                                        transition: 'all 0.2s ease'
                                    }, onMouseEnter: (e) => {
                                        if (isSelected) {
                                            e.currentTarget.style.backgroundColor = '#e6b800';
                                        }
                                        else {
                                            e.currentTarget.style.backgroundColor = '#444';
                                        }
                                    }, onMouseLeave: (e) => {
                                        if (isSelected) {
                                            e.currentTarget.style.backgroundColor = '#ffcc00';
                                        }
                                        else {
                                            e.currentTarget.style.backgroundColor = '#333';
                                        }
                                    }, children: slot }, slot));
                            }) })), availableSlots.length > 0 && (_jsx("div", { style: {
                                marginTop: 16,
                                padding: 12,
                                backgroundColor: '#1a1a1a',
                                borderRadius: 4
                            }, children: _jsxs("p", { style: { color: '#f5f5f7', margin: 0 }, children: ["Cr\u00E9neaux s\u00E9lectionn\u00E9s : ", availableSlots.length, " cr\u00E9neaux (", availableSlots.join(', '), ")"] }) }))] })), message && (_jsx("div", { style: {
                        padding: 12,
                        backgroundColor: message.type === 'success' ? 'rgba(97, 191, 172, 0.1)' : 'rgba(255, 107, 107, 0.1)',
                        color: message.type === 'success' ? '#61bfac' : '#ff6b6b',
                        borderRadius: 4,
                        marginTop: 16,
                        textAlign: 'center'
                    }, children: message.text })), _jsxs("div", { style: {
                        backgroundColor: '#1a1a1a',
                        padding: 16,
                        borderRadius: 4
                    }, children: [_jsx("h4", { style: { color: '#ffcc00', margin: '0 0 8px 0' }, children: "Informations :" }), _jsxs("ul", { style: { color: '#f5f5f7', margin: 0, paddingLeft: 20 }, children: [_jsx("li", { children: "Les cr\u00E9neaux en jaune sont vos disponibilit\u00E9s" }), _jsx("li", { children: "Cliquez sur un cr\u00E9neau pour l'activer/d\u00E9sactiver" }), _jsx("li", { children: "Vos disponibilit\u00E9s seront visibles par les talents" }), _jsx("li", { children: "N'oubliez pas de sauvegarder apr\u00E8s chaque modification" })] })] })] }) }));
};
export default CoachAvailabilityManager;
