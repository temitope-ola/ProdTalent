import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import Avatar from '../components/Avatar';
import CoachAvailabilityManager from '../components/CoachAvailabilityManager';
import CoachAppointmentManager from '../components/CoachAppointmentManager';
import CoachRecommendationManager from '../components/CoachRecommendationManager';
import { useNotifications } from '../components/NotificationManager';
import EmailJSConfig from '../components/EmailJSConfig';
export default function CoachDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotifications();
    const [profile, setProfile] = useState(null);
    const [talents, setTalents] = useState([]);
    const [recruteurs, setRecruteurs] = useState([]);
    const [isAgendaOpen, setIsAgendaOpen] = useState(false);
    const [isAppointmentManagerOpen, setIsAppointmentManagerOpen] = useState(false);
    const [isRecommendationManagerOpen, setIsRecommendationManagerOpen] = useState(false);
    const [isEmailJSConfigOpen, setIsEmailJSConfigOpen] = useState(false);
    const [lastAppointmentCount, setLastAppointmentCount] = useState(0);
    const [emailJSConfigured, setEmailJSConfigured] = useState(false);
    const [loading, setLoading] = useState(false);
    // Redirection si l'utilisateur n'est pas un coach
    useEffect(() => {
        if (user && user.role !== 'coach') {
            navigate(`/dashboard/${user.role}`, { replace: true });
        }
    }, [user, navigate]);
    // Charger le profil et les données
    useEffect(() => {
        if (user) {
            loadProfile();
            loadTalents();
            loadRecruteurs();
        }
    }, [user]);
    // Vérifier les nouveaux rendez-vous toutes les 30 secondes
    useEffect(() => {
        if (!user)
            return;
        // Vérification initiale
        const initialCheck = async () => {
            try {
                const { AppointmentService } = await import('../services/appointmentService');
                const result = await AppointmentService.getCoachAppointments(user.id);
                if (result.success && result.data) {
                    setLastAppointmentCount(result.data.length);
                }
            }
            catch (error) {
                console.error('Erreur lors de la vérification initiale:', error);
            }
        };
        initialCheck();
        // Vérification périodique
        const interval = setInterval(checkNewAppointments, 30000); // 30 secondes
        return () => clearInterval(interval);
    }, [user, lastAppointmentCount]);
    // Vérifier si EmailJS est configuré
    useEffect(() => {
        const checkEmailJSConfig = () => {
            const savedConfig = localStorage.getItem('emailjs_config');
            if (savedConfig) {
                try {
                    const config = JSON.parse(savedConfig);
                    const isConfigured = config.publicKey && config.serviceId &&
                        config.templates?.coachingReservation &&
                        config.templates?.appointmentUpdate;
                    setEmailJSConfigured(isConfigured);
                }
                catch (error) {
                    setEmailJSConfigured(false);
                }
            }
            else {
                setEmailJSConfigured(false);
            }
        };
        checkEmailJSConfig();
        // Vérifier à chaque fois que la page se charge
        window.addEventListener('storage', checkEmailJSConfig);
        return () => window.removeEventListener('storage', checkEmailJSConfig);
    }, []);
    const loadProfile = async () => {
        if (!user)
            return;
        setLoading(true);
        try {
            const userProfile = await FirestoreService.getCurrentProfile(user.id, user.role);
            setProfile(userProfile);
        }
        catch (error) {
            console.error('Erreur lors du chargement du profil:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const loadTalents = async () => {
        if (!user)
            return;
        try {
            const talentsList = await FirestoreService.getAllTalents();
            setTalents(talentsList);
        }
        catch (error) {
            console.error('Erreur lors du chargement des talents:', error);
        }
    };
    const loadRecruteurs = async () => {
        if (!user)
            return;
        try {
            const recruteursList = await FirestoreService.getAllRecruteurs();
            setRecruteurs(recruteursList);
        }
        catch (error) {
            console.error('Erreur lors du chargement des recruteurs:', error);
        }
    };
    // Vérifier les nouveaux rendez-vous
    const checkNewAppointments = async () => {
        if (!user)
            return;
        try {
            const { AppointmentService } = await import('../services/appointmentService');
            const result = await AppointmentService.getCoachAppointments(user.id);
            if (result.success && result.data) {
                const currentCount = result.data.length;
                if (currentCount > lastAppointmentCount && lastAppointmentCount > 0) {
                    const newAppointments = result.data.slice(lastAppointmentCount);
                    newAppointments.forEach(appointment => {
                        if (appointment.status === 'en_attente') {
                            showNotification({
                                type: 'info',
                                title: 'Nouveau rendez-vous',
                                message: `${appointment.talentName} a réservé un créneau le ${appointment.date} à ${appointment.time}`
                            });
                        }
                    });
                }
                setLastAppointmentCount(currentCount);
            }
        }
        catch (error) {
            console.error('Erreur lors de la vérification des nouveaux rendez-vous:', error);
        }
    };
    // Affichage de chargement
    if (loading) {
        return (_jsx("div", { style: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                color: '#ffcc00'
            }, children: "Chargement..." }));
    }
    // Redirection si pas connecté
    if (!user) {
        navigate('/', { replace: true });
        return null;
    }
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/', { replace: true });
        }
        catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    };
    const handleViewTalents = () => {
        navigate('/coach/talents');
    };
    const handleViewRecruteurs = () => {
        navigate('/coach/recruteurs');
    };
    const handleScheduleSession = () => {
        showNotification({
            type: 'info',
            title: 'Fonctionnalité à venir',
            message: 'La planification de session sera bientôt disponible'
        });
        // Ici vous pourriez ouvrir une modale de planification
    };
    const handleCreateRecommendation = () => {
        setIsRecommendationManagerOpen(true);
    };
    const handleOpenMessages = () => {
        navigate('/coach/messages');
    };
    const handleViewJobs = () => {
        navigate('/jobs');
    };
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
                        gap: 16,
                        alignItems: 'center',
                        paddingBottom: 16,
                        borderBottom: '1px solid #333',
                        padding: '0 24px 16px 24px'
                    }, children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }, children: [_jsx("h1", { style: { margin: 0, color: '#f5f5f7', fontSize: '24px', fontWeight: 'bold' }, children: "ProdTalent" }), _jsx("span", { style: { color: '#ffcc00', fontSize: '14px', marginTop: '4px' }, children: "Coach Dashboard" })] }), _jsx("div", { style: { flex: 1 } }), _jsx("button", { onClick: handleLogout, style: {
                                padding: '8px 16px',
                                backgroundColor: '#333',
                                color: '#f5f5f7',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }, children: "Se d\u00E9connecter" })] }), _jsxs("section", { style: { marginTop: 24, padding: '0 24px' }, children: [_jsxs("h2", { style: { color: '#ffcc00' }, children: ["Bienvenue ", user.displayName || (user.email ? user.email.split('@')[0] : 'Utilisateur')] }), _jsx("p", { style: { color: '#f5f5f7' }, children: "Accompagnez les talents et connectez-vous avec les recruteurs." }), profile && (_jsxs("div", { style: {
                                marginBottom: 24,
                                marginTop: 24,
                                padding: 0,
                                backgroundColor: '#111',
                                borderRadius: 4,
                                border: 'transparent',
                                overflow: 'hidden',
                                height: '150px'
                            }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'flex-start' }, children: [_jsx("div", { style: {
                                                width: '150px',
                                                height: '150px',
                                                backgroundColor: '#ffcc00',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '4px 0 0 4px'
                                            }, children: _jsx(Avatar, { email: profile.email, src: profile.avatarUrl, size: "large", editable: true, onImageChange: async (file) => {
                                                    try {
                                                        const avatarUrl = await FirestoreService.uploadAvatar(file);
                                                        await FirestoreService.updateProfile(profile.id, profile.role, { avatarUrl });
                                                        // Recharger le profil
                                                        const updatedProfile = await FirestoreService.getCurrentProfile(profile.id, profile.role);
                                                        if (updatedProfile) {
                                                            setProfile(updatedProfile);
                                                        }
                                                    }
                                                    catch (error) {
                                                        console.error('Erreur lors de l\'upload de l\'avatar:', error);
                                                    }
                                                } }) }), _jsxs("div", { style: { flex: 1, padding: '20px' }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, marginBottom: '12px' }, children: "Mon Profil" }), _jsx("h4", { style: { color: '#f5f5f7', margin: '0 0 8px 0' }, children: profile.displayName || (profile.email ? profile.email.split('@')[0] : 'Utilisateur') }), _jsxs("p", { style: { color: '#888', margin: '0 0 4px 0' }, children: [_jsx("strong", { children: "R\u00F4le:" }), " ", profile.role] }), _jsxs("p", { style: { color: '#888', margin: '0' }, children: [_jsx("strong", { children: "Membre depuis:" }), " ", profile.createdAt.toLocaleDateString()] })] })] }), profile.bio && (_jsxs("p", { style: { color: '#f5f5f7', marginTop: '12px' }, children: [_jsx("strong", { children: "Bio:" }), " ", profile.bio] }))] })), _jsxs("div", { style: {
                                marginBottom: 24,
                                padding: 20,
                                backgroundColor: '#111',
                                borderRadius: 4,
                                border: 'transparent'
                            }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0 }, children: "Statistiques" }), _jsxs("p", { style: { color: '#f5f5f7', fontWeight: 500 }, children: ["Talents disponibles: ", talents.length] }), _jsxs("p", { style: { color: '#f5f5f7', fontWeight: 500 }, children: ["Recruteurs actifs: ", recruteurs.length] })] }), _jsxs("div", { style: {
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: 24,
                                marginTop: 32
                            }, children: [_jsxs("div", { style: {
                                        backgroundColor: '#111',
                                        padding: 20,
                                        borderRadius: 4,
                                        border: 'transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '200px'
                                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }, children: "Mes Talents" }), _jsxs("p", { style: { color: '#f5f5f7', marginBottom: '16px' }, children: ["G\u00E9rez vos talents accompagn\u00E9s (", talents.length, " disponibles)"] }), _jsx("button", { onClick: handleViewTalents, style: {
                                                padding: '8px 16px',
                                                backgroundColor: 'transparent',
                                                color: '#ffcc00',
                                                border: '0.5px solid #ffcc00',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginTop: 'auto',
                                                width: '140px',
                                                textAlign: 'left'
                                            }, children: "Voir mes talents" })] }), _jsxs("div", { style: {
                                        backgroundColor: '#111',
                                        padding: 20,
                                        borderRadius: 4,
                                        border: 'transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '200px'
                                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }, children: "Mes Recruteurs" }), _jsxs("p", { style: { color: '#f5f5f7', marginBottom: '16px' }, children: ["G\u00E9rez vos recruteurs partenaires (", recruteurs.length, " actifs)"] }), _jsx("button", { onClick: handleViewRecruteurs, style: {
                                                padding: '8px 16px',
                                                backgroundColor: 'transparent',
                                                color: '#ffcc00',
                                                border: '0.5px solid #ffcc00',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginTop: 'auto',
                                                width: '140px',
                                                textAlign: 'left'
                                            }, children: "Voir mes recruteurs" })] }), _jsxs("div", { style: {
                                        backgroundColor: '#111',
                                        padding: 20,
                                        borderRadius: 4,
                                        border: 'transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '200px'
                                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }, children: "Sessions de Coaching" }), _jsx("p", { style: { color: '#f5f5f7', marginBottom: '16px' }, children: "Planifiez et g\u00E9rez vos sessions" }), _jsxs("div", { style: { display: 'flex', gap: 12, marginTop: 'auto', flexWrap: 'wrap' }, children: [_jsx("button", { onClick: () => setIsAgendaOpen(true), style: {
                                                        padding: '8px 16px',
                                                        backgroundColor: 'transparent',
                                                        color: '#ffcc00',
                                                        border: '0.5px solid #ffcc00',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        width: '140px',
                                                        textAlign: 'left'
                                                    }, children: "Configurer l'agenda" }), _jsx("button", { onClick: () => setIsAppointmentManagerOpen(true), style: {
                                                        padding: '8px 16px',
                                                        backgroundColor: 'transparent',
                                                        color: '#ffcc00',
                                                        border: '0.5px solid #ffcc00',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        width: '140px',
                                                        textAlign: 'left'
                                                    }, children: "G\u00E9rer les rendez-vous" })] })] }), _jsxs("div", { style: {
                                        backgroundColor: '#111',
                                        padding: 20,
                                        borderRadius: 4,
                                        border: 'transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '200px'
                                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }, children: "Recommandations" }), _jsx("p", { style: { color: '#f5f5f7', marginBottom: '16px' }, children: "Recommandez vos talents aux recruteurs" }), _jsx("button", { onClick: handleCreateRecommendation, style: {
                                                padding: '8px 16px',
                                                backgroundColor: 'transparent',
                                                color: '#ffcc00',
                                                border: '0.5px solid #ffcc00',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginTop: 'auto',
                                                width: '140px',
                                                textAlign: 'left'
                                            }, children: "Cr\u00E9er une recommandation" })] }), _jsxs("div", { style: {
                                        backgroundColor: '#111',
                                        padding: 20,
                                        borderRadius: 4,
                                        border: 'transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '200px'
                                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }, children: "Messages" }), _jsx("p", { style: { color: '#f5f5f7', marginBottom: '16px' }, children: "Communiquez avec les talents et recruteurs" }), _jsx("button", { onClick: handleOpenMessages, style: {
                                                padding: '8px 16px',
                                                backgroundColor: 'transparent',
                                                color: '#ffcc00',
                                                border: '0.5px solid #ffcc00',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginTop: 'auto',
                                                width: '140px',
                                                textAlign: 'left'
                                            }, children: "Ouvrir les messages" })] }), _jsxs("div", { style: {
                                        backgroundColor: '#111',
                                        padding: 20,
                                        borderRadius: 4,
                                        border: 'transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '200px'
                                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }, children: "Notifications Email" }), _jsx("p", { style: { color: '#f5f5f7', marginBottom: '16px' }, children: "Configurez les notifications par email pour les rendez-vous" }), _jsx("button", { onClick: () => setIsEmailJSConfigOpen(true), style: {
                                                padding: '8px 16px',
                                                backgroundColor: emailJSConfigured ? '#61bfac' : 'transparent',
                                                color: emailJSConfigured ? '#000' : '#ffcc00',
                                                border: '0.5px solid #ffcc00',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginTop: 'auto',
                                                width: '140px',
                                                textAlign: 'left',
                                                position: 'relative'
                                            }, children: emailJSConfigured ? '✅ EmailJS Configuré' : 'Configurer EmailJS' })] }), _jsxs("div", { style: {
                                        backgroundColor: '#111',
                                        padding: 20,
                                        borderRadius: 4,
                                        border: 'transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '200px'
                                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }, children: "Offres d'emploi" }), _jsx("p", { style: { color: '#f5f5f7', marginBottom: '16px' }, children: "D\u00E9couvrez les derni\u00E8res offres d'emploi disponibles" }), _jsx("button", { onClick: handleViewJobs, style: {
                                                padding: '8px 16px',
                                                backgroundColor: 'transparent',
                                                color: '#ffcc00',
                                                border: '0.5px solid #ffcc00',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginTop: 'auto',
                                                width: '140px',
                                                textAlign: 'left'
                                            }, children: "Voir les offres" })] })] })] }), isAgendaOpen && (_jsx(CoachAvailabilityManager, { onClose: () => setIsAgendaOpen(false) })), isAppointmentManagerOpen && (_jsx(CoachAppointmentManager, { onClose: () => setIsAppointmentManagerOpen(false) })), isRecommendationManagerOpen && (_jsx(CoachRecommendationManager, { isOpen: isRecommendationManagerOpen, onClose: () => setIsRecommendationManagerOpen(false) })), isEmailJSConfigOpen && (_jsx(EmailJSConfig, { onClose: () => {
                        setIsEmailJSConfigOpen(false);
                        // Rafraîchir l'état de la configuration
                        const savedConfig = localStorage.getItem('emailjs_config');
                        if (savedConfig) {
                            try {
                                const config = JSON.parse(savedConfig);
                                const isConfigured = config.publicKey && config.serviceId &&
                                    config.templates?.coachingReservation &&
                                    config.templates?.appointmentUpdate;
                                setEmailJSConfigured(isConfigured);
                            }
                            catch (error) {
                                setEmailJSConfigured(false);
                            }
                        }
                        else {
                            setEmailJSConfigured(false);
                        }
                    } }))] }) }));
}
