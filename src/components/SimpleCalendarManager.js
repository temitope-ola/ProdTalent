import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import useAuth from '../contexts/AuthContext';
const SimpleCalendarManager = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);
    // Générer l'URL de réservation pour ce coach
    const bookingUrl = `${window.location.origin}/book/${user?.id}`;
    const copyToClipboard = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(bookingUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        catch (error) {
            console.error('Erreur lors de la copie:', error);
            // Fallback pour les navigateurs plus anciens
            const textArea = document.createElement('textarea');
            textArea.value = bookingUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [bookingUrl]);
    const openGoogleCalendar = () => {
        window.open('https://calendar.google.com', '_blank');
    };
    if (!isOpen)
        return null;
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
                padding: '40px',
                borderRadius: '4px',
                border: '1px solid #333',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '90vh',
                overflow: 'auto'
            }, children: [_jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '30px'
                    }, children: [_jsx("h2", { style: { color: '#ffcc00', margin: 0, fontSize: '24px' }, children: "\uD83D\uDCC5 Mon Agenda de Coaching" }), _jsx("button", { onClick: onClose, style: {
                                backgroundColor: 'transparent',
                                color: '#f5f5f7',
                                border: 'none',
                                fontSize: '24px',
                                cursor: 'pointer',
                                padding: '4px'
                            }, children: "\u2715" })] }), _jsxs("div", { style: {
                        backgroundColor: '#2a2a2a',
                        padding: '20px',
                        borderRadius: '4px',
                        marginBottom: '30px'
                    }, children: [_jsx("h3", { style: { color: '#61bfac', margin: '0 0 16px 0', fontSize: '18px' }, children: "\uD83C\uDFAF Comment \u00E7a marche" }), _jsxs("ol", { style: { color: '#f5f5f7', margin: 0, paddingLeft: '20px', lineHeight: '1.6' }, children: [_jsxs("li", { children: ["Cr\u00E9ez vos cr\u00E9neaux ", _jsx("strong", { children: "\"DISPONIBLE - Coaching\"" }), " dans Google Calendar"] }), _jsx("li", { children: "Partagez votre lien de r\u00E9servation avec vos talents" }), _jsx("li", { children: "Ils r\u00E9servent directement et \u00E7a met \u00E0 jour votre agenda automatiquement" }), _jsx("li", { children: "Vous recevez une notification pour chaque r\u00E9servation" })] })] }), _jsxs("div", { style: {
                        backgroundColor: '#2a2a2a',
                        padding: '20px',
                        borderRadius: '4px',
                        marginBottom: '30px',
                        textAlign: 'center'
                    }, children: [_jsx("h3", { style: { color: '#4285f4', margin: '0 0 16px 0' }, children: "\uD83D\uDCDD G\u00E9rer mes disponibilit\u00E9s" }), _jsx("p", { style: { color: '#ccc', marginBottom: '20px', fontSize: '14px' }, children: "Cliquez pour ouvrir Google Calendar et cr\u00E9er vos cr\u00E9neaux disponibles" }), _jsx("button", { onClick: openGoogleCalendar, style: {
                                padding: '12px 24px',
                                backgroundColor: '#4285f4',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                transition: 'background-color 0.2s'
                            }, children: "\uD83D\uDE80 Ouvrir Google Calendar" })] }), _jsxs("div", { style: {
                        backgroundColor: '#2a2a2a',
                        padding: '20px',
                        borderRadius: '4px',
                        marginBottom: '30px'
                    }, children: [_jsx("h3", { style: { color: '#ffcc00', margin: '0 0 16px 0' }, children: "\uD83D\uDD17 Votre lien de r\u00E9servation" }), _jsx("p", { style: { color: '#ccc', marginBottom: '16px', fontSize: '14px' }, children: "Partagez ce lien avec vos talents pour qu'ils puissent r\u00E9server directement :" }), _jsxs("div", { style: {
                                display: 'flex',
                                gap: '10px',
                                alignItems: 'center',
                                marginBottom: '16px'
                            }, children: [_jsx("input", { type: "text", value: bookingUrl, readOnly: true, style: {
                                        flex: 1,
                                        padding: '10px',
                                        backgroundColor: '#333',
                                        color: '#f5f5f7',
                                        border: '1px solid #555',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    } }), _jsx("button", { onClick: copyToClipboard, style: {
                                        padding: '10px 16px',
                                        backgroundColor: copied ? '#61bfac' : '#ffcc00',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '14px',
                                        minWidth: '80px'
                                    }, children: copied ? '✅ Copié!' : '📋 Copier' })] }), _jsx("div", { style: {
                                backgroundColor: '#1a1a1a',
                                padding: '12px',
                                borderRadius: '4px',
                                borderLeft: '4px solid #ffcc00'
                            }, children: _jsxs("p", { style: { color: '#f5f5f7', margin: 0, fontSize: '14px' }, children: ["\uD83D\uDCA1 ", _jsx("strong", { children: "Astuce :" }), " Envoyez ce lien par email, WhatsApp ou ajoutez-le \u00E0 votre signature !"] }) })] }), _jsxs("div", { style: {
                        backgroundColor: '#2a2a2a',
                        padding: '20px',
                        borderRadius: '4px'
                    }, children: [_jsx("h3", { style: { color: '#61bfac', margin: '0 0 16px 0' }, children: "\uD83D\uDCCB Instructions d\u00E9taill\u00E9es" }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("h4", { style: { color: '#f5f5f7', margin: '0 0 8px 0', fontSize: '16px' }, children: "\uD83D\uDFE2 Cr\u00E9er vos cr\u00E9neaux disponibles :" }), _jsxs("ul", { style: { color: '#ccc', margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.5' }, children: [_jsx("li", { children: "Allez dans Google Calendar" }), _jsxs("li", { children: ["Cr\u00E9ez des \u00E9v\u00E9nements r\u00E9currents avec le titre : ", _jsx("code", { style: { backgroundColor: '#333', padding: '2px 4px', borderRadius: '4px' }, children: "\"DISPONIBLE - Coaching\"" })] }), _jsx("li", { children: "Exemple : Lundi 9h-10h, Mercredi 14h-15h, etc." }), _jsx("li", { children: "D\u00E9finissez la r\u00E9currence (chaque semaine, chaque mois...)" })] })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("h4", { style: { color: '#f5f5f7', margin: '0 0 8px 0', fontSize: '16px' }, children: "\uD83C\uDFAF Quand un talent r\u00E9serve :" }), _jsxs("ul", { style: { color: '#ccc', margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.5' }, children: [_jsx("li", { children: "Le cr\u00E9neau \"DISPONIBLE\" devient \"Coaching avec [Nom du talent]\"" }), _jsx("li", { children: "Vous recevez un email de notification" }), _jsx("li", { children: "Le talent re\u00E7oit une confirmation avec le lien Google Meet" }), _jsx("li", { children: "Des rappels sont envoy\u00E9s automatiquement" })] })] }), _jsx("div", { style: {
                                backgroundColor: '#1a1a1a',
                                padding: '12px',
                                borderRadius: '4px',
                                borderLeft: '4px solid #61bfac'
                            }, children: _jsxs("p", { style: { color: '#f5f5f7', margin: 0, fontSize: '14px' }, children: ["\u2728 ", _jsx("strong", { children: "Avantage :" }), " Tout se passe dans Google Calendar que vous utilisez d\u00E9j\u00E0. Aucune nouvelle app \u00E0 apprendre !"] }) })] }), _jsx("div", { style: {
                        marginTop: '30px',
                        textAlign: 'center',
                        paddingTop: '20px',
                        borderTop: '1px solid #333'
                    }, children: _jsx("p", { style: { color: '#888', margin: 0, fontSize: '12px' }, children: "\uD83D\uDE80 Syst\u00E8me de r\u00E9servation propuls\u00E9 par Google Calendar" }) })] }) }));
};
export default SimpleCalendarManager;
