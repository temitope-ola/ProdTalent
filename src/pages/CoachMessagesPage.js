import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import { useNotifications } from '../components/NotificationManager';
const CoachMessagesPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotifications();
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    useEffect(() => {
        const loadMessages = async () => {
            if (!user) {
                navigate('/');
                return;
            }
            try {
                setIsLoading(true);
                // Charger les vrais messages depuis Firestore
                const realMessages = await FirestoreService.getUserMessages(user.id);
                // Convertir le format des messages
                const formattedMessages = realMessages.map((msg) => ({
                    id: msg.id,
                    from: msg.from,
                    subject: msg.subject,
                    message: msg.message,
                    timestamp: msg.timestamp,
                    read: msg.read
                }));
                setMessages(formattedMessages);
            }
            catch (error) {
                console.error('Erreur lors du chargement des messages:', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        loadMessages();
    }, [user, navigate]);
    const handleLogout = async () => {
        try {
            await FirestoreService.signOut();
            navigate('/');
        }
        catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    };
    const handleMessageClick = async (message) => {
        setSelectedMessage(message);
        // Marquer comme lu dans Firestore
        if (!message.read) {
            await FirestoreService.markMessageAsRead(message.id);
            setMessages(prev => prev.map(msg => msg.id === message.id ? { ...msg, read: true } : msg));
        }
    };
    const handleReply = (message) => {
        setReplyingTo(message);
        setIsReplyModalOpen(true);
        setReplyContent('');
    };
    const handleSendReply = async () => {
        if (!replyingTo || !replyContent.trim() || !user)
            return;
        try {
            // Envoyer la réponse via FirestoreService
            const success = await FirestoreService.sendMessage(user.id, replyingTo.from.id, `Réponse: ${replyingTo.subject}`, replyContent, {
                id: user.id,
                email: user.email || '',
                role: user.role,
                displayName: user.displayName || user.email?.split('@')[0] || 'Coach'
            });
            if (success) {
                showNotification({
                    type: 'success',
                    title: 'Réponse envoyée',
                    message: 'Votre réponse a été envoyée avec succès'
                });
                setIsReplyModalOpen(false);
                setReplyContent('');
                setReplyingTo(null);
                // Recharger les messages pour afficher la réponse
                const realMessages = await FirestoreService.getUserMessages(user.id);
                const formattedMessages = realMessages.map((msg) => ({
                    id: msg.id,
                    from: msg.from,
                    subject: msg.subject,
                    message: msg.message,
                    timestamp: msg.timestamp,
                    read: msg.read
                }));
                setMessages(formattedMessages);
            }
            else {
                showNotification({
                    type: 'error',
                    title: 'Erreur',
                    message: 'Impossible d\'envoyer la réponse'
                });
            }
        }
        catch (error) {
            console.error('Erreur lors de l\'envoi de la réponse:', error);
            showNotification({
                type: 'error',
                title: 'Erreur',
                message: 'Une erreur est survenue lors de l\'envoi'
            });
        }
    };
    const unreadCount = messages.filter(msg => !msg.read).length;
    if (isLoading) {
        return (_jsx("div", { style: {
                minHeight: '100vh',
                backgroundColor: '#000',
                color: '#f5f5f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }, children: "Chargement des messages..." }));
    }
    return (_jsx("div", { style: {
            minHeight: '100vh',
            backgroundColor: '#0a0a0a',
            color: '#f5f5f7',
            display: 'flex',
            justifyContent: 'center'
        }, children: _jsxs("div", { style: {
                width: '1214px',
                maxWidth: '100%',
                padding: '24px'
            }, children: [_jsxs("header", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingBottom: 16,
                        borderBottom: '1px solid #333',
                        marginBottom: 24
                    }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 16 }, children: [_jsx("button", { onClick: () => navigate('/dashboard/coach'), style: {
                                        padding: '8px 16px',
                                        backgroundColor: 'transparent',
                                        color: '#ffcc00',
                                        border: '1px solid #ffcc00',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        marginTop: '12px'
                                    }, children: "Retour" }), _jsxs("h1", { style: { margin: 0, color: '#ffcc00' }, children: ["Mes Messages ", unreadCount > 0 && `(${unreadCount} non lus)`] })] }), _jsx("button", { onClick: handleLogout, style: {
                                padding: '8px 16px',
                                backgroundColor: '#333',
                                color: '#f5f5f7',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }, children: "Se d\u00E9connecter" })] }), _jsxs("div", { style: { display: 'flex', gap: 24, height: 'calc(100vh - 140px)' }, children: [_jsxs("div", { style: {
                                width: '400px',
                                backgroundColor: '#111',
                                borderRadius: 4,
                                overflow: 'hidden'
                            }, children: [_jsx("div", { style: {
                                        padding: 16,
                                        borderBottom: '1px solid #333',
                                        backgroundColor: '#0a0a0a'
                                    }, children: _jsx("h2", { style: { margin: 0, color: '#ffcc00', fontSize: '18px' }, children: "Bo\u00EEte de r\u00E9ception" }) }), _jsx("div", { style: {
                                        height: 'calc(100% - 60px)',
                                        overflowY: 'auto'
                                    }, children: messages.length === 0 ? (_jsx("div", { style: {
                                            padding: 20,
                                            textAlign: 'center',
                                            color: '#888'
                                        }, children: "Aucun message" })) : (messages.map((message) => (_jsxs("div", { onClick: () => handleMessageClick(message), style: {
                                            padding: 16,
                                            borderBottom: '1px solid #333',
                                            cursor: 'pointer',
                                            backgroundColor: selectedMessage?.id === message.id ? '#222' : 'transparent',
                                            borderLeft: selectedMessage?.id === message.id ? '3px solid #ffcc00' : '3px solid transparent'
                                        }, children: [_jsxs("div", { style: {
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    marginBottom: 8
                                                }, children: [_jsx("h3", { style: {
                                                            color: message.read ? '#888' : '#f5f5f7',
                                                            margin: 0,
                                                            fontSize: '14px',
                                                            fontWeight: message.read ? 'normal' : 'bold'
                                                        }, children: message.subject }), _jsx("span", { style: { color: '#888', fontSize: '12px' }, children: message.timestamp.toLocaleDateString() })] }), _jsxs("p", { style: {
                                                    color: '#888',
                                                    margin: '0 0 8px 0',
                                                    fontSize: '14px'
                                                }, children: ["De: ", message.from.name, " (", message.from.email, ")"] }), _jsx("p", { style: {
                                                    color: '#888',
                                                    margin: 0,
                                                    fontSize: '14px',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }, children: message.message })] }, message.id)))) })] }), selectedMessage && (_jsxs("div", { style: {
                                flex: 1,
                                backgroundColor: '#111',
                                borderRadius: 4,
                                padding: 20
                            }, children: [_jsxs("div", { style: { marginBottom: 20 }, children: [_jsx("h2", { style: { color: '#ffcc00', margin: '0 0 16px 0' }, children: selectedMessage.subject }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsxs("p", { style: { color: '#888', margin: '0 0 4px 0' }, children: [_jsx("strong", { children: "De:" }), " ", selectedMessage.from.name] }), _jsxs("p", { style: { color: '#888', margin: '0 0 4px 0' }, children: [_jsx("strong", { children: "Email:" }), " ", selectedMessage.from.email] }), _jsxs("p", { style: { color: '#888', margin: '0 0 8px 0' }, children: [_jsx("strong", { children: "R\u00F4le:" }), " ", selectedMessage.from.role] }), _jsxs("p", { style: { color: '#888', margin: 0 }, children: [_jsx("strong", { children: "Date:" }), " ", selectedMessage.timestamp.toLocaleString()] })] })] }), _jsx("div", { style: {
                                        backgroundColor: '#222',
                                        padding: 16,
                                        borderRadius: 4,
                                        marginBottom: 20
                                    }, children: _jsx("p", { style: {
                                            color: '#f5f5f7',
                                            margin: 0,
                                            lineHeight: '1.6',
                                            whiteSpace: 'pre-wrap'
                                        }, children: selectedMessage.message }) }), _jsx("div", { style: { display: 'flex', gap: 12 }, children: _jsx("button", { onClick: () => handleReply(selectedMessage), style: {
                                            padding: '10px 20px',
                                            backgroundColor: '#ffcc00',
                                            color: '#000',
                                            border: '1px solid #ffcc00',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }, children: "R\u00E9pondre" }) })] }))] }), isReplyModalOpen && replyingTo && (_jsx("div", { style: {
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
                            width: '500px',
                            maxWidth: '90%',
                            maxHeight: '80%',
                            overflow: 'auto'
                        }, children: [_jsxs("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 20
                                }, children: [_jsxs("h3", { style: { color: '#ffcc00', margin: 0 }, children: ["R\u00E9pondre \u00E0 ", replyingTo.from.name] }), _jsx("button", { onClick: () => {
                                            setIsReplyModalOpen(false);
                                            setReplyContent('');
                                            setReplyingTo(null);
                                        }, style: {
                                            background: 'none',
                                            border: 'none',
                                            color: '#888',
                                            fontSize: '20px',
                                            cursor: 'pointer'
                                        }, children: "\u00D7" })] }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsxs("p", { style: { color: '#888', margin: '0 0 8px 0' }, children: [_jsx("strong", { children: "\u00C0:" }), " ", replyingTo.from.name, " (", replyingTo.from.email, ")"] }), _jsxs("p", { style: { color: '#888', margin: '0 0 16px 0' }, children: [_jsx("strong", { children: "Sujet:" }), " R\u00E9ponse: ", replyingTo.subject] })] }), _jsxs("div", { style: { marginBottom: 20 }, children: [_jsx("label", { style: {
                                            display: 'block',
                                            color: '#f5f5f7',
                                            marginBottom: 8,
                                            fontWeight: 'bold'
                                        }, children: "Votre r\u00E9ponse:" }), _jsx("textarea", { value: replyContent, onChange: (e) => setReplyContent(e.target.value), style: {
                                            width: '100%',
                                            minHeight: '120px',
                                            padding: 12,
                                            backgroundColor: '#222',
                                            color: '#f5f5f7',
                                            border: 'none',
                                            borderRadius: 4,
                                            resize: 'vertical',
                                            fontFamily: 'inherit'
                                        }, placeholder: "Tapez votre r\u00E9ponse ici..." })] }), _jsxs("div", { style: { display: 'flex', gap: 12, justifyContent: 'flex-end' }, children: [_jsx("button", { onClick: () => {
                                            setIsReplyModalOpen(false);
                                            setReplyContent('');
                                            setReplyingTo(null);
                                        }, style: {
                                            padding: '10px 20px',
                                            backgroundColor: 'transparent',
                                            color: '#888',
                                            border: '1px solid #888',
                                            borderRadius: 4,
                                            cursor: 'pointer'
                                        }, children: "Annuler" }), _jsx("button", { onClick: handleSendReply, disabled: !replyContent.trim(), style: {
                                            padding: '10px 20px',
                                            backgroundColor: replyContent.trim() ? '#ffcc00' : '#333',
                                            color: replyContent.trim() ? '#000' : '#888',
                                            border: '1px solid #ffcc00',
                                            borderRadius: 4,
                                            cursor: replyContent.trim() ? 'pointer' : 'not-allowed',
                                            fontWeight: 'bold'
                                        }, children: "Envoyer" })] })] }) }))] }) }));
};
export default CoachMessagesPage;
