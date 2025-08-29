import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { AppointmentService } from '../services/appointmentService';
import { useNotifications } from './NotificationManager';
import useAuth from '../contexts/AuthContext';
const CoachAppointmentManager = ({ onClose }) => {
    const { user } = useAuth();
    const { showNotification } = useNotifications();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (user) {
            loadAppointments();
        }
    }, [user]);
    const loadAppointments = async () => {
        if (!user)
            return;
        setLoading(true);
        try {
            const result = await AppointmentService.getCoachAppointments(user.id);
            if (result.success && result.data) {
                setAppointments(result.data);
            }
            else {
                showNotification({
                    type: 'error',
                    title: 'Erreur',
                    message: 'Impossible de charger les rendez-vous'
                });
            }
        }
        catch (error) {
            console.error('Erreur lors du chargement des rendez-vous:', error);
            showNotification({
                type: 'error',
                title: 'Erreur',
                message: 'Erreur lors du chargement des rendez-vous'
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleConfirmAppointment = async (appointmentId) => {
        try {
            await AppointmentService.updateAppointmentStatus(appointmentId, 'confirmé');
            showNotification({
                type: 'success',
                title: 'Rendez-vous confirmé',
                message: 'Le talent a été notifié de la confirmation'
            });
            await loadAppointments(); // Recharger la liste
        }
        catch (error) {
            console.error('Erreur lors de la confirmation:', error);
            showNotification({
                type: 'error',
                title: 'Erreur',
                message: 'Impossible de confirmer le rendez-vous'
            });
        }
    };
    const handleCancelAppointment = async (appointmentId) => {
        try {
            await AppointmentService.cancelAppointment(appointmentId);
            showNotification({
                type: 'success',
                title: 'Rendez-vous annulé',
                message: 'Le talent a été notifié de l\'annulation'
            });
            await loadAppointments(); // Recharger la liste
        }
        catch (error) {
            console.error('Erreur lors de l\'annulation:', error);
            showNotification({
                type: 'error',
                title: 'Erreur',
                message: 'Impossible d\'annuler le rendez-vous'
            });
        }
    };
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const days = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
        const months = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
        return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
    };
    const getStatusColor = (status) => {
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
    const getStatusText = (status) => {
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
    return (_jsx("div", { style: {
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
        }, children: _jsxs("div", { style: {
                backgroundColor: '#1a1a1a',
                padding: 24,
                borderRadius: 4,
                maxWidth: '1000px',
                width: '90%',
                maxHeight: '90vh',
                overflow: 'auto'
            }, children: [_jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 24,
                        borderBottom: '1px solid #333',
                        paddingBottom: 16
                    }, children: [_jsx("h2", { style: { color: '#ffcc00', margin: 0 }, children: "Mes Rendez-vous" }), _jsx("button", { onClick: onClose, style: {
                                background: 'none',
                                border: 'none',
                                color: '#f5f5f7',
                                fontSize: '18px',
                                cursor: 'pointer',
                                padding: '4px 8px'
                            }, children: "Fermer" })] }), _jsxs("div", { style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: 16,
                        marginBottom: 24
                    }, children: [_jsxs("div", { style: {
                                backgroundColor: '#2a2a2a',
                                padding: 16,
                                borderRadius: 4,
                                textAlign: 'center'
                            }, children: [_jsx("div", { style: { color: '#ffcc00', fontSize: '24px', fontWeight: 'bold' }, children: appointments.filter(a => a.status === 'en_attente').length }), _jsx("div", { style: { color: '#f5f5f7', fontSize: '14px' }, children: "En attente" })] }), _jsxs("div", { style: {
                                backgroundColor: '#2a2a2a',
                                padding: 16,
                                borderRadius: 4,
                                textAlign: 'center'
                            }, children: [_jsx("div", { style: { color: '#61bfac', fontSize: '24px', fontWeight: 'bold' }, children: appointments.filter(a => a.status === 'confirmé').length }), _jsx("div", { style: { color: '#f5f5f7', fontSize: '14px' }, children: "Confirm\u00E9s" })] }), _jsxs("div", { style: {
                                backgroundColor: '#2a2a2a',
                                padding: 16,
                                borderRadius: 4,
                                textAlign: 'center'
                            }, children: [_jsx("div", { style: { color: '#ff6b6b', fontSize: '24px', fontWeight: 'bold' }, children: appointments.filter(a => a.status === 'annulé').length }), _jsx("div", { style: { color: '#f5f5f7', fontSize: '14px' }, children: "Annul\u00E9s" })] })] }), loading ? (_jsx("div", { style: { textAlign: 'center', color: '#ffcc00', padding: '40px' }, children: "Chargement des rendez-vous..." })) : appointments.length === 0 ? (_jsx("div", { style: { textAlign: 'center', color: '#888', padding: '40px' }, children: "Aucun rendez-vous pour le moment" })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: appointments
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((appointment) => (_jsxs("div", { style: {
                            backgroundColor: '#2a2a2a',
                            padding: 16,
                            borderRadius: 4
                        }, children: [_jsxs("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: 8
                                }, children: [_jsxs("div", { children: [_jsx("h4", { style: { color: '#f5f5f7', margin: '0 0 4px 0' }, children: appointment.talentName }), _jsx("p", { style: { color: '#888', margin: '0 0 4px 0' }, children: appointment.talentEmail }), _jsxs("p", { style: { color: '#888', margin: 0 }, children: [formatDate(appointment.date), " \u00E0 ", appointment.time] })] }), _jsxs("div", { style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-end',
                                            gap: 8
                                        }, children: [_jsx("span", { style: {
                                                    color: getStatusColor(appointment.status),
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    padding: '4px 8px',
                                                    backgroundColor: `${getStatusColor(appointment.status)}20`,
                                                    borderRadius: 4
                                                }, children: getStatusText(appointment.status) }), appointment.status === 'en_attente' && (_jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("button", { onClick: () => handleConfirmAppointment(appointment.id), style: {
                                                            padding: '6px 12px',
                                                            backgroundColor: '#61bfac',
                                                            color: '#000',
                                                            border: 'none',
                                                            borderRadius: 4,
                                                            cursor: 'pointer',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold'
                                                        }, children: "Confirmer" }), _jsx("button", { onClick: () => handleCancelAppointment(appointment.id), style: {
                                                            padding: '6px 12px',
                                                            backgroundColor: '#ff6b6b',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: 4,
                                                            cursor: 'pointer',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold'
                                                        }, children: "Annuler" })] }))] })] }), appointment.notes && (_jsxs("div", { style: {
                                    marginTop: 8,
                                    padding: 8,
                                    backgroundColor: '#333',
                                    borderRadius: 4,
                                    fontSize: '14px',
                                    color: '#f5f5f7'
                                }, children: [_jsx("strong", { children: "Notes :" }), " ", appointment.notes] }))] }, appointment.id))) }))] }) }));
};
export default CoachAppointmentManager;
