import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { FirestoreService } from '../services/firestoreService';
import { useNotifications } from './NotificationManager';
const ContactModal = ({ isOpen, onClose, talentName, talentEmail, talentId, fromUserProfile }) => {
    const { showNotification } = useNotifications();
    const [contactMethod, setContactMethod] = useState('message');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Envoyer le message via Firestore
            const success = await FirestoreService.sendMessage(fromUserProfile.id, talentId, subject, message, fromUserProfile);
            if (success) {
                showNotification({
                    type: 'success',
                    title: 'Message envoyé',
                    message: `Votre message a été envoyé avec succès à ${talentName}`
                });
                onClose();
            }
            else {
                showNotification({
                    type: 'error',
                    title: 'Erreur d\'envoi',
                    message: 'Erreur lors de l\'envoi du message'
                });
            }
        }
        catch (error) {
            console.error('Erreur lors de l\'envoi:', error);
            showNotification({
                type: 'error',
                title: 'Erreur',
                message: 'Erreur lors de l\'envoi du message'
            });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleEmailContact = () => {
        const mailtoLink = `mailto:${talentEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        window.open(mailtoLink, '_blank');
    };
    if (!isOpen)
        return null;
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
            zIndex: 1000
        }, children: _jsxs("div", { style: {
                backgroundColor: '#111',
                borderRadius: 4,
                padding: 24,
                maxWidth: 500,
                width: '90%',
                maxHeight: '90vh',
                overflow: 'auto',
                border: '1px solid #333'
            }, children: [_jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 20
                    }, children: [_jsxs("h2", { style: { color: '#ffcc00', margin: 0 }, children: ["Contacter ", talentName] }), _jsx("button", { onClick: onClose, style: {
                                background: 'none',
                                border: 'none',
                                color: '#888',
                                fontSize: 24,
                                cursor: 'pointer',
                                padding: 0
                            }, children: "\u00D7" })] }), _jsxs("div", { style: { marginBottom: 20 }, children: [_jsx("h3", { style: { color: '#f5f5f7', marginBottom: 12 }, children: "Contact" }), _jsx("p", { style: { color: '#888', margin: 0 }, children: "Votre message sera envoy\u00E9 via l'application et une notification email sera transmise au talent." })] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: {
                                        display: 'block',
                                        color: '#f5f5f7',
                                        marginBottom: 8,
                                        fontWeight: 'bold'
                                    }, children: "Sujet" }), _jsx("input", { type: "text", value: subject, onChange: (e) => setSubject(e.target.value), placeholder: "Ex: Opportunit\u00E9 de poste d\u00E9veloppeur React", style: {
                                        width: '100%',
                                        padding: 12,
                                        backgroundColor: '#222',
                                        border: '1px solid #333',
                                        borderRadius: 4,
                                        color: '#f5f5f7',
                                        fontSize: 14
                                    }, required: true })] }), _jsxs("div", { style: { marginBottom: 20 }, children: [_jsx("label", { style: {
                                        display: 'block',
                                        color: '#f5f5f7',
                                        marginBottom: 8,
                                        fontWeight: 'bold'
                                    }, children: "Message" }), _jsx("textarea", { value: message, onChange: (e) => setMessage(e.target.value), placeholder: "Bonjour, je suis int\u00E9ress\u00E9 par votre profil...", rows: 6, style: {
                                        width: '100%',
                                        padding: 12,
                                        backgroundColor: '#222',
                                        border: '1px solid #333',
                                        borderRadius: 4,
                                        color: '#f5f5f7',
                                        fontSize: 14,
                                        resize: 'vertical'
                                    }, required: true })] }), _jsxs("div", { style: { display: 'flex', gap: 12, justifyContent: 'flex-end' }, children: [_jsx("button", { type: "button", onClick: onClose, style: {
                                        padding: '10px 20px',
                                        backgroundColor: 'transparent',
                                        color: '#888',
                                        border: '1px solid #333',
                                        borderRadius: 4,
                                        cursor: 'pointer'
                                    }, children: "Annuler" }), _jsx("button", { type: "submit", disabled: isSubmitting, style: {
                                        padding: '10px 20px',
                                        backgroundColor: '#ffcc00',
                                        color: '#000',
                                        border: '1px solid #ffcc00',
                                        borderRadius: 4,
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        fontWeight: 'bold',
                                        opacity: isSubmitting ? 0.6 : 1
                                    }, children: isSubmitting ? 'Envoi...' : 'Envoyer le message' })] })] })] }) }));
};
export default ContactModal;
