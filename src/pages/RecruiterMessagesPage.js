import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import { useNotifications } from '../components/NotificationManager';
const RecruiterMessagesPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showNotification } = useNotifications();
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [recipientRole, setRecipientRole] = useState('talent');
    const [isComposing, setIsComposing] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (user) {
            loadMessages();
        }
    }, [user]);
    const loadMessages = async () => {
        if (!user)
            return;
        try {
            setLoading(true);
            const messagesData = await FirestoreService.getUserMessages(user.id);
            setMessages(messagesData);
        }
        catch (error) {
            console.error('Erreur lors du chargement des messages:', error);
            showNotification({
                type: 'error',
                title: 'Erreur',
                message: 'Impossible de charger les messages'
            });
        }
        finally {
            setLoading(false);
        }
    };
    const sendMessage = async () => {
        if (!user || !newMessage.trim() || !recipientEmail.trim()) {
            showNotification({
                type: 'error',
                title: 'Erreur',
                message: 'Veuillez remplir tous les champs'
            });
            return;
        }
        try {
            // Récupérer l'ID du destinataire par son email
            const recipientProfile = await FirestoreService.getProfileById(recipientEmail);
            if (!recipientProfile) {
                showNotification({
                    type: 'error',
                    title: 'Erreur',
                    message: 'Destinataire non trouvé'
                });
                return;
            }
            const success = await FirestoreService.sendMessage(user.id, recipientProfile.id, `Message de ${user.displayName || user.email?.split('@')[0] || 'Recruteur'}`, newMessage.trim(), {
                id: user.id,
                email: user.email || '',
                role: user.role,
                displayName: user.displayName || user.email?.split('@')[0] || 'Recruteur'
            });
            if (success) {
                setNewMessage('');
                setRecipientEmail('');
                setIsComposing(false);
                await loadMessages();
                showNotification({
                    type: 'success',
                    title: 'Succès',
                    message: 'Message envoyé avec succès'
                });
            }
            else {
                showNotification({
                    type: 'error',
                    title: 'Erreur',
                    message: 'Impossible d\'envoyer le message'
                });
            }
        }
        catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            showNotification({
                type: 'error',
                title: 'Erreur',
                message: 'Impossible d\'envoyer le message'
            });
        }
    };
    const markAsRead = async (messageId) => {
        try {
            await FirestoreService.markMessageAsRead(messageId);
            await loadMessages();
        }
        catch (error) {
            console.error('Erreur lors du marquage comme lu:', error);
        }
    };
    const formatDate = (date) => {
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };
    const getUnreadCount = () => {
        return messages.filter(msg => !msg.read).length;
    };
    if (loading) {
        return (_jsx("div", { style: {
                minHeight: '100vh',
                backgroundColor: '#0a0a0a',
                color: '#f5f5f7',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }, children: _jsx("div", { children: "Chargement des messages..." }) }));
    }
    return (_jsx("div", { style: {
            minHeight: '100vh',
            backgroundColor: '#0a0a0a',
            color: '#f5f5f7',
            padding: '24px'
        }, children: _jsxs("div", { style: {
                maxWidth: '1200px',
                margin: '0 auto'
            }, children: [_jsxs("header", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px',
                        paddingBottom: '16px',
                        borderBottom: '1px solid #333'
                    }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '16px' }, children: [_jsx("button", { onClick: () => navigate('/dashboard/recruteur'), style: {
                                        padding: '8px 16px',
                                        backgroundColor: 'transparent',
                                        color: '#f5f5f7',
                                        border: '0.5px solid #f5f5f7',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }, children: "\u2190 Retour" }), _jsxs("div", { children: [_jsx("h1", { style: { color: '#ffcc00', margin: 0 }, children: "Messages" }), _jsxs("p", { style: { margin: '8px 0 0 0', color: '#999' }, children: [getUnreadCount(), " message", getUnreadCount() > 1 ? 's' : '', " non lu", getUnreadCount() > 1 ? 's' : ''] })] })] }), _jsx("button", { onClick: () => setIsComposing(true), style: {
                                padding: '12px 24px',
                                backgroundColor: '#ffcc00',
                                color: '#000',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }, children: "Nouveau message" })] }), _jsxs("div", { style: {
                        display: 'grid',
                        gridTemplateColumns: '1fr 2fr',
                        gap: '24px',
                        height: 'calc(100vh - 200px)'
                    }, children: [_jsxs("div", { style: {
                                backgroundColor: '#111',
                                borderRadius: '4px',
                                padding: '16px',
                                overflowY: 'auto'
                            }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, marginBottom: '16px' }, children: "Conversations" }), messages.length === 0 ? (_jsx("p", { style: { color: '#999', textAlign: 'center' }, children: "Aucun message" })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: messages.map((message) => (_jsxs("div", { onClick: () => {
                                            setSelectedMessage(message);
                                            if (!message.read) {
                                                markAsRead(message.id);
                                            }
                                        }, style: {
                                            padding: '12px',
                                            backgroundColor: message.read ? 'transparent' : '#333',
                                            border: '1px solid #333',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s'
                                        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("strong", { style: { color: message.read ? '#f5f5f7' : '#ffcc00' }, children: message.from.name }), !message.read && (_jsx("div", { style: {
                                                            width: '8px',
                                                            height: '8px',
                                                            backgroundColor: '#ffcc00',
                                                            borderRadius: '50%'
                                                        } }))] }), _jsx("p", { style: {
                                                    color: '#999',
                                                    fontSize: '14px',
                                                    margin: '4px 0 0 0',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }, children: message.message }), _jsx("small", { style: { color: '#666', fontSize: '12px' }, children: formatDate(message.timestamp) })] }, message.id))) }))] }), _jsx("div", { style: {
                                backgroundColor: '#111',
                                borderRadius: '4px',
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column'
                            }, children: isComposing ? (_jsxs("div", { style: { flex: 1, display: 'flex', flexDirection: 'column' }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, marginBottom: '16px' }, children: "Nouveau message" }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#f5f5f7' }, children: "Destinataire (email)" }), _jsx("input", { type: "email", value: recipientEmail, onChange: (e) => setRecipientEmail(e.target.value), style: {
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    backgroundColor: '#333',
                                                    color: '#f5f5f7',
                                                    border: 'none',
                                                    borderRadius: '4px'
                                                }, placeholder: "email@exemple.com" })] }), _jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#f5f5f7' }, children: "Type de destinataire" }), _jsxs("select", { value: recipientRole, onChange: (e) => setRecipientRole(e.target.value), style: {
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    backgroundColor: '#333',
                                                    color: '#f5f5f7',
                                                    border: 'none',
                                                    borderRadius: '4px'
                                                }, children: [_jsx("option", { value: "talent", children: "Talent" }), _jsx("option", { value: "coach", children: "Coach" })] })] }), _jsxs("div", { style: { marginBottom: '16px', flex: 1 }, children: [_jsx("label", { style: { display: 'block', marginBottom: '8px', color: '#f5f5f7' }, children: "Message" }), _jsx("textarea", { value: newMessage, onChange: (e) => setNewMessage(e.target.value), style: {
                                                    width: '100%',
                                                    height: '200px',
                                                    padding: '8px 12px',
                                                    backgroundColor: '#333',
                                                    color: '#f5f5f7',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    resize: 'vertical'
                                                }, placeholder: "Votre message..." })] }), _jsxs("div", { style: { display: 'flex', gap: '12px' }, children: [_jsx("button", { onClick: sendMessage, style: {
                                                    padding: '12px 24px',
                                                    backgroundColor: '#ffcc00',
                                                    color: '#000',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold'
                                                }, children: "Envoyer" }), _jsx("button", { onClick: () => {
                                                    setIsComposing(false);
                                                    setNewMessage('');
                                                    setRecipientEmail('');
                                                }, style: {
                                                    padding: '12px 24px',
                                                    backgroundColor: 'transparent',
                                                    color: '#f5f5f7',
                                                    border: '1px solid #555',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }, children: "Annuler" })] })] })) : selectedMessage ? (_jsxs("div", { style: { flex: 1, display: 'flex', flexDirection: 'column' }, children: [_jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, marginBottom: '8px' }, children: selectedMessage.from.name }), _jsx("p", { style: { color: '#999', margin: 0 }, children: formatDate(selectedMessage.timestamp) })] }), _jsx("div", { style: {
                                            flex: 1,
                                            padding: '16px',
                                            backgroundColor: '#333',
                                            borderRadius: '4px',
                                            marginBottom: '16px'
                                        }, children: _jsx("p", { style: { margin: 0, lineHeight: '1.6' }, children: selectedMessage.message }) }), _jsx("button", { onClick: () => setIsComposing(true), style: {
                                            padding: '12px 24px',
                                            backgroundColor: '#ffcc00',
                                            color: '#000',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            alignSelf: 'flex-start'
                                        }, children: "R\u00E9pondre" })] })) : (_jsx("div", { style: {
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#999'
                                }, children: _jsx("p", { children: "S\u00E9lectionnez un message pour le lire" }) })) })] })] }) }));
};
export default RecruiterMessagesPage;
