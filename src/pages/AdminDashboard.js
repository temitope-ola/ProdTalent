import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmailJSConfig from '../components/EmailJSConfig';
import FeaturedTalentsManager from '../components/FeaturedTalentsManager';
import { useNotifications } from '../components/NotificationManager';
import emailNotificationService from '../services/emailNotificationService';
export default function AdminDashboard() {
    const navigate = useNavigate();
    const { showNotification } = useNotifications();
    const [activeSection, setActiveSection] = useState('overview');
    const [isEmailJSConfigOpen, setIsEmailJSConfigOpen] = useState(false);
    const [emailJSConfigured, setEmailJSConfigured] = useState(false);
    // Check EmailJS configuration status
    React.useEffect(() => {
        const checkEmailJSConfig = () => {
            const savedConfig = localStorage.getItem('emailjs_config');
            if (savedConfig) {
                try {
                    const config = JSON.parse(savedConfig);
                    const isConfigured = config.publicKey && config.serviceId;
                    setEmailJSConfigured(isConfigured);
                }
                catch {
                    setEmailJSConfigured(false);
                }
            }
            else {
                setEmailJSConfigured(false);
            }
        };
        checkEmailJSConfig();
        window.addEventListener('storage', checkEmailJSConfig);
        return () => window.removeEventListener('storage', checkEmailJSConfig);
    }, []);
    const handleLogout = () => {
        // Simple logout - just redirect to home
        navigate('/');
    };
    const handleDiagnose = async () => {
        try {
            const diagnosis = await emailNotificationService.diagnoseConfiguration();
            let message = '🔍 Diagnostic de la configuration EmailJS:\n\n';
            message += `📍 Public Key: ${diagnosis.publicKey ? '✅ Configurée' : '❌ Manquante'}\n`;
            message += `📍 Service ID: ${diagnosis.serviceId ? '✅ Configuré' : '❌ Manquant'}\n`;
            message += `📍 Template disponible: ${diagnosis.availableTemplate ? '✅ ' + diagnosis.availableTemplate : '❌ Aucun'}\n\n`;
            message += '📋 Templates configurés:\n';
            Object.entries(diagnosis.templates).forEach(([key, value]) => {
                message += `  • ${key}: ${value ? '✅' : '❌'}\n`;
            });
            if (!diagnosis.publicKey || !diagnosis.serviceId || !diagnosis.availableTemplate) {
                message += '\n⚠️ Configuration incomplète détectée!';
            }
            else {
                message += '\n✅ Configuration semble correcte. Testez maintenant!';
            }
            // Log pour debug
            console.log('📊 Diagnostic EmailJS:', diagnosis);
            showNotification({
                type: diagnosis.publicKey && diagnosis.serviceId && diagnosis.availableTemplate ? 'success' : 'warning',
                title: 'Diagnostic de configuration',
                message: message
            });
        }
        catch (error) {
            console.error('❌ Erreur lors du diagnostic:', error);
            showNotification({
                type: 'error',
                title: 'Erreur de diagnostic',
                message: 'Impossible d\'effectuer le diagnostic'
            });
        }
    };
    const menuItems = [
        { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
        { id: 'email', label: 'Configuration Email', icon: '📧' },
        { id: 'featured', label: 'Talents Mis en Avant', icon: '⭐' },
    ];
    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return (_jsxs("div", { children: [_jsx("h2", { style: { color: '#ffcc00', marginBottom: '24px' }, children: "Vue d'ensemble" }), _jsxs("div", { style: {
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '20px',
                                marginBottom: '32px'
                            }, children: [_jsxs("div", { style: {
                                        backgroundColor: '#1a1a1a',
                                        padding: '24px',
                                        borderRadius: '8px',
                                        border: emailJSConfigured ? '1px solid #61bfac' : '1px solid #ff6b6b'
                                    }, children: [_jsxs("div", { style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                marginBottom: '12px'
                                            }, children: [_jsx("span", { style: { fontSize: '24px' }, children: "\uD83D\uDCE7" }), _jsx("h3", { style: { color: '#f5f5f7', margin: 0 }, children: "Notifications Email" })] }), _jsx("p", { style: {
                                                color: emailJSConfigured ? '#61bfac' : '#ff6b6b',
                                                margin: '8px 0',
                                                fontWeight: 'bold'
                                            }, children: emailJSConfigured ? '✅ Configuré' : '❌ Non configuré' }), _jsx("p", { style: { color: '#888', margin: 0, fontSize: '14px' }, children: emailJSConfigured
                                                ? 'Les notifications email sont actives'
                                                : 'Configurez EmailJS pour activer les notifications' })] }), _jsxs("div", { style: {
                                        backgroundColor: '#1a1a1a',
                                        padding: '24px',
                                        borderRadius: '8px',
                                        border: '1px solid #333'
                                    }, children: [_jsxs("div", { style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                marginBottom: '12px'
                                            }, children: [_jsx("span", { style: { fontSize: '24px' }, children: "\u2B50" }), _jsx("h3", { style: { color: '#f5f5f7', margin: 0 }, children: "Talents Mis en Avant" })] }), _jsx("p", { style: { color: '#ffcc00', margin: '8px 0', fontWeight: 'bold' }, children: "\u2705 Disponible" }), _jsx("p", { style: { color: '#888', margin: 0, fontSize: '14px' }, children: "G\u00E9rez les talents mis en avant sur la page d'accueil" })] })] }), _jsxs("div", { children: [_jsx("h3", { style: { color: '#f5f5f7', marginBottom: '16px' }, children: "Actions Rapides" }), _jsxs("div", { style: {
                                        display: 'flex',
                                        gap: '16px',
                                        flexWrap: 'wrap'
                                    }, children: [_jsx("button", { onClick: () => setActiveSection('email'), style: {
                                                padding: '12px 24px',
                                                backgroundColor: emailJSConfigured ? '#333' : '#ffcc00',
                                                color: emailJSConfigured ? '#f5f5f7' : '#000',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                                transition: 'all 0.2s ease'
                                            }, children: emailJSConfigured ? '⚙️ Modifier Config Email' : '📧 Configurer Email' }), _jsx("button", { onClick: () => setActiveSection('featured'), style: {
                                                padding: '12px 24px',
                                                backgroundColor: '#333',
                                                color: '#f5f5f7',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: 'bold'
                                            }, children: "\u2B50 G\u00E9rer les Talents" })] })] })] }));
            case 'email':
                return (_jsxs("div", { children: [_jsxs("div", { style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '24px'
                            }, children: [_jsx("h2", { style: { color: '#ffcc00', margin: 0 }, children: "Configuration Email" }), _jsxs("div", { style: { display: 'flex', gap: '12px' }, children: [_jsx("button", { onClick: () => setIsEmailJSConfigOpen(true), style: {
                                                padding: '10px 20px',
                                                backgroundColor: '#ffcc00',
                                                color: '#000',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: 'bold'
                                            }, children: emailJSConfigured ? 'Modifier Configuration' : 'Configurer EmailJS' }), _jsx("button", { onClick: handleDiagnose, style: {
                                                padding: '10px 20px',
                                                backgroundColor: '#333',
                                                color: '#f5f5f7',
                                                border: '1px solid #555',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: 'bold'
                                            }, children: "\uD83D\uDD0D Diagnostiquer" })] })] }), _jsxs("div", { style: {
                                backgroundColor: '#1a1a1a',
                                padding: '24px',
                                borderRadius: '8px',
                                marginBottom: '24px'
                            }, children: [_jsx("h3", { style: { color: '#f5f5f7', marginBottom: '16px' }, children: "\u00C9tat de la configuration" }), _jsxs("div", { style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        marginBottom: '16px'
                                    }, children: [_jsx("div", { style: {
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                backgroundColor: emailJSConfigured ? '#61bfac' : '#ff6b6b'
                                            } }), _jsx("span", { style: { color: '#f5f5f7' }, children: emailJSConfigured ? 'EmailJS configuré et prêt' : 'EmailJS non configuré' })] }), _jsx("p", { style: { color: '#888', margin: 0, fontSize: '14px', lineHeight: '1.5' }, children: emailJSConfigured
                                        ? 'Les notifications par email sont actives. Les utilisateurs recevront des emails pour les nouveaux messages, recommandations et offres d\'emploi.'
                                        : 'Configurez EmailJS pour activer les notifications automatiques par email. Cela permettra d\'envoyer des emails pour les nouveaux messages, recommandations et offres d\'emploi.' })] }), _jsxs("div", { style: {
                                backgroundColor: '#1a1a1a',
                                padding: '24px',
                                borderRadius: '8px',
                                marginBottom: '24px'
                            }, children: [_jsx("h3", { style: { color: '#f5f5f7', marginBottom: '16px' }, children: "Types de notifications email" }), _jsxs("div", { style: { display: 'grid', gap: '16px' }, children: [_jsxs("div", { style: { display: 'flex', gap: '12px', alignItems: 'flex-start' }, children: [_jsx("span", { style: { fontSize: '20px' }, children: "\uD83D\uDCAC" }), _jsxs("div", { children: [_jsx("strong", { style: { color: '#ffcc00' }, children: "Messages" }), _jsx("p", { style: { color: '#888', margin: '4px 0 0 0', fontSize: '14px' }, children: "Notification envoy\u00E9e quand quelqu'un re\u00E7oit un nouveau message" })] })] }), _jsxs("div", { style: { display: 'flex', gap: '12px', alignItems: 'flex-start' }, children: [_jsx("span", { style: { fontSize: '20px' }, children: "\uD83E\uDD1D" }), _jsxs("div", { children: [_jsx("strong", { style: { color: '#ffcc00' }, children: "Recommandations" }), _jsx("p", { style: { color: '#888', margin: '4px 0 0 0', fontSize: '14px' }, children: "Notification envoy\u00E9e au talent et au recruteur lors d'une nouvelle recommandation" })] })] }), _jsxs("div", { style: { display: 'flex', gap: '12px', alignItems: 'flex-start' }, children: [_jsx("span", { style: { fontSize: '20px' }, children: "\uD83D\uDCBC" }), _jsxs("div", { children: [_jsx("strong", { style: { color: '#ffcc00' }, children: "Offres d'emploi" }), _jsx("p", { style: { color: '#888', margin: '4px 0 0 0', fontSize: '14px' }, children: "Notification envoy\u00E9e \u00E0 tous les talents quand une nouvelle offre est publi\u00E9e" })] })] })] })] }), _jsxs("div", { style: {
                                backgroundColor: '#1a1a1a',
                                padding: '24px',
                                borderRadius: '8px'
                            }, children: [_jsx("h3", { style: { color: '#f5f5f7', marginBottom: '16px' }, children: "\uD83D\uDD27 Guide de d\u00E9pannage" }), _jsxs("div", { style: { display: 'grid', gap: '16px' }, children: [_jsxs("div", { children: [_jsx("h4", { style: { color: '#ffcc00', margin: '0 0 8px 0', fontSize: '16px' }, children: "\u274C Le test \u00E9choue ?" }), _jsxs("ul", { style: { color: '#888', margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }, children: [_jsxs("li", { children: [_jsx("strong", { children: "V\u00E9rifiez vos cl\u00E9s :" }), " Public Key, Service ID et Template ID corrects"] }), _jsxs("li", { children: [_jsx("strong", { children: "Template manquant :" }), " Cr\u00E9ez au moins un template dans EmailJS"] }), _jsxs("li", { children: [_jsx("strong", { children: "Variables du template :" }), " Utilisez ", '{', "to_email", '}', ", ", '{', "to_name", '}', ", ", '{', "subject", '}', ", ", '{', "message", '}'] }), _jsxs("li", { children: [_jsx("strong", { children: "Domaine autoris\u00E9 :" }), " Ajoutez localhost:5173 dans EmailJS Settings"] }), _jsxs("li", { children: [_jsx("strong", { children: "Quota d\u00E9pass\u00E9 :" }), " V\u00E9rifiez vos limites mensuelles EmailJS"] })] })] }), _jsxs("div", { children: [_jsx("h4", { style: { color: '#ffcc00', margin: '0 0 8px 0', fontSize: '16px' }, children: "\uD83D\uDD11 O\u00F9 trouver vos cl\u00E9s ?" }), _jsxs("ol", { style: { color: '#888', margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }, children: [_jsxs("li", { children: ["Allez sur ", _jsx("a", { href: "https://dashboard.emailjs.com", target: "_blank", style: { color: '#ffcc00' }, children: "EmailJS Dashboard" })] }), _jsxs("li", { children: [_jsx("strong", { children: "Public Key :" }), " Account ", '>', " General"] }), _jsxs("li", { children: [_jsx("strong", { children: "Service ID :" }), " Email Services ", '>', " votre service"] }), _jsxs("li", { children: [_jsx("strong", { children: "Template ID :" }), " Email Templates ", '>', " votre template"] })] })] }), _jsxs("div", { children: [_jsx("h4", { style: { color: '#ffcc00', margin: '0 0 8px 0', fontSize: '16px' }, children: "\uD83D\uDCDD Variables de template recommand\u00E9es" }), _jsxs("div", { style: {
                                                        backgroundColor: '#333',
                                                        padding: '12px',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        fontFamily: 'monospace',
                                                        color: '#f5f5f7'
                                                    }, children: ['{', "to_email", '}', ", ", '{', "to_name", '}', ", ", '{', "subject", '}', ", ", '{', "message", '}', _jsx("br", {}), '{', "coach_name", '}', ", ", '{', "talent_name", '}', ", ", '{', "recruiter_name", '}', _jsx("br", {}), '{', "job_title", '}', ", ", '{', "company_name", '}', ", ", '{', "recommendation_message", '}'] })] })] })] })] }));
            case 'featured':
                return (_jsxs("div", { children: [_jsx("h2", { style: { color: '#ffcc00', marginBottom: '24px' }, children: "Talents Mis en Avant" }), _jsx(FeaturedTalentsManager, {})] }));
            default:
                return _jsx("div", { children: "Section non trouv\u00E9e" });
        }
    };
    return (_jsxs("div", { style: {
            minHeight: '100vh',
            backgroundColor: '#0a0a0a',
            color: '#f5f5f7'
        }, children: [_jsxs("header", { style: {
                    padding: '16px 24px',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }, children: [_jsxs("div", { children: [_jsx("h1", { style: { margin: 0, fontSize: '24px', fontWeight: '600', color: '#ffcc00' }, children: "ProdTalent Admin" }), _jsx("p", { style: { margin: 0, color: '#888', fontSize: '14px' }, children: "Panneau d'administration" })] }), _jsx("button", { onClick: handleLogout, style: {
                            padding: '8px 16px',
                            backgroundColor: 'transparent',
                            color: '#f5f5f7',
                            border: '1px solid #333',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }, children: "Se d\u00E9connecter" })] }), _jsxs("div", { style: { display: 'flex' }, children: [_jsxs("nav", { style: {
                            width: '280px',
                            backgroundColor: '#111',
                            minHeight: 'calc(100vh - 73px)',
                            padding: '24px'
                        }, children: [_jsx("div", { style: { marginBottom: '24px' }, children: _jsx("h3", { style: { color: '#888', fontSize: '12px', textTransform: 'uppercase', margin: 0 }, children: "Navigation" }) }), menuItems.map(item => (_jsxs("button", { onClick: () => setActiveSection(item.id), style: {
                                    width: '100%',
                                    padding: '12px 16px',
                                    backgroundColor: activeSection === item.id ? '#ffcc00' : 'transparent',
                                    color: activeSection === item.id ? '#000' : '#f5f5f7',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    textAlign: 'left',
                                    marginBottom: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'all 0.2s ease'
                                }, onMouseEnter: (e) => {
                                    if (activeSection !== item.id) {
                                        e.currentTarget.style.backgroundColor = '#333';
                                    }
                                }, onMouseLeave: (e) => {
                                    if (activeSection !== item.id) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }, children: [_jsx("span", { children: item.icon }), item.label] }, item.id)))] }), _jsx("main", { style: {
                            flex: 1,
                            padding: '24px'
                        }, children: renderContent() })] }), isEmailJSConfigOpen && (_jsx(EmailJSConfig, { onClose: () => setIsEmailJSConfigOpen(false), onConfigSave: () => {
                    // Refresh the configuration status
                    const savedConfig = localStorage.getItem('emailjs_config');
                    if (savedConfig) {
                        try {
                            const config = JSON.parse(savedConfig);
                            const isConfigured = config.publicKey && config.serviceId;
                            setEmailJSConfigured(isConfigured);
                        }
                        catch {
                            setEmailJSConfigured(false);
                        }
                    }
                    else {
                        setEmailJSConfigured(false);
                    }
                    showNotification({
                        type: 'success',
                        title: 'Configuration mise à jour',
                        message: 'La configuration EmailJS a été sauvegardée'
                    });
                } }))] }));
}
