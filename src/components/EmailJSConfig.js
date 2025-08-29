import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNotifications } from './NotificationManager';
import emailNotificationService from '../services/emailNotificationService';
const EmailJSConfig = ({ onClose, onConfigSave }) => {
    const { showNotification } = useNotifications();
    const [config, setConfig] = useState(() => {
        // Charger la configuration sauvegardée au démarrage
        const savedConfig = localStorage.getItem('emailjs_config');
        if (savedConfig) {
            try {
                return JSON.parse(savedConfig);
            }
            catch (error) {
                console.error('Erreur lors du chargement de la config EmailJS:', error);
            }
        }
        // Configuration par défaut
        return {
            publicKey: '',
            serviceId: '',
            templates: {
                coachingReservation: '',
                appointmentUpdate: '',
                newMessage: '',
                newProfile: '',
                newApplication: '',
                newRecommendation: '',
                newJobPosting: ''
            }
        };
    });
    const [isTesting, setIsTesting] = useState(false);
    const handleSave = () => {
        // Sauvegarder la configuration (vous pouvez l'ajouter à votre base de données)
        localStorage.setItem('emailjs_config', JSON.stringify(config));
        showNotification({
            type: 'success',
            title: 'Configuration sauvegardée',
            message: 'Vos paramètres EmailJS ont été sauvegardés.'
        });
        onConfigSave?.();
        onClose();
    };
    const handleTest = async () => {
        setIsTesting(true);
        try {
            const result = await emailNotificationService.testConfiguration();
            if (result.success) {
                showNotification({
                    type: 'success',
                    title: 'Test réussi',
                    message: 'La configuration EmailJS fonctionne correctement.'
                });
            }
            else {
                showNotification({
                    type: 'error',
                    title: 'Test échoué',
                    message: result.error || 'Erreur lors du test EmailJS.'
                });
            }
        }
        catch (error) {
            showNotification({
                type: 'error',
                title: 'Erreur',
                message: 'Erreur lors du test de configuration.'
            });
        }
        finally {
            setIsTesting(false);
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
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000
        }, children: _jsxs("div", { style: {
                backgroundColor: '#111',
                borderRadius: 4,
                padding: 24,
                width: '90%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflow: 'auto'
            }, children: [_jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 24,
                        paddingBottom: 16,
                        borderBottom: 'none'
                    }, children: [_jsx("h2", { style: { color: '#ffcc00', margin: 0 }, children: "Configuration EmailJS" }), _jsx("button", { onClick: onClose, style: {
                                backgroundColor: 'transparent',
                                color: '#f5f5f7',
                                border: 'none',
                                borderRadius: 4,
                                padding: '8px 16px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }, children: "Fermer" })] }), _jsxs("div", { style: { marginBottom: 20 }, children: [_jsx("label", { style: { color: '#f5f5f7', display: 'block', marginBottom: 8 }, children: "Public Key EmailJS *" }), _jsx("input", { type: "text", value: config.publicKey, onChange: (e) => setConfig({ ...config, publicKey: e.target.value }), placeholder: "Votre Public Key EmailJS", style: {
                                width: '100%',
                                padding: 12,
                                backgroundColor: '#333',
                                color: '#f5f5f7',
                                border: 'none',
                                borderRadius: 4,
                                fontSize: '14px'
                            } })] }), _jsxs("div", { style: { marginBottom: 20 }, children: [_jsx("label", { style: { color: '#f5f5f7', display: 'block', marginBottom: 8 }, children: "Service ID *" }), _jsx("input", { type: "text", value: config.serviceId, onChange: (e) => setConfig({ ...config, serviceId: e.target.value }), placeholder: "Votre Service ID EmailJS", style: {
                                width: '100%',
                                padding: 12,
                                backgroundColor: '#333',
                                color: '#f5f5f7',
                                border: 'none',
                                borderRadius: 4,
                                fontSize: '14px'
                            } })] }), _jsx("h3", { style: { color: '#ffcc00', marginBottom: 16 }, children: "Templates EmailJS" }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { color: '#f5f5f7', display: 'block', marginBottom: 8 }, children: "Template - R\u00E9servation Coaching" }), _jsx("input", { type: "text", value: config.templates.coachingReservation, onChange: (e) => setConfig({
                                ...config,
                                templates: { ...config.templates, coachingReservation: e.target.value }
                            }), placeholder: "Template ID pour r\u00E9servations", style: {
                                width: '100%',
                                padding: 12,
                                backgroundColor: '#333',
                                color: '#f5f5f7',
                                border: 'none',
                                borderRadius: 4,
                                fontSize: '14px'
                            } })] }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { color: '#f5f5f7', display: 'block', marginBottom: 8 }, children: "Template - Mise \u00E0 jour Rendez-vous" }), _jsx("input", { type: "text", value: config.templates.appointmentUpdate, onChange: (e) => setConfig({
                                ...config,
                                templates: { ...config.templates, appointmentUpdate: e.target.value }
                            }), placeholder: "Template ID pour mises \u00E0 jour", style: {
                                width: '100%',
                                padding: 12,
                                backgroundColor: '#333',
                                color: '#f5f5f7',
                                border: 'none',
                                borderRadius: 4,
                                fontSize: '14px'
                            } })] }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { color: '#f5f5f7', display: 'block', marginBottom: 8 }, children: "Template - Nouveau Message" }), _jsx("input", { type: "text", value: config.templates.newMessage, onChange: (e) => setConfig({
                                ...config,
                                templates: { ...config.templates, newMessage: e.target.value }
                            }), placeholder: "Template ID pour nouveaux messages", style: {
                                width: '100%',
                                padding: 12,
                                backgroundColor: '#333',
                                color: '#f5f5f7',
                                border: 'none',
                                borderRadius: 4,
                                fontSize: '14px'
                            } })] }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { color: '#f5f5f7', display: 'block', marginBottom: 8 }, children: "Template - Nouveau Profil" }), _jsx("input", { type: "text", value: config.templates.newProfile, onChange: (e) => setConfig({
                                ...config,
                                templates: { ...config.templates, newProfile: e.target.value }
                            }), placeholder: "Template ID pour nouveaux profils", style: {
                                width: '100%',
                                padding: 12,
                                backgroundColor: '#333',
                                color: '#f5f5f7',
                                border: 'none',
                                borderRadius: 4,
                                fontSize: '14px'
                            } })] }), _jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("label", { style: { color: '#f5f5f7', display: 'block', marginBottom: 8 }, children: "Template - Nouvelle Candidature" }), _jsx("input", { type: "text", value: config.templates.newApplication, onChange: (e) => setConfig({
                                ...config,
                                templates: { ...config.templates, newApplication: e.target.value }
                            }), placeholder: "Template ID pour nouvelles candidatures", style: {
                                width: '100%',
                                padding: 12,
                                backgroundColor: '#333',
                                color: '#f5f5f7',
                                border: 'none',
                                borderRadius: 4,
                                fontSize: '14px'
                            } })] }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { color: '#f5f5f7', display: 'block', marginBottom: 8 }, children: "Template - Nouvelle Recommandation" }), _jsx("input", { type: "text", value: config.templates.newRecommendation, onChange: (e) => setConfig({
                                ...config,
                                templates: { ...config.templates, newRecommendation: e.target.value }
                            }), placeholder: "Template ID pour nouvelles recommandations", style: {
                                width: '100%',
                                padding: 12,
                                backgroundColor: '#333',
                                color: '#f5f5f7',
                                border: 'none',
                                borderRadius: 4,
                                fontSize: '14px'
                            } })] }), _jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("label", { style: { color: '#f5f5f7', display: 'block', marginBottom: 8 }, children: "Template - Nouvelle Offre d'Emploi" }), _jsx("input", { type: "text", value: config.templates.newJobPosting, onChange: (e) => setConfig({
                                ...config,
                                templates: { ...config.templates, newJobPosting: e.target.value }
                            }), placeholder: "Template ID pour nouvelles offres d'emploi", style: {
                                width: '100%',
                                padding: 12,
                                backgroundColor: '#333',
                                color: '#f5f5f7',
                                border: 'none',
                                borderRadius: 4,
                                fontSize: '14px'
                            } })] }), _jsxs("div", { style: {
                        backgroundColor: '#1a1a1a',
                        padding: 16,
                        borderRadius: 4,
                        border: 'none',
                        marginBottom: 24
                    }, children: [_jsx("h4", { style: { color: '#ffcc00', margin: '0 0 8px 0' }, children: "Instructions :" }), _jsxs("ul", { style: { color: '#f5f5f7', margin: 0, paddingLeft: 20 }, children: [_jsxs("li", { children: ["Cr\u00E9ez un compte sur ", _jsx("a", { href: "https://www.emailjs.com", target: "_blank", rel: "noopener noreferrer", style: { color: '#ffcc00' }, children: "EmailJS.com" })] }), _jsx("li", { children: "Configurez un service email (Gmail, Outlook, etc.)" }), _jsx("li", { children: "Cr\u00E9ez 5 templates pour les diff\u00E9rents types de notifications" }), _jsx("li", { children: "Copiez vos IDs dans les champs ci-dessus" }), _jsx("li", { children: "Testez la configuration avant de sauvegarder" })] })] }), _jsxs("div", { style: { display: 'flex', gap: 12, justifyContent: 'flex-end' }, children: [_jsx("button", { onClick: handleTest, disabled: isTesting, style: {
                                padding: '12px 24px',
                                backgroundColor: '#61bfac',
                                color: '#000',
                                border: 'none',
                                borderRadius: 4,
                                cursor: isTesting ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: 'bold'
                            }, children: isTesting ? 'Test en cours...' : 'Tester' }), _jsx("button", { onClick: handleSave, style: {
                                padding: '12px 24px',
                                backgroundColor: '#ffcc00',
                                color: '#000',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 'bold'
                            }, children: "Sauvegarder" })] })] }) }));
};
export default EmailJSConfig;
