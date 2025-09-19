import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppointments } from '../hooks/useAppointments';
const AppointmentManager = ({ onClose }) => {
    const { user } = useAuth();
    const { appointments, upcomingAppointments, pastAppointments, loading, error, updateAppointmentStatus, cancelAppointment } = useAppointments(user?.id, user?.role);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const handleStatusUpdate = async (appointmentId, newStatus) => {
        const success = await updateAppointmentStatus(appointmentId, newStatus);
        if (success) {
            setSelectedAppointment(null);
        }
    };
    const handleCancel = async (appointmentId) => {
        const success = await cancelAppointment(appointmentId);
        if (success) {
            setSelectedAppointment(null);
        }
    };
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmé': return '#4CAF50';
            case 'en_attente': return '#FF9800';
            case 'annulé': return '#F44336';
            default: return '#888';
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case 'confirmé': return 'Confirmé';
            case 'en_attente': return 'En attente';
            case 'annulé': return 'Annulé';
            default: return status;
        }
    };
    return (_jsx("div", { style: {
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
        }, children: _jsxs("div", { style: {
                backgroundColor: '#0a0a0a',
                borderRadius: 4,
                padding: '32px',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto'
            }, children: [_jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px',
                        paddingBottom: '16px',
                        borderBottom: '1px solid #333'
                    }, children: [_jsx("h2", { style: { color: '#ffcc00', margin: 0 }, children: "Gestion des Rendez-vous" }), _jsx("button", { onClick: onClose, style: {
                                background: 'none',
                                border: 'none',
                                color: '#f5f5f7',
                                fontSize: '24px',
                                cursor: 'pointer',
                                padding: '4px 8px'
                            }, children: "\u2715" })] }), loading && (_jsx("div", { style: { textAlign: 'center', color: '#f5f5f7', padding: '20px' }, children: "Chargement des rendez-vous..." })), error && (_jsx("div", { style: {
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        color: '#F44336',
                        padding: '12px',
                        borderRadius: '4px',
                        marginBottom: '20px'
                    }, children: error })), _jsxs("div", { style: { marginBottom: '32px' }, children: [_jsxs("h3", { style: { color: '#ffcc00', marginBottom: '16px' }, children: ["Rendez-vous \u00E0 venir (", upcomingAppointments.length, ")"] }), upcomingAppointments.length === 0 ? (_jsx("p", { style: { color: '#888', fontStyle: 'italic' }, children: "Aucun rendez-vous \u00E0 venir" })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: upcomingAppointments.map(appointment => (_jsx("div", { style: {
                                    backgroundColor: '#111',
                                    padding: '16px',
                                    borderRadius: '4px',
                                    border: 'none'
                                }, children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsxs("h4", { style: { color: '#f5f5f7', margin: '0 0 8px 0' }, children: [appointment.talentName, " - ", appointment.type] }), _jsxs("p", { style: { color: '#888', margin: '0 0 4px 0' }, children: ["\uD83D\uDCC5 ", formatDate(appointment.date), " \u00E0 ", appointment.time] }), appointment.notes && (_jsxs("p", { style: { color: '#f5f5f7', margin: '8px 0 0 0', fontSize: '14px' }, children: ["\uD83D\uDCDD ", appointment.notes] }))] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }, children: [_jsx("span", { style: {
                                                        backgroundColor: getStatusColor(appointment.status),
                                                        color: '#fff',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold'
                                                    }, children: getStatusText(appointment.status) }), appointment.status === 'en_attente' && (_jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("button", { onClick: () => handleStatusUpdate(appointment.id || '', 'confirmé'), style: {
                                                                padding: '6px 12px',
                                                                backgroundColor: '#4CAF50',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontSize: '12px'
                                                            }, children: "Confirmer" }), _jsx("button", { onClick: () => handleCancel(appointment.id || ''), style: {
                                                                padding: '6px 12px',
                                                                backgroundColor: '#F44336',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontSize: '12px'
                                                            }, children: "Annuler" })] }))] })] }) }, appointment.id))) }))] }), _jsxs("div", { children: [_jsxs("h3", { style: { color: '#ffcc00', marginBottom: '16px' }, children: ["Rendez-vous pass\u00E9s (", pastAppointments.length, ")"] }), pastAppointments.length === 0 ? (_jsx("p", { style: { color: '#888', fontStyle: 'italic' }, children: "Aucun rendez-vous pass\u00E9" })) : (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: [pastAppointments.slice(0, 5).map(appointment => (_jsx("div", { style: {
                                        backgroundColor: '#111',
                                        padding: '16px',
                                        borderRadius: '4px',
                                        border: 'none',
                                        opacity: 0.7
                                    }, children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsxs("h4", { style: { color: '#f5f5f7', margin: '0 0 8px 0' }, children: [appointment.talentName, " - ", appointment.type] }), _jsxs("p", { style: { color: '#888', margin: '0 0 4px 0' }, children: ["\uD83D\uDCC5 ", formatDate(appointment.date), " \u00E0 ", appointment.time] }), appointment.notes && (_jsxs("p", { style: { color: '#f5f5f7', margin: '8px 0 0 0', fontSize: '14px' }, children: ["\uD83D\uDCDD ", appointment.notes] }))] }), _jsx("span", { style: {
                                                    backgroundColor: getStatusColor(appointment.status),
                                                    color: '#fff',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold'
                                                }, children: getStatusText(appointment.status) })] }) }, appointment.id))), pastAppointments.length > 5 && (_jsxs("p", { style: { color: '#888', textAlign: 'center', fontStyle: 'italic' }, children: ["... et ", pastAppointments.length - 5, " autres rendez-vous pass\u00E9s"] }))] }))] }), _jsx("div", { style: {
                        marginTop: '24px',
                        paddingTop: '16px',
                        borderTop: '1px solid #333',
                        textAlign: 'center'
                    }, children: _jsx("button", { onClick: onClose, style: {
                            padding: '12px 24px',
                            backgroundColor: '#ffcc00',
                            color: '#000',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }, children: "Fermer" }) })] }) }));
};
export default AppointmentManager;
