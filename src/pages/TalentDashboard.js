import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import Avatar from '../components/Avatar';
import ProfileEditModal from '../components/ProfileEditModal';
import TalentAgendaView from '../components/TalentAgendaView';
import TalentAppointmentManager from '../components/TalentAppointmentManager';
import { useNotifications } from '../components/NotificationManager';
export default function TalentDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotifications();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(false);
    // Redirection si l'utilisateur n'est pas un talent
    useEffect(() => {
        if (user && user.role !== 'talent') {
            navigate(`/dashboard/${user.role}`, { replace: true });
        }
    }, [user, navigate]);
    // Charger le profil
    useEffect(() => {
        if (user) {
            loadProfile();
        }
    }, [user]);
    const loadProfile = async () => {
        if (!user)
            return;
        setLoading(true);
        try {
            let userProfile = await FirestoreService.getCurrentProfile(user.id, user.role);
            // Si le profil n'existe pas, le créer
            if (!userProfile) {
                const created = await FirestoreService.createProfile(user.id, user.email, user.role);
                if (created) {
                    userProfile = await FirestoreService.getCurrentProfile(user.id, user.role);
                }
            }
            setProfile(userProfile);
        }
        catch (error) {
            console.error('Erreur lors du chargement du profil:', error);
        }
        finally {
            setLoading(false);
        }
    };
    // Affichage de chargement
    if (loading) {
        return (_jsx("div", { style: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                color: '#f5f5f7'
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
    const handleEditProfile = () => {
        setIsEditModalOpen(true);
    };
    const handleViewProfile = () => {
        navigate('/profile');
    };
    const handleSaveProfile = async (updatedProfile) => {
        console.log('Profil mis à jour:', updatedProfile);
        setProfile(updatedProfile);
        // Recharger le profil depuis Firestore pour s'assurer que tout est à jour
        await loadProfile();
    };
    const handleViewJobs = () => {
        navigate('/jobs');
    };
    const handleViewApplications = () => {
        navigate('/my-applications');
    };
    const handleViewMessages = () => {
        navigate('/talent/messages');
    };
    const handleOpenMessages = () => {
        showNotification({
            type: 'info',
            title: 'Fonctionnalité à venir',
            message: 'Les messages seront bientôt disponibles'
        });
        // Ici vous pourriez ouvrir un chat ou naviguer vers une page de messages
    };
    const handleConnectToRecruiters = () => {
        showNotification({
            type: 'info',
            title: 'Fonctionnalité à venir',
            message: 'La connexion aux recruteurs sera bientôt disponible'
        });
        // Ici vous pourriez naviguer vers une page de recherche de recruteurs
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
                    }, children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }, children: [_jsx("h1", { style: { margin: 0, color: '#f5f5f7', fontSize: '24px', fontWeight: 'bold' }, children: "ProdTalent" }), _jsx("span", { style: { color: '#ffcc00', fontSize: '14px', marginTop: '4px' }, children: "Talent Dashboard" })] }), _jsx("div", { style: { flex: 1 } }), _jsx("button", { onClick: handleLogout, style: {
                                padding: '8px 16px',
                                backgroundColor: '#333',
                                color: '#f5f5f7',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }, children: "Se d\u00E9connecter" })] }), _jsxs("section", { style: { marginTop: 24, padding: '0 24px' }, children: [_jsxs("h2", { style: { color: '#ffcc00' }, children: ["Bienvenue ", user.displayName || (user.email ? user.email.split('@')[0] : 'Utilisateur')] }), _jsx("p", { children: "G\u00E9rez votre profil, vos comp\u00E9tences et vos opportunit\u00E9s." }), profile && (_jsxs("div", { style: {
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
                                                } }) }), _jsx("div", { style: { flex: 1, padding: '20px' }, children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }, children: [_jsxs("div", { children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, marginBottom: '12px' }, children: "Mon Profil" }), _jsx("h4", { style: { color: '#f5f5f7', margin: '0 0 8px 0' }, children: profile.displayName || (profile.email ? profile.email.split('@')[0] : 'Utilisateur') }), _jsxs("p", { style: { color: '#888', margin: '0 0 4px 0' }, children: [_jsx("strong", { children: "R\u00F4le:" }), " ", profile.role] }), _jsxs("p", { style: { color: '#888', margin: '0' }, children: [_jsx("strong", { children: "Membre depuis:" }), " ", profile.createdAt.toLocaleDateString()] })] }), _jsx("button", { onClick: handleViewProfile, style: {
                                                            padding: '8px 16px',
                                                            backgroundColor: 'transparent',
                                                            color: '#ffcc00',
                                                            border: '0.5px solid #ffcc00',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            marginTop: '12px',
                                                            width: '140px',
                                                            textAlign: 'left',
                                                            alignSelf: 'flex-end'
                                                        }, children: "Voir Profil Complet" })] }) })] }), profile && (_jsxs("div", { style: { padding: '0 20px 20px 20px' }, children: [profile.bio && (_jsxs("p", { style: { color: '#f5f5f7', marginTop: '12px', marginBottom: '8px' }, children: [_jsx("strong", { children: "Bio:" }), " ", profile.bio] })), (profile.linkedinUrl || profile.githubUrl) && (_jsxs("div", { style: { marginTop: '12px' }, children: [_jsx("p", { style: { color: '#888', margin: '0 0 8px 0', fontSize: '14px' }, children: _jsx("strong", { children: "Liens:" }) }), _jsxs("div", { style: { display: 'flex', gap: '12px' }, children: [profile.linkedinUrl && (_jsx("a", { href: profile.linkedinUrl, target: "_blank", rel: "noopener noreferrer", style: {
                                                                color: '#ffcc00',
                                                                textDecoration: 'none',
                                                                fontSize: '14px'
                                                            }, children: "\uD83D\uDD17 LinkedIn" })), profile.githubUrl && (_jsx("a", { href: profile.githubUrl, target: "_blank", rel: "noopener noreferrer", style: {
                                                                color: '#ffcc00',
                                                                textDecoration: 'none',
                                                                fontSize: '14px'
                                                            }, children: "\uD83D\uDC19 GitHub" }))] })] })), profile.cvUrl && (_jsx("div", { style: { marginTop: '12px' }, children: _jsx("a", { href: profile.cvUrl, target: "_blank", rel: "noopener noreferrer", style: {
                                                    color: '#ffcc00',
                                                    textDecoration: 'none',
                                                    fontSize: '14px'
                                                }, children: "\uD83D\uDCC4 Voir mon CV" }) }))] }))] })), _jsxs("div", { style: {
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
                                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }, children: "Compl\u00E9ter le Profil" }), _jsx("p", { style: { color: '#f5f5f7', marginBottom: '16px' }, children: "Compl\u00E9tez votre profil pour \u00EAtre visible des recruteurs" }), _jsx("button", { onClick: handleEditProfile, style: {
                                                padding: '8px 16px',
                                                backgroundColor: 'transparent',
                                                color: '#ffcc00',
                                                border: '0.5px solid #ffcc00',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginTop: 'auto',
                                                width: '140px',
                                                textAlign: 'left'
                                            }, children: "\u00C9diter le profil" })] }), _jsxs("div", { style: {
                                        backgroundColor: '#111',
                                        padding: 20,
                                        borderRadius: 4,
                                        border: 'transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '200px'
                                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }, children: "Messages" }), _jsx("p", { style: { color: '#f5f5f7', marginBottom: '16px' }, children: "Communiquez avec les recruteurs et coaches" }), _jsx("button", { onClick: handleViewMessages, style: {
                                                padding: '8px 16px',
                                                backgroundColor: 'transparent',
                                                color: '#ffcc00',
                                                border: '0.5px solid #ffcc00',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginTop: 'auto',
                                                width: '140px',
                                                textAlign: 'left'
                                            }, children: "Voir mes messages" })] }), _jsxs("div", { style: {
                                        backgroundColor: '#111',
                                        padding: 20,
                                        borderRadius: 4,
                                        border: 'transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '200px'
                                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }, children: "Mes Recommandations" }), _jsx("p", { style: { color: '#f5f5f7', marginBottom: '16px' }, children: "Recommandations envoy\u00E9es par vos coaches" }), _jsx("button", { onClick: () => navigate('/talent/recommendations'), style: {
                                                padding: '8px 16px',
                                                backgroundColor: 'transparent',
                                                color: '#ffcc00',
                                                border: '0.5px solid #ffcc00',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginTop: 'auto',
                                                width: '140px',
                                                textAlign: 'left'
                                            }, children: "Voir mes recommandations" })] }), _jsxs("div", { style: {
                                        backgroundColor: '#111',
                                        padding: 20,
                                        borderRadius: 4,
                                        border: 'transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '200px'
                                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }, children: "Agenda de Coaching" }), _jsx("p", { style: { color: '#f5f5f7', marginBottom: '16px' }, children: "Consultez l'agenda et r\u00E9servez votre cr\u00E9neau" }), _jsx("button", { onClick: () => setIsCalendarOpen(true), style: {
                                                padding: '8px 16px',
                                                backgroundColor: 'transparent',
                                                color: '#ffcc00',
                                                border: '0.5px solid #ffcc00',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginTop: 'auto',
                                                width: '140px',
                                                textAlign: 'left'
                                            }, children: "Voir l'agenda" })] }), _jsxs("div", { style: {
                                        backgroundColor: '#111',
                                        padding: 20,
                                        borderRadius: 4,
                                        border: 'transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '200px'
                                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }, children: "Mes Rendez-vous" }), _jsx("p", { style: { color: '#f5f5f7', marginBottom: '16px' }, children: "Consultez vos rendez-vous et leur statut" }), _jsx("button", { onClick: () => setIsAppointmentsOpen(true), style: {
                                                padding: '8px 16px',
                                                backgroundColor: 'transparent',
                                                color: '#ffcc00',
                                                border: '0.5px solid #ffcc00',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginTop: 'auto',
                                                width: '140px',
                                                textAlign: 'left'
                                            }, children: "Voir mes rendez-vous" })] }), _jsxs("div", { style: {
                                        backgroundColor: '#111',
                                        padding: 20,
                                        borderRadius: 4,
                                        border: 'transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '200px'
                                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }, children: "Recruteurs" }), _jsx("p", { style: { color: '#f5f5f7', marginBottom: '16px' }, children: "Trouvez et connectez-vous avec des recruteurs" }), _jsx("button", { onClick: handleConnectToRecruiters, style: {
                                                padding: '8px 16px',
                                                backgroundColor: 'transparent',
                                                color: '#ffcc00',
                                                border: '0.5px solid #ffcc00',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginTop: 'auto',
                                                width: '140px',
                                                textAlign: 'left'
                                            }, children: "Voir les recruteurs" })] }), _jsxs("div", { style: {
                                        backgroundColor: '#111',
                                        padding: 20,
                                        borderRadius: 4,
                                        border: 'transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '200px'
                                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }, children: "Offres d'emploi" }), _jsx("p", { style: { color: '#f5f5f7', marginBottom: '16px' }, children: "D\u00E9couvrez les opportunit\u00E9s disponibles" }), _jsx("button", { onClick: handleViewJobs, style: {
                                                padding: '8px 16px',
                                                backgroundColor: 'transparent',
                                                color: '#ffcc00',
                                                border: '0.5px solid #ffcc00',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginTop: 'auto',
                                                width: '140px',
                                                textAlign: 'left'
                                            }, children: "Voir les offres" })] }), _jsxs("div", { style: {
                                        backgroundColor: '#111',
                                        padding: 20,
                                        borderRadius: 4,
                                        border: 'transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '200px'
                                    }, children: [_jsx("h3", { style: { color: '#ffcc00', marginTop: 0, fontWeight: 500, marginBottom: '16px' }, children: "Mes candidatures" }), _jsx("p", { style: { color: '#f5f5f7', marginBottom: '16px' }, children: "Suivez l'\u00E9tat de vos candidatures" }), _jsx("button", { onClick: handleViewApplications, style: {
                                                padding: '8px 16px',
                                                backgroundColor: 'transparent',
                                                color: '#ffcc00',
                                                border: '0.5px solid #ffcc00',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginTop: 'auto',
                                                width: '140px',
                                                textAlign: 'left'
                                            }, children: "Voir mes candidatures" })] })] })] }), profile && (_jsx(ProfileEditModal, { profile: profile, isOpen: isEditModalOpen, onClose: () => setIsEditModalOpen(false), onSave: handleSaveProfile })), isCalendarOpen && (_jsx(TalentAgendaView, { onClose: () => setIsCalendarOpen(false) })), isAppointmentsOpen && (_jsx(TalentAppointmentManager, { onClose: () => setIsAppointmentsOpen(false) }))] }) }));
}
